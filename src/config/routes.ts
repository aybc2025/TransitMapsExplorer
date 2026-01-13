// הגדרת נתיבים
export const ROUTES = {
  home: '/',
  browse: '/browse',
  system: '/system/:id',
  about: '/about',
  // Phase 2
  compare: '/compare',
  timeline: '/timeline',
  statistics: '/statistics',
  // Phase 3
  login: '/login',
  register: '/register',
  profile: '/profile',
  favorites: '/favorites'
} as const;

// פונקציה ליצירת נתיב למערכת ספציפית
export function getSystemPath(id: string): string {
  return `/system/${id}`;
}

// פונקציה ליצירת נתיב להשוואה
export function getComparePath(systemIds: string[]): string {
  return `/compare?systems=${systemIds.join(',')}`;
}
