import { Link } from 'react-router-dom';
import { MapPin, Train } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TransitSystemSummary } from '@/types';
import { SYSTEM_TYPES } from '@/config/constants';
import { Badge } from '@/components/ui/badge';

interface SystemCardProps {
  system: TransitSystemSummary;
  index?: number;
}

// מפה של קודי מדינות לדגלים
function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function SystemCard({ system, index = 0 }: SystemCardProps) {
  const systemType = SYSTEM_TYPES[system.type as keyof typeof SYSTEM_TYPES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/system/${system.id}`} className="block">
        <article className="system-card group h-full">
          {/* Image */}
          <div className="relative h-44 overflow-hidden bg-muted">
            {(system.headerImage || system.thumbnail) ? (
              <img
                src={system.headerImage || system.thumbnail}
                alt={system.name.he}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <Train className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Type Badge */}
            <Badge 
              className="absolute top-3 right-3"
              style={{ backgroundColor: systemType?.color || '#6B7280' }}
            >
              <span className="ml-1">{systemType?.icon}</span>
              {systemType?.he || system.type}
            </Badge>
            
            {/* Line Colors */}
            <div className="absolute bottom-3 right-3 flex gap-1">
              {system.colors.slice(0, 6).map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              {system.colors.length > 6 && (
                <div className="w-3 h-3 rounded-full bg-black/50 text-white text-[8px] flex items-center justify-center">
                  +{system.colors.length - 6}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {system.name.he}
              </h3>
              <span className="text-2xl flex-shrink-0" title={system.country.en}>
                {getFlag(system.country.code)}
              </span>
            </div>
            
            {/* Location */}
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="h-3.5 w-3.5" />
              {system.city.he}, {system.country.he}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-primary">
                  {system.stats.stations}
                </div>
                <div className="text-xs text-muted-foreground">תחנות</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-primary">
                  {system.stats.length_km}
                </div>
                <div className="text-xs text-muted-foreground">ק״מ</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-primary">
                  {system.stats.lines}
                </div>
                <div className="text-xs text-muted-foreground">קווים</div>
              </div>
            </div>

            {/* Year */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">נפתח</span>
              <span className="font-semibold">{system.stats.opened_year}</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
