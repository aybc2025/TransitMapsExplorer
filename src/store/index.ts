// Zustand Store - ניהול מצב האפליקציה
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState, SortOption, ViewMode } from '@/types';

interface AppState {
  // סינון
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  
  // מיון
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  
  // תצוגה
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // מועדפים (Phase 3, אבל נכין את התשתית)
  favorites: string[];
  toggleFavorite: (systemId: string) => void;
  isFavorite: (systemId: string) => boolean;
  
  // מערכות נבחרות להשוואה
  selectedForCompare: string[];
  toggleCompareSelection: (systemId: string) => void;
  clearCompareSelection: () => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // חיפוש
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const defaultFilters: FilterState = {
  continent: null,
  type: null,
  status: null,
  minStations: null,
  maxStations: null,
  era: null,
  searchQuery: ''
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Filters
      filters: defaultFilters,
      setFilter: (key, value) => set(state => ({
        filters: { ...state.filters, [key]: value }
      })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      // Sort
      sortBy: 'name_asc',
      setSortBy: (sort) => set({ sortBy: sort }),
      
      // View
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Favorites
      favorites: [],
      toggleFavorite: (systemId) => set(state => ({
        favorites: state.favorites.includes(systemId)
          ? state.favorites.filter(id => id !== systemId)
          : [...state.favorites, systemId]
      })),
      isFavorite: (systemId) => get().favorites.includes(systemId),
      
      // Compare
      selectedForCompare: [],
      toggleCompareSelection: (systemId) => set(state => {
        if (state.selectedForCompare.includes(systemId)) {
          return { selectedForCompare: state.selectedForCompare.filter(id => id !== systemId) };
        }
        if (state.selectedForCompare.length >= 5) {
          return state; // מקסימום 5 מערכות להשוואה
        }
        return { selectedForCompare: [...state.selectedForCompare, systemId] };
      }),
      clearCompareSelection: () => set({ selectedForCompare: [] }),
      
      // UI
      isSidebarOpen: true,
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ 
        searchQuery: query,
        filters: { ...get().filters, searchQuery: query }
      })
    }),
    {
      name: 'transit-maps-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        viewMode: state.viewMode,
        sortBy: state.sortBy
      })
    }
  )
);
