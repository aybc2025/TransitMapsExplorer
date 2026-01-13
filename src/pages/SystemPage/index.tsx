import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Train, MapPin, Calendar, Users, Ruler, Hash,
  ExternalLink, ArrowRight, Globe, Sparkles,
  Clock, Building2, Zap, CreditCard, Share2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { dataService } from '@/services/dataService';
import { SYSTEM_TYPES, SYSTEM_STATUS } from '@/config/constants';
import type { TransitSystemFull } from '@/types';
import { TransitMap } from '@/components/map/TransitMap';

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)} מיליארד`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)} מיליון`;
  }
  if (num >= 1_000) {
    return num.toLocaleString('he-IL');
  }
  return num.toString();
}

function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function SystemPage() {
  const { id } = useParams<{ id: string }>();
  const [system, setSystem] = useState<TransitSystemFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSystem() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await dataService.getSystem(id);
        if (data) {
          setSystem(data);
        } else {
          setError('המערכת לא נמצאה');
        }
      } catch (err) {
        setError('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    }
    loadSystem();
  }, [id]);

  if (isLoading) return <SystemPageSkeleton />;

  if (error || !system) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Train className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">{error || 'המערכת לא נמצאה'}</h1>
        <p className="text-muted-foreground mb-6">נסה לחפש מערכת אחרת</p>
        <Link to="/browse">
          <Button><ArrowRight className="h-4 w-4 ml-2 rtl-flip" />חזור לכל המערכות</Button>
        </Link>
      </div>
    );
  }

  const systemType = SYSTEM_TYPES[system.type as keyof typeof SYSTEM_TYPES];
  const systemStatus = SYSTEM_STATUS[system.status as keyof typeof SYSTEM_STATUS];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[350px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {system.images?.header || system.thumbnail ? (
            <img src={system.images?.header || system.thumbnail} alt={system.name.he} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="text-sm" style={{ backgroundColor: systemType?.color || '#6B7280' }}>
                {systemType?.icon} {systemType?.he || system.type}
              </Badge>
              <Badge variant="secondary" style={{ backgroundColor: systemStatus?.color, color: 'white' }}>
                {systemStatus?.he || system.status}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">{system.stats.opened_year}</Badge>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{system.name.he}</h1>
                <p className="text-white/70 text-lg mb-2">{system.name.en}</p>
                <p className="text-white/80 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {system.city.he}, {system.country.he}
                  <span className="text-2xl">{getFlag(system.country.code)}</span>
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button variant="secondary" size="icon"><Heart className="h-5 w-5" /></Button>
                <Button variant="secondary" size="icon"><Share2 className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="flex gap-1.5 mt-4 flex-wrap">
              {system.colors.map((color, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white/50 shadow-lg" style={{ backgroundColor: color }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: <Ruler className="h-5 w-5" />, value: `${system.stats.length_km}`, unit: 'ק״מ', label: 'אורך' },
              { icon: <Building2 className="h-5 w-5" />, value: system.stats.stations, unit: '', label: 'תחנות' },
              { icon: <Hash className="h-5 w-5" />, value: system.stats.lines, unit: '', label: 'קווים' },
              { icon: <Users className="h-5 w-5" />, value: formatNumber(system.stats.annual_ridership), unit: '', label: 'נוסעים/שנה' },
              { icon: <Calendar className="h-5 w-5" />, value: system.stats.opened_year, unit: '', label: 'נפתח' },
              { icon: <Zap className="h-5 w-5" />, value: system.stats.propulsion || 'חשמלי', unit: '', label: 'הנעה' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex justify-center text-primary mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}{stat.unit && <span className="text-base font-normal text-muted-foreground mr-1">{stat.unit}</span>}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="about">אודות</TabsTrigger>
                <TabsTrigger value="lines">קווים</TabsTrigger>
                <TabsTrigger value="map">מפה</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Train className="h-5 w-5" />אודות המערכת</CardTitle></CardHeader>
                  <CardContent><p dir="rtl" className="leading-relaxed whitespace-pre-line text-right">{system.description?.he || `מערכת תחבורה ציבורית ב${system.city.he}, ${system.country.he}.`}</p></CardContent>
                </Card>
                {system.fun_facts && system.fun_facts.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />עובדות מעניינות</CardTitle></CardHeader>
                    <CardContent><ul dir="rtl" className="space-y-3 text-right">{system.fun_facts.map((fact, i) => (<li key={i} className="flex gap-3"><span className="text-primary font-bold">•</span><span>{fact.he}</span></li>))}</ul></CardContent>
                  </Card>
                )}
                {system.milestones && system.milestones.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />אבני דרך</CardTitle></CardHeader>
                    <CardContent>
                      <div className="relative border-r-2 border-primary/30 pr-6 space-y-6">
                        {system.milestones.map((m, i) => (<div key={i} className="relative"><div className="absolute -right-[31px] w-4 h-4 rounded-full bg-primary" /><div className="font-bold text-primary">{m.year}</div><div className="text-muted-foreground">{m.event.he}</div></div>))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="lines" className="mt-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Hash className="h-5 w-5" />קווים ({system.stats.lines})</CardTitle></CardHeader>
                  <CardContent>
                    {system.lines && system.lines.length > 0 ? (
                      <div className="space-y-4">
                        {system.lines.map((line, i) => (
                          <div key={line.id || i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: line.color }}>{line.id?.toUpperCase().slice(0, 2) || i + 1}</div>
                            <div className="flex-1"><div className="font-semibold">{line.name.he}</div><div className="text-sm text-muted-foreground">{line.name.en}</div></div>
                            <div className="text-center"><div className="font-bold">{line.stations}</div><div className="text-xs text-muted-foreground">תחנות</div></div>
                            <div className="text-center"><div className="font-bold">{line.length_km}</div><div className="text-xs text-muted-foreground">ק״מ</div></div>
                            <div className="text-center"><div className="font-bold">{line.opened_year}</div><div className="text-xs text-muted-foreground">נפתח</div></div>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="text-muted-foreground text-center py-8">אין מידע מפורט על הקווים</p>)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />מפה</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TransitMap system={system} height="450px" />
                      {system.map_url && (
                        <a href={system.map_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full gap-2">
                            <ExternalLink className="h-4 w-4" />מפה רשמית נוספת
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {system.stats.avg_fare && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-5 w-5" />מחיר נסיעה</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{system.stats.avg_fare.symbol}{system.stats.avg_fare.min} - {system.stats.avg_fare.symbol}{system.stats.avg_fare.max}</div><div className="text-sm text-muted-foreground">{system.stats.avg_fare.currency}</div></CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-5 w-5" />קישורים שימושיים</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {system.official_website && (<a href={system.official_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"><Globe className="h-4 w-4 text-primary" /><span className="flex-1">אתר רשמי</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>)}
                {system.map_url && (<a href={system.map_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"><MapPin className="h-4 w-4 text-primary" /><span className="flex-1">מפה רשמית</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>)}
                {system.wikipedia?.he && (<a href={system.wikipedia.he} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"><span className="text-lg">🌐</span><span className="flex-1">ויקיפדיה (עברית)</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>)}
                {system.wikipedia?.en && (<a href={system.wikipedia.en} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"><span className="text-lg">🌐</span><span className="flex-1">Wikipedia (English)</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>)}
              </CardContent>
            </Card>
            {system.stats.operator && (<Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-5 w-5" />מפעיל</CardTitle></CardHeader><CardContent><p className="font-medium">{system.stats.operator}</p></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <Separator className="mb-8" />
        <Link to="/browse"><Button variant="outline" className="gap-2"><ArrowRight className="h-4 w-4 rtl-flip" />חזור לכל המערכות</Button></Link>
      </section>
    </div>
  );
}

function SystemPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-[350px] bg-muted animate-pulse" />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-24 rounded-xl" />))}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><Skeleton className="h-12 w-48 mb-6" /><Skeleton className="h-64 rounded-xl" /></div>
          <div className="space-y-6"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>
        </div>
      </div>
    </div>
  );
}
