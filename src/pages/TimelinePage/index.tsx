import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, Filter, Play, Pause, SkipForward, SkipBack,
  Train, ChevronLeft, Calendar
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { dataService } from '@/services/dataService';
import { CONTINENTS } from '@/config/constants';
import type { TransitSystemSummary } from '@/types';

function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface TimelineEvent {
  id: string;
  year: number;
  system: TransitSystemSummary;
  eventType: 'opening';
}

export function TimelinePage() {
  const [systems, setSystems] = useState<TransitSystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1860, 2030]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationYear, setAnimationYear] = useState(1860);

  // Load systems
  useEffect(() => {
    async function loadSystems() {
      const data = await dataService.getAllSystems();
      setSystems(data);
      setIsLoading(false);
    }
    loadSystems();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationYear(prev => {
        if (prev >= yearRange[1]) {
          setIsPlaying(false);
          return yearRange[1];
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, yearRange]);

  // Create timeline events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    let events = systems.map(system => ({
      id: system.id,
      year: system.stats.opened_year,
      system,
      eventType: 'opening' as const
    }));

    // Filter by continent
    if (selectedContinents.length > 0) {
      events = events.filter(e => selectedContinents.includes(e.system.continent));
    }

    // Filter by year range
    events = events.filter(e => e.year >= yearRange[0] && e.year <= yearRange[1]);

    // Sort by year
    return events.sort((a, b) => a.year - b.year);
  }, [systems, selectedContinents, yearRange]);

  // Group events by decade
  const eventsByDecade = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    timelineEvents.forEach(event => {
      const decade = Math.floor(event.year / 10) * 10;
      const key = `${decade}s`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  }, [timelineEvents]);

  // Systems visible in animation
  const visibleInAnimation = useMemo(() => {
    return systems.filter(s =>
      s.stats.opened_year <= animationYear &&
      (selectedContinents.length === 0 || selectedContinents.includes(s.continent))
    );
  }, [systems, animationYear, selectedContinents]);

  const toggleContinent = (continent: string) => {
    setSelectedContinents(prev =>
      prev.includes(continent)
        ? prev.filter(c => c !== continent)
        : [...prev, continent]
    );
  };

  const resetAnimation = () => {
    setAnimationYear(yearRange[0]);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO
        title="ציר זמן"
        description="היסטוריה של מערכות תחבורה המונית בעולם מ-1863 עד היום - ציר זמן אינטראקטיבי עם אנימציה"
        url="/timeline"
      />
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ציר זמן</h1>
              <p className="text-muted-foreground">היסטוריה של מערכות תחבורה מ-1863 עד היום</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4" />
                  סינון
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Continent Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">יבשות</Label>
                  <div className="space-y-2">
                    {Object.entries(CONTINENTS).map(([key, value]) => {
                      const count = systems.filter(s => s.continent === key).length;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`continent-${key}`}
                            checked={selectedContinents.includes(key)}
                            onCheckedChange={() => toggleContinent(key)}
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

                {/* Year Range */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">טווח שנים</Label>
                  <div className="px-2">
                    <Slider
                      value={yearRange}
                      onValueChange={(value) => setYearRange(value as [number, number])}
                      min={1860}
                      max={2030}
                      step={10}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Animation Controls */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">אנימציה</Label>
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-primary">{animationYear}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetAnimation}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAnimationYear(yearRange[1])}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {visibleInAnimation.length} מערכות פעילות
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3">
            {/* Stats Banner */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{timelineEvents.length}</div>
                    <div className="text-sm text-muted-foreground">מערכות בטווח</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {timelineEvents.length > 0 ? timelineEvents[0].year : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">ראשונה</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {timelineEvents.length > 0 ? timelineEvents[timelineEvents.length - 1].year : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">אחרונה</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Object.keys(eventsByDecade).length}
                    </div>
                    <div className="text-sm text-muted-foreground">עשורים</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Events */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="py-6">
                      <div className="h-6 bg-muted rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        {[1, 2].map(j => (
                          <div key={j} className="h-20 bg-muted rounded" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="text-center py-20">
                <Clock className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
                <h2 className="text-2xl font-bold mb-2">אין אירועים בטווח הנבחר</h2>
                <p className="text-muted-foreground">נסה לשנות את הסינון או טווח השנים</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border" />

                {/* Events by Decade */}
                {Object.entries(eventsByDecade).map(([decade, events]) => (
                  <div key={decade} className="relative mb-8">
                    {/* Decade Header */}
                    <div className="sticky top-20 z-10 mb-4">
                      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
                        <Calendar className="h-4 w-4" />
                        שנות ה-{decade}
                        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                          {events.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="space-y-4 mr-10">
                      {events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link to={`/system/${event.system.id}`}>
                            <Card className={`hover:shadow-md hover:border-primary/30 transition-all ${
                              event.year <= animationYear ? 'opacity-100' : 'opacity-30'
                            }`}>
                              <CardContent className="py-4">
                                <div className="flex items-center gap-4">
                                  {/* Year Badge */}
                                  <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                                      <span className="text-2xl font-bold text-primary">{event.year}</span>
                                    </div>
                                  </div>

                                  {/* Thumbnail */}
                                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                    {event.system.thumbnail ? (
                                      <img
                                        src={event.system.thumbnail}
                                        alt={event.system.name.he}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Train className="h-8 w-8 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-2xl">{getFlag(event.system.country.code)}</span>
                                      <h3 className="font-bold text-lg truncate">{event.system.name.he}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {event.system.city.he}, {event.system.country.he}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary">
                                        {event.system.stats.length_km} ק״מ
                                      </Badge>
                                      <Badge variant="secondary">
                                        {event.system.stats.stations} תחנות
                                      </Badge>
                                      <Badge variant="outline">
                                        {CONTINENTS[event.system.continent as keyof typeof CONTINENTS]?.he}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Arrow */}
                                  <ChevronLeft className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
