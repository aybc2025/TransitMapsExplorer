import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Grid3X3, List, Map, X,
  SlidersHorizontal, Train
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { SystemCard } from '@/components/common/SystemCard';
import { WorldMap } from '@/components/map/WorldMap';
import { dataService } from '@/services/dataService';
import { useAppStore } from '@/store';
import { CONTINENTS, SYSTEM_TYPES, SYSTEM_STATUS } from '@/config/constants';
import type { TransitSystemSummary, ViewMode, SortOption, FilterState } from '@/types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name_asc', label: 'שם (א-ת)' },
  { value: 'name_desc', label: 'שם (ת-א)' },
  { value: 'stations_desc', label: 'תחנות (רב ← מעט)' },
  { value: 'stations_asc', label: 'תחנות (מעט ← רב)' },
  { value: 'length_desc', label: 'אורך (ארוך ← קצר)' },
  { value: 'length_asc', label: 'אורך (קצר ← ארוך)' },
  { value: 'year_asc', label: 'שנה (ישן ← חדש)' },
  { value: 'year_desc', label: 'שנה (חדש ← ישן)' },
  { value: 'ridership_desc', label: 'נוסעים (רב ← מעט)' },
];

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [systems, setSystems] = useState<TransitSystemSummary[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<TransitSystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { viewMode, setViewMode, sortBy, setSortBy } = useAppStore();

  // Local filter state
  const [filters, setFilters] = useState<FilterState>({
    continent: searchParams.get('continent') || null,
    type: searchParams.get('type') || null,
    status: null,
    minStations: null,
    maxStations: null,
    era: null,
    searchQuery: searchParams.get('q') || ''
  });

  // Load systems
  useEffect(() => {
    async function loadSystems() {
      try {
        const data = await dataService.getAllSystems();
        setSystems(data);
      } catch (error) {
        console.error('Error loading systems:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSystems();
  }, []);

  // Filter and sort systems
  useEffect(() => {
    let result = [...systems];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.he.toLowerCase().includes(query) ||
        s.name.en.toLowerCase().includes(query) ||
        s.city.he.toLowerCase().includes(query) ||
        s.city.en.toLowerCase().includes(query) ||
        s.country.he.toLowerCase().includes(query) ||
        s.country.en.toLowerCase().includes(query)
      );
    }

    // Continent filter
    if (filters.continent) {
      result = result.filter(s => s.continent === filters.continent);
    }

    // Type filter
    if (filters.type) {
      result = result.filter(s => s.type === filters.type);
    }

    // Status filter
    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }

    // Sort
    result = dataService.sortSystems(result, sortBy);

    setFilteredSystems(result);
  }, [systems, filters, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.continent) params.set('continent', filters.continent);
    if (filters.type) params.set('type', filters.type);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      continent: null,
      type: null,
      status: null,
      minStations: null,
      maxStations: null,
      era: null,
      searchQuery: ''
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.continent) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    return count;
  }, [filters]);

  // Filter Panel Content
  const FilterPanelContent = () => (
    <div className="space-y-6">
      {/* Continent Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">🌍 יבשת</Label>
        <div className="space-y-2">
          {Object.entries(CONTINENTS).map(([key, value]) => {
            const count = systems.filter(s => s.continent === key).length;
            return (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`continent-${key}`}
                  checked={filters.continent === key}
                  onCheckedChange={(checked) => 
                    updateFilter('continent', checked ? key : null)
                  }
                />
                <Label 
                  htmlFor={`continent-${key}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {value.icon} {value.he}
                </Label>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Type Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">🚇 סוג מערכת</Label>
        <div className="space-y-2">
          {Object.entries(SYSTEM_TYPES).map(([key, value]) => {
            const count = systems.filter(s => s.type === key).length;
            return (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${key}`}
                  checked={filters.type === key}
                  onCheckedChange={(checked) => 
                    updateFilter('type', checked ? key : null)
                  }
                />
                <Label 
                  htmlFor={`type-${key}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {value.icon} {value.he}
                </Label>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Status Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">⚙️ סטטוס</Label>
        <div className="space-y-2">
          {Object.entries(SYSTEM_STATUS).map(([key, value]) => {
            const count = systems.filter(s => s.status === key).length;
            return (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${key}`}
                  checked={filters.status === key}
                  onCheckedChange={(checked) => 
                    updateFilter('status', checked ? key : null)
                  }
                />
                <Label 
                  htmlFor={`status-${key}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {value.he}
                </Label>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Clear Button */}
      {activeFilterCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={clearFilters}
        >
          <X className="h-4 w-4 ml-2" />
          נקה את כל הסינונים
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש עיר, מדינה או מערכת..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                נמצאו <span className="font-semibold text-foreground">{filteredSystems.length}</span> מערכות
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="מיון לפי..." />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border rounded-lg">
                {(['grid', 'list', 'map'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none first:rounded-r-lg last:rounded-l-lg"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode === 'grid' && <Grid3X3 className="h-4 w-4" />}
                    {mode === 'list' && <List className="h-4 w-4" />}
                    {mode === 'map' && <Map className="h-4 w-4" />}
                  </Button>
                ))}
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    סינון
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="mr-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>סינון מערכות</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanelContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {filters.continent && (
                  <Badge variant="secondary" className="gap-1">
                    {CONTINENTS[filters.continent as keyof typeof CONTINENTS]?.he}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('continent', null)}
                    />
                  </Badge>
                )}
                {filters.type && (
                  <Badge variant="secondary" className="gap-1">
                    {SYSTEM_TYPES[filters.type as keyof typeof SYSTEM_TYPES]?.he}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('type', null)}
                    />
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="gap-1">
                    {SYSTEM_STATUS[filters.status as keyof typeof SYSTEM_STATUS]?.he}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('status', null)}
                    />
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36 bg-card rounded-xl border p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                סינון מערכות
              </h2>
              <FilterPanelContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border overflow-hidden">
                    <div className="h-44 bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSystems.length === 0 ? (
              <div className="text-center py-20">
                <Train className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">לא נמצאו מערכות</h3>
                <p className="text-muted-foreground mb-4">
                  נסה לשנות את קריטריוני החיפוש או הסינון
                </p>
                <Button onClick={clearFilters}>נקה סינון</Button>
              </div>
            ) : viewMode === 'map' ? (
              <WorldMap systems={filteredSystems} height="calc(100vh - 250px)" />
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredSystems.map((system, index) => (
                  <motion.a
                    key={system.id}
                    href={`/system/${system.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 bg-card rounded-xl border p-4 hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {(system.headerImage || system.thumbnail) ? (
                        <img
                          src={system.headerImage || system.thumbnail}
                          alt={system.name.he}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Train className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{system.name.he}</h3>
                      <p className="text-sm text-muted-foreground">
                        {system.city.he}, {system.country.he}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-bold text-foreground">{system.stats.stations}</div>
                        <div>תחנות</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{system.stats.length_km}</div>
                        <div>ק״מ</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{system.stats.lines}</div>
                        <div>קווים</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{system.stats.opened_year}</div>
                        <div>שנת פתיחה</div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSystems.map((system, index) => (
                  <SystemCard key={system.id} system={system} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
