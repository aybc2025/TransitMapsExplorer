import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Loader2, Map as MapIcon, Layers } from 'lucide-react';

// ייבוא נתוני ה-GeoJSON
// אחרי שתריץ את הסקריפט, הקובץ הזה יהיה זמין
import { TRANSIT_GEOJSON } from '@/data/transit-geojson-data';

interface TransitMapProps {
  system: {
    id: string;
    name: {
      he: string;
      en: string;
    };
    coordinates: {
      lat: number;
      lng: number;
    };
    images?: {
      transitMap?: string;
    };
  };
  height?: string;
  showFullMap?: boolean;
}

export function TransitMap({ 
  system, 
  height = '600px',
  showFullMap = true 
}: TransitMapProps) {
  const [activeTab, setActiveTab] = useState('full-map');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const legendMapRef = useRef<L.Map | null>(null);
  const legendMapContainerRef = useRef<HTMLDivElement>(null);

  // קבלת נתוני המערכת
  const systemData = TRANSIT_GEOJSON[system.id];
  const hasGeoData = systemData && systemData.lines && systemData.lines.length > 0;

  // יצירת מפה עם קווים צבעוניים - טאב מפה מלאה
  useEffect(() => {
    if (activeTab === 'full-map' && mapContainerRef.current && !mapRef.current && hasGeoData) {
      setIsLoading(true);

      // יצירת המפה
      const map = L.map(mapContainerRef.current, {
        center: systemData.center,
        zoom: systemData.zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      mapRef.current = map;

      // הוספת שכבת המפה
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      // ציור הקווים
      systemData.lines.forEach(line => {
        if (line.coordinates && line.coordinates.length > 0) {
          const polyline = L.polyline(
            line.coordinates.map(coord => [coord[1], coord[0]]), // המרה מ-[lng, lat] ל-[lat, lng]
            {
              color: line.color,
              weight: 4,
              opacity: 0.8,
              smoothFactor: 1
            }
          ).addTo(map);

          // Tooltip עם שם הקו
          polyline.bindTooltip(line.name, {
            sticky: true,
            className: 'transit-line-tooltip'
          });

          // Popup עם פרטי הקו
          polyline.bindPopup(`
            <div style="direction: rtl; text-align: right; font-family: Assistant, sans-serif;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background-color: ${line.color}; border-radius: 50%; border: 2px solid white;"></div>
                <strong style="font-size: 16px;">${line.name}</strong>
              </div>
              <div style="color: #666; font-size: 14px;">
                ${line.shortName ? `קו: ${line.shortName}` : ''}
              </div>
            </div>
          `);
        }
      });

      // התאמת התצוגה לכל הקווים
      if (systemData.lines.length > 0) {
        const allCoords = systemData.lines.flatMap(line => 
          line.coordinates.map(coord => [coord[1], coord[0]] as [number, number])
        );
        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

      setTimeout(() => setIsLoading(false), 500);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, system.id, hasGeoData, systemData]);

  // יצירת מפה למיקום - טאב מפת מיקום
  useEffect(() => {
    if (activeTab === 'location' && legendMapContainerRef.current && !legendMapRef.current) {
      setIsLoading(true);

      const map = L.map(legendMapContainerRef.current, {
        center: [system.coordinates.lat, system.coordinates.lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      legendMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      // סימון המרכז
      const marker = L.circleMarker([system.coordinates.lat, system.coordinates.lng], {
        color: '#ffffff',
        fillColor: '#0078BF',
        fillOpacity: 1,
        weight: 3,
        radius: 10
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; direction: rtl; font-family: Assistant, sans-serif;">
          <strong style="font-size: 16px;">${system.name.he}</strong><br/>
          <span style="color: #666; font-size: 14px;">${system.name.en}</span>
        </div>
      `);

      setTimeout(() => setIsLoading(false), 300);
    }

    return () => {
      if (legendMapRef.current) {
        legendMapRef.current.remove();
        legendMapRef.current = null;
      }
    };
  }, [activeTab, system]);

  const metrolineMapUrl = `https://www.metrolinemap.com/metro/${system.id.toLowerCase().replace('_', '-').replace(/-ttc|-mtr|-ubahn/g, '')}/`;

  // אם אין נתוני GeoJSON - הצג הודעה
  if (!hasGeoData) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              נתוני המפה עבור {system.name.he} עדיין לא זמינים
            </p>
            <a
              href={metrolineMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              צפה במפה ב-MetroLineMap
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none border-b grid grid-cols-2">
            <TabsTrigger value="full-map" className="gap-2">
              <Layers className="h-4 w-4" />
              מפה מלאה עם קווים
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-2">
              <MapIcon className="h-4 w-4" />
              מפת קווים
            </TabsTrigger>
          </TabsList>

          {/* מפה מלאה עם קווים צבעוניים */}
          <TabsContent value="full-map" className="m-0 p-0">
            <div className="relative" style={{ height }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* אגדת צבעים מרחפת */}
              {systemData.lines && systemData.lines.length > 0 && (
                <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-xs max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-semibold mb-3 text-right">
                    קווי {system.name.he}
                  </h3>
                  <div className="space-y-2">
                    {systemData.lines.map((line, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 justify-end text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {line.name}
                        </span>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: line.color }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div 
                ref={mapContainerRef} 
                style={{ height: '100%', width: '100%' }}
                className="rounded-b-lg"
              />
            </div>
          </TabsContent>

          {/* מפת קווים - תמונה מ-UrbanRail.Net */}
          <TabsContent value="location" className="m-0 p-0">
            <div className="relative" style={{ height }}>
              {/* בדיקה אם יש תמונת מפה */}
              {system.images?.transitMap ? (
                <div className="h-full w-full flex items-center justify-center bg-muted/30 p-4">
                  <img
                    src={system.images.transitMap}
                    alt={`מפת ${system.name.he}`}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(system.images?.transitMap, '_blank')}
                    title="לחץ להגדלה"
                  />
                </div>
              ) : (
                <>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <div
                    ref={legendMapContainerRef}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-lg"
                  />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* קישורים חיצוניים */}
        <div className="p-4 bg-muted/50 border-t">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                system.name.en + ' metro'
              )}/@${system.coordinates.lat},${system.coordinates.lng},12z`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Google Maps
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href={metrolineMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              MetroLineMap (מקור)
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
