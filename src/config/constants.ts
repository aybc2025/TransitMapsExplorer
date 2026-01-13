// קבועים גלובליים לאתר
export const SITE_CONFIG = {
  name: {
    he: 'מפות תחבורה מכל העולם',
    en: 'Transit Maps Explorer'
  },
  shortName: {
    he: 'מפות תחבורה',
    en: 'Transit Maps'
  },
  description: {
    he: 'אוסף מקיף של מערכות התחבורה ההמונית בעולם - מפות, נתונים והיסטוריה',
    en: 'Comprehensive collection of mass transit systems worldwide - maps, data and history'
  },
  url: 'https://transit-maps.co.il',
  email: 'contact@transit-maps.co.il',
  version: '1.0.0'
} as const;

// יבשות
export const CONTINENTS = {
  europe: { he: 'אירופה', en: 'Europe', icon: '🇪🇺' },
  asia: { he: 'אסיה', en: 'Asia', icon: '🌏' },
  northAmerica: { he: 'אמריקה הצפונית', en: 'North America', icon: '🌎' },
  southAmerica: { he: 'אמריקה הדרומית', en: 'South America', icon: '🌎' },
  africa: { he: 'אפריקה', en: 'Africa', icon: '🌍' },
  oceania: { he: 'אוקיאניה', en: 'Oceania', icon: '🌏' }
} as const;

// סוגי מערכות תחבורה
export const SYSTEM_TYPES = {
  metro: { he: 'רכבת תחתית (מטרו)', en: 'Metro/Subway', icon: '🚇', color: '#DC2626' },
  lightRail: { he: 'רכבת קלה', en: 'Light Rail', icon: '🚊', color: '#2563EB' },
  tram: { he: 'חשמלית', en: 'Tram', icon: '🚃', color: '#16A34A' },
  brt: { he: 'אוטובוס מהיר (BRT)', en: 'BRT', icon: '🚌', color: '#CA8A04' },
  commuter: { he: 'רכבת פרברים', en: 'Commuter Rail', icon: '🚆', color: '#7C3AED' },
  monorail: { he: 'מונורייל', en: 'Monorail', icon: '🚝', color: '#EC4899' },
  funicular: { he: 'רכבל/פוניקולר', en: 'Funicular/Cable', icon: '🚡', color: '#14B8A6' },
  mixed: { he: 'מערכת משולבת', en: 'Mixed System', icon: '🚞', color: '#6B7280' }
} as const;

// סטטוס מערכת
export const SYSTEM_STATUS = {
  active: { he: 'פעיל', en: 'Active', color: '#16A34A' },
  construction: { he: 'בבנייה', en: 'Under Construction', color: '#CA8A04' },
  planned: { he: 'מתוכנן', en: 'Planned', color: '#6B7280' },
  closed: { he: 'סגור', en: 'Closed', color: '#DC2626' }
} as const;

// גדלים (מספר תחנות)
export const SIZE_CATEGORIES = {
  small: { he: 'קטן', en: 'Small', min: 1, max: 20 },
  medium: { he: 'בינוני', en: 'Medium', min: 21, max: 100 },
  large: { he: 'גדול', en: 'Large', min: 101, max: Infinity }
} as const;

// תקופות הקמה
export const ERA_PERIODS = [
  { id: 'pre1900', he: 'לפני 1900', en: 'Before 1900', start: 0, end: 1899 },
  { id: '1900_1950', he: '1900-1950', en: '1900-1950', start: 1900, end: 1950 },
  { id: '1951_2000', he: '1951-2000', en: '1951-2000', start: 1951, end: 2000 },
  { id: '2001_2010', he: '2001-2010', en: '2001-2010', start: 2001, end: 2010 },
  { id: '2011_2020', he: '2011-2020', en: '2011-2020', start: 2011, end: 2020 },
  { id: '2021_plus', he: '2021+', en: '2021+', start: 2021, end: 9999 }
] as const;

// מפת ברירת מחדל
export const MAP_CONFIG = {
  center: { lat: 30, lng: 20 },
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
} as const;

export type Continent = keyof typeof CONTINENTS;
export type SystemType = keyof typeof SYSTEM_TYPES;
export type SystemStatus = keyof typeof SYSTEM_STATUS;
