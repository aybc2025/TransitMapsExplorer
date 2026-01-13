import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TransitSystemSummary } from '@/types';
import { SYSTEM_TYPES, MAP_CONFIG } from '@/config/constants';
import { Button } from '@/components/ui/button';

// Fix for default markers not showing
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface WorldMapProps {
  systems: TransitSystemSummary[];
  height?: string;
  onSystemClick?: (system: TransitSystemSummary) => void;
}

// Custom marker icons by type
function createCustomIcon(type: string): L.DivIcon {
  const systemType = SYSTEM_TYPES[type as keyof typeof SYSTEM_TYPES];
  const color = systemType?.color || '#6B7280';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${systemType?.icon || '🚇'}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Map controller component
function MapController({ systems }: { systems: TransitSystemSummary[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (systems.length > 0) {
      const bounds = L.latLngBounds(
        systems.map(s => [s.coordinates.lat, s.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [systems, map]);

  return null;
}

export function WorldMap({ systems, height = '500px', onSystemClick }: WorldMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Memoize markers for performance
  const markers = useMemo(() => {
    return systems.map((system) => ({
      system,
      icon: createCustomIcon(system.type),
      position: [system.coordinates.lat, system.coordinates.lng] as [number, number],
    }));
  }, [systems]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border" style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={[MAP_CONFIG.center.lat, MAP_CONFIG.center.lng]}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="w-full h-full"
        style={{ background: '#e5e7eb' }}
      >
        <TileLayer
          attribution={MAP_CONFIG.attribution}
          url={MAP_CONFIG.tileUrl}
        />
        
        <MapController systems={systems} />
        
        {markers.map(({ system, icon, position }) => (
          <Marker
            key={system.id}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => onSystemClick?.(system),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1" dir="rtl">
                <h3 className="font-bold text-base mb-1">{system.name.he}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {system.city.he}, {system.country.he}
                </p>
                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span>{system.stats.stations} תחנות</span>
                  <span>{system.stats.length_km} ק״מ</span>
                  <span>{system.stats.lines} קווים</span>
                </div>
                <Link to={`/system/${system.id}`}>
                  <Button size="sm" className="w-full">
                    צפה בפרטים
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]" dir="rtl">
        <div className="font-semibold mb-2">מקרא</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(SYSTEM_TYPES).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: value.color }}
              />
              <span>{value.he}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
