const fs = require('fs');
const path = require('path');

// SVG content
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <g fill="white">
    <rect x="20" y="35" width="60" height="8" rx="4"/>
    <rect x="20" y="50" width="60" height="8" rx="4"/>
    <circle cx="30" cy="70" r="8"/>
    <circle cx="70" cy="70" r="8"/>
  </g>
</svg>`;

async function generateIcons() {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');

    const sizes = [192, 512];
    const publicDir = path.join(__dirname, '..', 'public');

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `pwa-${size}x${size}.png`);

      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Created: pwa-${size}x${size}.png`);
    }

    console.log('PWA icons generated successfully!');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('sharp not found, installing...');
      const { execSync } = require('child_process');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      console.log('Please run this script again.');
    } else {
      console.error('Error:', err);
    }
  }
}

generateIcons();
