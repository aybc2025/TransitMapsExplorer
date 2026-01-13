// סוגי נתונים עבור האפליקציה

export interface LocalizedText {
  he: string;
  en: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Country {
  he: string;
  en: string;
  code: string;
}

export interface SystemStats {
  stations: number;
  length_km: number;
  lines: number;
  annual_ridership: number;
  daily_ridership?: number;
  opened_year: number;
  avg_fare?: {
    currency: string;
    symbol: string;
    min: number;
    max: number;
  };
  propulsion?: string;
  operator?: string;
}

// מערכת תחבורה - רשימה
export interface TransitSystemSummary {
  id: string;
  name: LocalizedText;
  city: LocalizedText;
  country: Country;
  continent: string;
  type: string;
  status: string;
  stats: SystemStats;
  coordinates: Coordinates;
  thumbnail: string;
  headerImage?: string; // תמונת כותרת (צילום רכבת/תחנה)
  colors: string[];
}

// קו תחבורה
export interface TransitLine {
  id: string;
  name: LocalizedText;
  color: string;
  stations: number;
  length_km: number;
  opened_year: number;
  terminus?: {
    north?: LocalizedText;
    south?: LocalizedText;
    east?: LocalizedText;
    west?: LocalizedText;
    note?: string;
  };
}

// עובדה מעניינת
export interface FunFact extends LocalizedText {}

// אבן דרך
export interface Milestone {
  year: number;
  event: LocalizedText;
}

// תמונה
export interface GalleryImage {
  url: string;
  caption: LocalizedText;
}

// מערכת תחבורה - פרטים מלאים
export interface TransitSystemFull extends TransitSystemSummary {
  nicknames?: string[];
  description: LocalizedText;
  lines?: TransitLine[];
  fun_facts?: FunFact[];
  milestones?: Milestone[];
  images?: {
    header: string;
    thumbnail: string;
    transitMap?: string; // מפת הקווים מ-UrbanRail.Net
    gallery?: GalleryImage[];
  };
  map_url?: string;
  interactive_map_url?: string;
  official_website?: string;
  wikipedia?: LocalizedText;
}

// סינון
export interface FilterState {
  continent: string | null;
  type: string | null;
  status: string | null;
  minStations: number | null;
  maxStations: number | null;
  era: string | null;
  searchQuery: string;
}

// מיון
export type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'stations_desc' 
  | 'stations_asc'
  | 'length_desc'
  | 'length_asc'
  | 'year_asc'
  | 'year_desc'
  | 'ridership_desc'
  | 'ridership_asc';

// תצוגה
export type ViewMode = 'grid' | 'list' | 'map';

// ──────────────────────────────────
// Phase 2 Types
// ──────────────────────────────────

// מפה היסטורית
export interface HistoricalMap {
  year: number;
  url: string;
  description?: LocalizedText;
}

// אירוע בציר הזמן
export interface TimelineEvent {
  id: string;
  systemId: string;
  systemName: LocalizedText;
  city: LocalizedText;
  country: Country;
  year: number;
  month?: number;
  day?: number;
  eventType: 'opening' | 'expansion' | 'milestone' | 'closure';
  description: LocalizedText;
  thumbnail?: string;
}

// נתוני SVG למפה סכמטית
export interface SvgMapData {
  viewBox: string;
  lines: SvgLine[];
  stations: SvgStation[];
}

export interface SvgLine {
  id: string;
  name: LocalizedText;
  color: string;
  path: string; // SVG path data
}

export interface SvgStation {
  id: string;
  name: LocalizedText;
  x: number;
  y: number;
  lines: string[]; // IDs of lines passing through
  isInterchange: boolean;
}

// סטטיסטיקות גלובליות
export interface GlobalStats {
  totalSystems: number;
  totalCountries: number;
  totalStations: number;
  totalLengthKm: number;
  totalAnnualRidership: number;
  byContinent: Record<string, number>;
  byType: Record<string, number>;
  byDecade: Record<string, number>;
}

// השוואת מערכות
export interface ComparisonMetric {
  key: string;
  label: LocalizedText;
  unit?: string;
  getValue: (system: TransitSystemFull) => number | string;
  isHigherBetter?: boolean;
}

// סינון מתקדם (Phase 2)
export interface AdvancedFilterState extends FilterState {
  minLengthKm: number | null;
  maxLengthKm: number | null;
  minRidership: number | null;
  maxRidership: number | null;
  yearFrom: number | null;
  yearTo: number | null;
}
