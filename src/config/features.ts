// Feature Flags System - מערכת דגלים להפעלה/כיבוי תכונות
export const FEATURES = {
  // ──────────────────────────────────
  // Phase 1 - MVP (מופעל)
  // ──────────────────────────────────
  HOME_PAGE: true,
  BROWSE_PAGE: true,
  SYSTEM_PAGE: true,
  ABOUT_PAGE: true,
  BASIC_SEARCH: true,
  WORLD_MAP: true,
  BASIC_FILTERS: true,
  
  // ──────────────────────────────────
  // Phase 2 - Advanced Features (מופעל)
  // ──────────────────────────────────
  COMPARE_PAGE: true,
  TIMELINE_PAGE: true,
  STATISTICS_PAGE: true,
  ADVANCED_FILTERS: true,
  SVG_MAPS: true,
  IMAGE_GALLERY: true,
  HISTORICAL_MAPS: true,
  
  // ──────────────────────────────────
  // Phase 3 - User Features
  // ──────────────────────────────────
  USER_ACCOUNTS: false,
  FAVORITES: false,
  COMMENTS: false,
  RATINGS: false,
  USER_PHOTOS: false,
  TRAVEL_LOG: false,
  COMMUNITY_FORUM: false,
  PUSH_NOTIFICATIONS: false,
  
  // ──────────────────────────────────
  // Future Features
  // ──────────────────────────────────
  MOBILE_APP: false,
  AR_FEATURES: false,
  QUIZ_GAME: false,
  PUBLIC_API: false,
  MULTI_LANGUAGE: false
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(featureName: FeatureName): boolean {
  return FEATURES[featureName] === true;
}

export function getEnabledFeatures(): FeatureName[] {
  return (Object.entries(FEATURES) as [FeatureName, boolean][])
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
