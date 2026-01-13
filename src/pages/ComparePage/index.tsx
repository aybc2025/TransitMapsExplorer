import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  X, Plus, ArrowLeftRight, Train,
  Ruler, Building2, Hash, Users, Calendar, TrendingUp
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { dataService } from '@/services/dataService';
import type { TransitSystemSummary, TransitSystemFull } from '@/types';

const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

const PRESET_COMPARISONS = [
  { id: 'biggest', label: '5 הגדולות בעולם', systems: ['shanghai-metro', 'beijing-metro', 'guangzhou-metro', 'seoul-metro', 'london-underground'] },
  { id: 'oldest', label: 'הכי ישנות', systems: ['london-underground', 'budapest-metro', 'glasgow-subway', 'paris-metro', 'boston-mbta'] },
  { id: 'europe', label: 'ראשי אירופה', systems: ['london-underground', 'paris-metro', 'madrid-metro', 'moscow-metro', 'berlin-ubahn'] },
  { id: 'asia', label: 'ראשי אסיה', systems: ['tokyo-metro', 'shanghai-metro', 'beijing-metro', 'seoul-metro', 'delhi-metro'] },
];

function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return num.toLocaleString('he-IL');
  }
  return num.toString();
}

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSystems, setAllSystems] = useState<TransitSystemSummary[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<TransitSystemFull[]>([]);
  const [, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load all systems for selection
  useEffect(() => {
    async function loadSystems() {
      const systems = await dataService.getAllSystems();
      setAllSystems(systems);
      setIsLoading(false);
    }
    loadSystems();
  }, []);

  // Load systems from URL params
  useEffect(() => {
    async function loadSelectedSystems() {
      const systemIds = searchParams.get('systems')?.split(',').filter(Boolean) || [];
      if (systemIds.length > 0) {
        const systems = await Promise.all(
          systemIds.map(id => dataService.getSystem(id))
        );
        setSelectedSystems(systems.filter((s): s is TransitSystemFull => s !== null));
      }
    }
    if (allSystems.length > 0) {
      loadSelectedSystems();
    }
  }, [searchParams, allSystems]);

  // Filter systems for search
  const filteredSystems = useMemo(() => {
    if (!searchQuery) return allSystems;
    const query = searchQuery.toLowerCase();
    return allSystems.filter(s =>
      s.name.he.toLowerCase().includes(query) ||
      s.name.en.toLowerCase().includes(query) ||
      s.city.he.toLowerCase().includes(query) ||
      s.city.en.toLowerCase().includes(query)
    );
  }, [allSystems, searchQuery]);

  const addSystem = async (systemId: string) => {
    if (selectedSystems.length >= 5) return;
    if (selectedSystems.some(s => s.id === systemId)) return;

    const system = await dataService.getSystem(systemId);
    if (system) {
      const newSystems = [...selectedSystems, system];
      setSelectedSystems(newSystems);
      setSearchParams({ systems: newSystems.map(s => s.id).join(',') });
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const removeSystem = (systemId: string) => {
    const newSystems = selectedSystems.filter(s => s.id !== systemId);
    setSelectedSystems(newSystems);
    if (newSystems.length > 0) {
      setSearchParams({ systems: newSystems.map(s => s.id).join(',') });
    } else {
      setSearchParams({});
    }
  };

  const loadPreset = async (preset: typeof PRESET_COMPARISONS[0]) => {
    setIsLoading(true);
    const systems = await Promise.all(
      preset.systems.map(id => dataService.getSystem(id))
    );
    const validSystems = systems.filter((s): s is TransitSystemFull => s !== null);
    setSelectedSystems(validSystems);
    setSearchParams({ systems: validSystems.map(s => s.id).join(',') });
    setIsLoading(false);
  };

  // Chart data
  const lengthData = selectedSystems.map((s, i) => ({
    name: s.name.he,
    value: s.stats.length_km,
    color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const stationsData = selectedSystems.map((s, i) => ({
    name: s.name.he,
    value: s.stats.stations,
    color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const ridershipData = selectedSystems.map((s, i) => ({
    name: s.name.he,
    value: s.stats.annual_ridership / 1_000_000,
    color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  // Find max values for highlighting
  const maxLength = Math.max(...selectedSystems.map(s => s.stats.length_km));
  const maxStations = Math.max(...selectedSystems.map(s => s.stats.stations));
  const maxRidership = Math.max(...selectedSystems.map(s => s.stats.annual_ridership));
  const oldestYear = Math.min(...selectedSystems.map(s => s.stats.opened_year));

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO
        title="השוואת מערכות"
        description="השווה בין מערכות תחבורה המונית מכל העולם - השוואה ויזואלית של אורך, תחנות, קווים ונוסעים"
        url="/compare"
      />
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">השוואת מערכות</h1>
              <p className="text-muted-foreground">השווה בין עד 5 מערכות תחבורה</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* System Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">בחר מערכות להשוואה</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected Systems */}
            <div className="flex flex-wrap gap-3 mb-4">
              {selectedSystems.map((system, index) => (
                <motion.div
                  key={system.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                  style={{ borderRight: `4px solid ${CHART_COLORS[index % CHART_COLORS.length]}` }}
                >
                  <span className="text-lg">{getFlag(system.country.code)}</span>
                  <span className="font-medium">{system.name.he}</span>
                  <button
                    onClick={() => removeSystem(system.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}

              {/* Add System Button */}
              {selectedSystems.length < 5 && (
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      הוסף מערכת
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="חפש מערכת..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
                        <CommandGroup>
                          {filteredSystems.map(system => (
                            <CommandItem
                              key={system.id}
                              onSelect={() => addSystem(system.id)}
                              disabled={selectedSystems.some(s => s.id === system.id)}
                            >
                              <span className="ml-2">{getFlag(system.country.code)}</span>
                              <span>{system.name.he}</span>
                              <span className="text-muted-foreground text-sm mr-auto">
                                {system.city.he}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Preset Comparisons */}
            <Separator className="my-4" />
            <div>
              <p className="text-sm text-muted-foreground mb-3">השוואות מוכנות:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COMPARISONS.map(preset => (
                  <Button
                    key={preset.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => loadPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {selectedSystems.length === 0 ? (
          <div className="text-center py-20">
            <Train className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">בחר מערכות להשוואה</h2>
            <p className="text-muted-foreground mb-6">
              הוסף לפחות 2 מערכות כדי להתחיל להשוות
            </p>
          </div>
        ) : selectedSystems.length === 1 ? (
          <div className="text-center py-20">
            <ArrowLeftRight className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">הוסף עוד מערכת</h2>
            <p className="text-muted-foreground">
              צריך לפחות 2 מערכות כדי להשוות
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  טבלת השוואה
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full" dir="rtl">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-semibold">מדד</th>
                      {selectedSystems.map((system, i) => (
                        <th key={system.id} className="text-center py-3 px-4 font-semibold min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{getFlag(system.country.code)}</span>
                            <span style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {system.name.he}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        אורך (ק״מ)
                      </td>
                      {selectedSystems.map(system => (
                        <td key={system.id} className="text-center py-3 px-4">
                          <span className={system.stats.length_km === maxLength ? 'font-bold text-primary' : ''}>
                            {system.stats.length_km}
                            {system.stats.length_km === maxLength && ' 🏆'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        תחנות
                      </td>
                      {selectedSystems.map(system => (
                        <td key={system.id} className="text-center py-3 px-4">
                          <span className={system.stats.stations === maxStations ? 'font-bold text-primary' : ''}>
                            {system.stats.stations}
                            {system.stats.stations === maxStations && ' 🏆'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        קווים
                      </td>
                      {selectedSystems.map(system => (
                        <td key={system.id} className="text-center py-3 px-4">
                          {system.stats.lines}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        נוסעים/שנה
                      </td>
                      {selectedSystems.map(system => (
                        <td key={system.id} className="text-center py-3 px-4">
                          <span className={system.stats.annual_ridership === maxRidership ? 'font-bold text-primary' : ''}>
                            {formatNumber(system.stats.annual_ridership)}
                            {system.stats.annual_ridership === maxRidership && ' 🏆'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        שנת פתיחה
                      </td>
                      {selectedSystems.map(system => (
                        <td key={system.id} className="text-center py-3 px-4">
                          <span className={system.stats.opened_year === oldestYear ? 'font-bold text-primary' : ''}>
                            {system.stats.opened_year}
                            {system.stats.opened_year === oldestYear && ' 🏆'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Length Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ruler className="h-5 w-5" />
                    אורך (ק״מ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={lengthData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value} ק״מ`, 'אורך']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {lengthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stations Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5" />
                    מספר תחנות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stationsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value} תחנות`, 'תחנות']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {stationsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ridership Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    נוסעים שנתיים (מיליונים)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ridershipData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} מיליון`, 'נוסעים']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {ridershipData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
