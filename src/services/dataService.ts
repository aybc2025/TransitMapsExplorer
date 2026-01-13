// שירות טעינת נתונים
import type { TransitSystemSummary, TransitSystemFull, FilterState, SortOption } from '@/types';
import systemsList from '@/data/systems-list.json';

class DataService {
  private cache = new Map<string, TransitSystemFull>();
  
  // קבלת כל המערכות (רשימה)
  async getAllSystems(): Promise<TransitSystemSummary[]> {
    return systemsList as TransitSystemSummary[];
  }
  
  // קבלת מערכת בודדת
  async getSystem(id: string): Promise<TransitSystemFull | null> {
    // בדיקת cache
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    try {
      // טעינה דינמית של קובץ המערכת
      const module = await import(`@/data/systems/${id}.json`);
      const system = module.default as TransitSystemFull;
      this.cache.set(id, system);
      return system;
    } catch (error) {
      // אם אין קובץ מפורט, נחזיר את הנתונים הבסיסיים
      const basicSystem = systemsList.find(s => s.id === id);
      if (basicSystem) {
        const fullSystem: TransitSystemFull = {
          ...basicSystem,
          description: {
            he: `מערכת תחבורה ציבורית ב${basicSystem.city.he}, ${basicSystem.country.he}.`,
            en: `Public transit system in ${basicSystem.city.en}, ${basicSystem.country.en}.`
          }
        } as TransitSystemFull;
        return fullSystem;
      }
      return null;
    }
  }
  
  // חיפוש מערכות
  async searchSystems(query: string): Promise<TransitSystemSummary[]> {
    if (!query.trim()) {
      return this.getAllSystems();
    }
    
    const allSystems = await this.getAllSystems();
    const lowerQuery = query.toLowerCase();
    
    return allSystems.filter(system => 
      system.name.he.toLowerCase().includes(lowerQuery) ||
      system.name.en.toLowerCase().includes(lowerQuery) ||
      system.city.he.toLowerCase().includes(lowerQuery) ||
      system.city.en.toLowerCase().includes(lowerQuery) ||
      system.country.he.toLowerCase().includes(lowerQuery) ||
      system.country.en.toLowerCase().includes(lowerQuery)
    );
  }
  
  // סינון מערכות
  async filterSystems(filters: FilterState): Promise<TransitSystemSummary[]> {
    let systems = await this.getAllSystems();
    
    // סינון לפי חיפוש טקסט
    if (filters.searchQuery) {
      systems = await this.searchSystems(filters.searchQuery);
    }
    
    // סינון לפי יבשת
    if (filters.continent) {
      systems = systems.filter(s => s.continent === filters.continent);
    }
    
    // סינון לפי סוג
    if (filters.type) {
      systems = systems.filter(s => s.type === filters.type);
    }
    
    // סינון לפי סטטוס
    if (filters.status) {
      systems = systems.filter(s => s.status === filters.status);
    }
    
    // סינון לפי מספר תחנות
    if (filters.minStations !== null) {
      systems = systems.filter(s => s.stats.stations >= filters.minStations!);
    }
    if (filters.maxStations !== null) {
      systems = systems.filter(s => s.stats.stations <= filters.maxStations!);
    }
    
    return systems;
  }
  
  // מיון מערכות
  sortSystems(systems: TransitSystemSummary[], sortBy: SortOption): TransitSystemSummary[] {
    const sorted = [...systems];
    
    switch (sortBy) {
      case 'name_asc':
        return sorted.sort((a, b) => a.name.he.localeCompare(b.name.he, 'he'));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.he.localeCompare(a.name.he, 'he'));
      case 'stations_desc':
        return sorted.sort((a, b) => b.stats.stations - a.stats.stations);
      case 'stations_asc':
        return sorted.sort((a, b) => a.stats.stations - b.stats.stations);
      case 'length_desc':
        return sorted.sort((a, b) => b.stats.length_km - a.stats.length_km);
      case 'length_asc':
        return sorted.sort((a, b) => a.stats.length_km - b.stats.length_km);
      case 'year_asc':
        return sorted.sort((a, b) => a.stats.opened_year - b.stats.opened_year);
      case 'year_desc':
        return sorted.sort((a, b) => b.stats.opened_year - a.stats.opened_year);
      case 'ridership_desc':
        return sorted.sort((a, b) => b.stats.annual_ridership - a.stats.annual_ridership);
      case 'ridership_asc':
        return sorted.sort((a, b) => a.stats.annual_ridership - b.stats.annual_ridership);
      default:
        return sorted;
    }
  }
  
  // סטטיסטיקות כלליות
  async getGlobalStats() {
    const systems = await this.getAllSystems();
    
    const totalStations = systems.reduce((sum, s) => sum + s.stats.stations, 0);
    const totalLength = systems.reduce((sum, s) => sum + s.stats.length_km, 0);
    const totalRidership = systems.reduce((sum, s) => sum + s.stats.annual_ridership, 0);
    const totalLines = systems.reduce((sum, s) => sum + s.stats.lines, 0);
    const uniqueCountries = new Set(systems.map(s => s.country.code)).size;
    
    return {
      totalSystems: systems.length,
      totalStations,
      totalLength: Math.round(totalLength),
      totalRidership,
      totalLines,
      uniqueCountries
    };
  }
  
  // מציאת המערכות המיוחדות
  async getFeaturedSystems(): Promise<{
    oldest: TransitSystemSummary;
    longest: TransitSystemSummary;
    busiest: TransitSystemSummary;
    mostStations: TransitSystemSummary;
    newest: TransitSystemSummary;
  }> {
    const systems = await this.getAllSystems();
    
    return {
      oldest: systems.reduce((a, b) => a.stats.opened_year < b.stats.opened_year ? a : b),
      longest: systems.reduce((a, b) => a.stats.length_km > b.stats.length_km ? a : b),
      busiest: systems.reduce((a, b) => a.stats.annual_ridership > b.stats.annual_ridership ? a : b),
      mostStations: systems.reduce((a, b) => a.stats.stations > b.stats.stations ? a : b),
      newest: systems.reduce((a, b) => a.stats.opened_year > b.stats.opened_year ? a : b)
    };
  }
}

export const dataService = new DataService();
