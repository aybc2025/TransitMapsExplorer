#!/usr/bin/env node

/**
 * Transit Maps Data Extraction Script
 *
 * This script extracts transit map data for all systems:
 * 1. Downloads map images from UrbanRail.net
 * 2. Fetches GeoJSON line data from OpenStreetMap Overpass API
 * 3. Generates TypeScript files with line coordinates
 *
 * Usage:
 *   node extract-transit-data.js [options]
 *
 * Options:
 *   --images-only     Only download map images
 *   --geojson-only    Only fetch GeoJSON data
 *   --system=<id>     Process only specific system (e.g., --system=new-york-subway)
 *   --dry-run         Show what would be done without making changes
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  mappingFile: path.join(__dirname, 'transit-systems-mapping.json'),
  imagesOutputDir: path.join(__dirname, '..', 'public', 'transit-maps'),
  geojsonOutputDir: path.join(__dirname, '..', 'src', 'data', 'transit-geojson-data'),
  urbanrailBaseUrl: 'https://www.urbanrail.net/',
  overpassApiUrls: [
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ],
  requestDelay: 2000, // ms between requests to be polite to servers
  overpassDelay: 5000, // ms between Overpass requests (they need more time)
  overpassTimeout: 90, // seconds
  maxRetries: 3,
};

// Helper: Sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Convert system-id to camelCase variable name
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper: Download file from URL
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Helper: Make HTTP POST request
function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
        } else {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Download map image from UrbanRail
async function downloadMapImage(systemId, systemData, dryRun = false) {
  const imageUrl = CONFIG.urbanrailBaseUrl + systemData.image_path;
  const ext = path.extname(systemData.image_path) || '.png';
  const destPath = path.join(CONFIG.imagesOutputDir, `${systemId}${ext}`);

  console.log(`  [IMAGE] ${systemId}: ${imageUrl}`);

  if (dryRun) {
    console.log(`    -> Would save to: ${destPath}`);
    return { success: true, dryRun: true };
  }

  try {
    await downloadFile(imageUrl, destPath);
    const stats = fs.statSync(destPath);
    console.log(`    -> Saved: ${destPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    return { success: true, size: stats.size };
  } catch (error) {
    console.error(`    -> ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Fetch GeoJSON from Overpass API with retries and fallback servers
async function fetchOverpassData(systemId, systemData, dryRun = false) {
  const [minLat, minLon, maxLat, maxLon] = systemData.bbox;

  // Query for subway/metro routes with geometry output
  const query = `
[out:json][timeout:${CONFIG.overpassTimeout}];
(
  relation["route"="subway"](${minLat},${minLon},${maxLat},${maxLon});
  relation["route"="metro"](${minLat},${minLon},${maxLat},${maxLon});
  relation["route"="light_rail"](${minLat},${minLon},${maxLat},${maxLon});
);
out geom;
`.trim();

  console.log(`  [OVERPASS] ${systemId}: bbox=[${minLat},${minLon},${maxLat},${maxLon}]`);

  if (dryRun) {
    console.log(`    -> Would query Overpass API`);
    return { success: true, dryRun: true };
  }

  // Try each server with retries
  for (let serverIdx = 0; serverIdx < CONFIG.overpassApiUrls.length; serverIdx++) {
    const apiUrl = CONFIG.overpassApiUrls[serverIdx];

    for (let retry = 0; retry < CONFIG.maxRetries; retry++) {
      try {
        if (retry > 0 || serverIdx > 0) {
          console.log(`    -> Retry ${retry + 1}/${CONFIG.maxRetries} on server ${serverIdx + 1}...`);
          await sleep(CONFIG.overpassDelay);
        }

        const response = await httpPost(apiUrl, `data=${encodeURIComponent(query)}`);
        const data = JSON.parse(response);

        if (!data.elements || data.elements.length === 0) {
          console.log(`    -> WARNING: No routes found`);
          return { success: false, error: 'No routes found' };
        }

        // Process the data
        const processed = processOverpassDataGeom(data, systemData);
        console.log(`    -> Found ${processed.lines.length} lines`);

        return { success: true, data: processed };
      } catch (error) {
        console.log(`    -> Attempt failed: ${error.message.substring(0, 80)}`);
        if (retry === CONFIG.maxRetries - 1 && serverIdx === CONFIG.overpassApiUrls.length - 1) {
          console.error(`    -> ERROR: All retries exhausted`);
          return { success: false, error: error.message };
        }
      }
    }
  }

  return { success: false, error: 'All servers failed' };
}

// Process Overpass API response with geometry (out geom) into our format
function processOverpassDataGeom(osmData, systemData) {
  const lines = [];
  const seenRefs = new Set();

  // Process relations directly - they contain geometry
  for (const el of osmData.elements) {
    if (el.type !== 'relation' || !el.tags) continue;

    const tags = el.tags;
    const ref = tags.ref || tags.name || `Line ${el.id}`;

    // Skip duplicates (same line, different direction)
    if (seenRefs.has(ref)) continue;
    seenRefs.add(ref);

    // Get coordinates from way members with geometry
    const coordinates = [];
    for (const member of el.members || []) {
      // Skip platforms and stops, only get track/route ways
      if (member.role?.includes('platform') || member.role === 'stop') continue;

      // Get geometry from way members
      if (member.type === 'way' && member.geometry) {
        for (const point of member.geometry) {
          coordinates.push([point.lon, point.lat]);
        }
      }
      // Get geometry from node members (stops have location)
      else if (member.type === 'node' && member.lat && member.lon) {
        // Only add if it's part of the route, not a stop
        if (!member.role || member.role === '') {
          coordinates.push([member.lon, member.lat]);
        }
      }
    }

    if (coordinates.length > 0) {
      lines.push({
        name: cleanLineName(tags.name || ref),
        shortName: ref,
        color: tags.colour || '#888888',
        coordinates: simplifyCoordinates(coordinates, 0.0001),
      });
    }
  }

  // Calculate center
  const [minLat, minLon, maxLat, maxLon] = systemData.bbox;
  const center = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];

  return {
    center,
    zoom: 12,
    lines,
  };
}

// Clean line name (remove system prefix, direction info, etc.)
function cleanLineName(name) {
  // Remove common prefixes like "NYC Subway - ", "Metro Line ", etc.
  return name
    .replace(/^[A-Z]+\s*-\s*/i, '')  // Remove "SYSTEM - " prefix
    .replace(/:\s*.+$/, '')           // Remove ": direction" suffix
    .trim();
}

// Legacy: Process Overpass API response into our format (without out geom)
function processOverpassData(osmData, systemData) {
  const nodes = new Map();
  const ways = new Map();
  const relations = [];

  // Index nodes and ways
  for (const el of osmData.elements) {
    if (el.type === 'node') {
      nodes.set(el.id, { lat: el.lat, lon: el.lon });
    } else if (el.type === 'way') {
      ways.set(el.id, el.nodes || []);
    } else if (el.type === 'relation' && el.tags) {
      relations.push(el);
    }
  }

  // Process relations into lines
  const lines = [];
  const seenRefs = new Set();

  for (const rel of relations) {
    const tags = rel.tags;
    const ref = tags.ref || tags.name || `Line ${rel.id}`;

    // Skip duplicates (same line, different direction)
    if (seenRefs.has(ref)) continue;
    seenRefs.add(ref);

    // Get coordinates from way members
    const coordinates = [];
    for (const member of rel.members || []) {
      if (member.type === 'way' && !member.role?.includes('platform')) {
        const wayNodes = ways.get(member.ref);
        if (wayNodes) {
          for (const nodeId of wayNodes) {
            const node = nodes.get(nodeId);
            if (node) {
              coordinates.push([node.lon, node.lat]);
            }
          }
        }
      }
    }

    if (coordinates.length > 0) {
      lines.push({
        name: tags.name || ref,
        shortName: ref,
        color: tags.colour || '#888888',
        coordinates: simplifyCoordinates(coordinates, 0.0001),
      });
    }
  }

  // Calculate center
  const [minLat, minLon, maxLat, maxLon] = systemData.bbox;
  const center = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];

  return {
    center,
    zoom: 12,
    lines,
  };
}

// Simplify coordinates by removing points that are too close together
function simplifyCoordinates(coords, tolerance) {
  if (coords.length < 3) return coords;

  const result = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = coords[i];
    const dist = Math.sqrt(
      Math.pow(curr[0] - prev[0], 2) + Math.pow(curr[1] - prev[1], 2)
    );
    if (dist > tolerance) {
      result.push(curr);
    }
  }
  result.push(coords[coords.length - 1]);
  return result;
}

// Generate TypeScript file
function generateTypeScriptFile(systemId, data, dryRun = false) {
  const varName = toCamelCase(systemId);
  const destPath = path.join(CONFIG.geojsonOutputDir, `${systemId}.ts`);

  const content = `// נתוני GeoJSON עבור ${systemId}
// מקור: OpenStreetMap via Overpass API

export const ${varName} = ${JSON.stringify(data, null, 2)};
`;

  console.log(`  [TS] ${systemId}: ${data.lines.length} lines`);

  if (dryRun) {
    console.log(`    -> Would save to: ${destPath}`);
    return { success: true, dryRun: true };
  }

  try {
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`    -> Saved: ${destPath}`);
    return { success: true };
  } catch (error) {
    console.error(`    -> ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    imagesOnly: args.includes('--images-only'),
    geojsonOnly: args.includes('--geojson-only'),
    dryRun: args.includes('--dry-run'),
    system: args.find(a => a.startsWith('--system='))?.split('=')[1],
  };

  console.log('='.repeat(60));
  console.log('Transit Maps Data Extraction Script');
  console.log('='.repeat(60));

  if (options.dryRun) {
    console.log('\n** DRY RUN MODE - No changes will be made **\n');
  }

  // Load mapping
  console.log(`\nLoading mapping from: ${CONFIG.mappingFile}`);
  const mapping = JSON.parse(fs.readFileSync(CONFIG.mappingFile, 'utf8'));

  // Filter systems if specific one requested
  let systemIds = Object.keys(mapping.systems);
  if (options.system) {
    if (!mapping.systems[options.system]) {
      console.error(`ERROR: System "${options.system}" not found in mapping`);
      process.exit(1);
    }
    systemIds = [options.system];
  }

  console.log(`Processing ${systemIds.length} systems...\n`);

  // Ensure output directories exist
  if (!options.dryRun) {
    fs.mkdirSync(CONFIG.imagesOutputDir, { recursive: true });
    fs.mkdirSync(CONFIG.geojsonOutputDir, { recursive: true });
  }

  // Results tracking
  const results = {
    images: { success: 0, failed: 0, skipped: 0 },
    geojson: { success: 0, failed: 0, skipped: 0 },
  };

  // Process each system
  for (let i = 0; i < systemIds.length; i++) {
    const systemId = systemIds[i];
    const systemData = mapping.systems[systemId];

    console.log(`\n[${i + 1}/${systemIds.length}] ${systemData.city}, ${systemData.country} (${systemId})`);

    // Download image
    if (!options.geojsonOnly) {
      const imageResult = await downloadMapImage(systemId, systemData, options.dryRun);
      if (imageResult.success) results.images.success++;
      else results.images.failed++;

      await sleep(CONFIG.requestDelay);
    } else {
      results.images.skipped++;
    }

    // Fetch GeoJSON
    if (!options.imagesOnly) {
      const geoResult = await fetchOverpassData(systemId, systemData, options.dryRun);

      if (geoResult.success && geoResult.data) {
        generateTypeScriptFile(systemId, geoResult.data, options.dryRun);
        results.geojson.success++;
      } else if (geoResult.dryRun) {
        results.geojson.success++;
      } else {
        results.geojson.failed++;
      }

      // Use longer delay for Overpass API to avoid rate limiting
      await sleep(CONFIG.overpassDelay);
    } else {
      results.geojson.skipped++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nImages: ${results.images.success} success, ${results.images.failed} failed, ${results.images.skipped} skipped`);
  console.log(`GeoJSON: ${results.geojson.success} success, ${results.geojson.failed} failed, ${results.geojson.skipped} skipped`);

  if (results.images.failed > 0 || results.geojson.failed > 0) {
    console.log('\nSome operations failed. Check the output above for details.');
    process.exit(1);
  }

  console.log('\nDone!');
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
