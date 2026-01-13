import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Trophy,
  Train, Ruler, Building2, Users, Globe, Hash, Calendar
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataService } from '@/services/dataService';
import { CONTINENTS, SYSTEM_TYPES } from '@/config/constants';
import type { TransitSystemSummary } from '@/types';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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

export function StatisticsPage() {
  const [systems, setSystems] = useState<TransitSystemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSystems() {
      const data = await dataService.getAllSystems();
      setSystems(data);
      setIsLoading(false);
    }
    loadSystems();
  }, []);

  // Global stats
  const globalStats = useMemo(() => {
    const totalStations = systems.reduce((sum, s) => sum + s.stats.stations, 0);
    const totalLength = systems.reduce((sum, s) => sum + s.stats.length_km, 0);
    const totalRidership = systems.reduce((sum, s) => sum + s.stats.annual_ridership, 0);
    const totalLines = systems.reduce((sum, s) => sum + s.stats.lines, 0);
    const countries = new Set(systems.map(s => s.country.code)).size;

    return {
      totalSystems: systems.length,
      totalStations,
      totalLength: Math.round(totalLength),
      totalRidership,
      totalLines,
      countries
    };
  }, [systems]);

  // Top 10 by length
  const topByLength = useMemo(() => {
    return [...systems]
      .sort((a, b) => b.stats.length_km - a.stats.length_km)
      .slice(0, 10)
      .map(s => ({
        name: s.name.he,
        value: s.stats.length_km,
        id: s.id,
        flag: getFlag(s.country.code)
      }));
  }, [systems]);

  // Top 10 by stations
  const topByStations = useMemo(() => {
    return [...systems]
      .sort((a, b) => b.stats.stations - a.stats.stations)
      .slice(0, 10)
      .map(s => ({
        name: s.name.he,
        value: s.stats.stations,
        id: s.id,
        flag: getFlag(s.country.code)
      }));
  }, [systems]);

  // Top 10 by ridership
  const topByRidership = useMemo(() => {
    return [...systems]
      .sort((a, b) => b.stats.annual_ridership - a.stats.annual_ridership)
      .slice(0, 10)
      .map(s => ({
        name: s.name.he,
        value: Math.round(s.stats.annual_ridership / 1_000_000),
        id: s.id,
        flag: getFlag(s.country.code)
      }));
  }, [systems]);

  // Distribution by continent
  const byContinent = useMemo(() => {
    const counts: Record<string, number> = {};
    systems.forEach(s => {
      counts[s.continent] = (counts[s.continent] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value], i) => ({
      name: CONTINENTS[key as keyof typeof CONTINENTS]?.he || key,
      value,
      color: COLORS[i % COLORS.length]
    }));
  }, [systems]);

  // Distribution by type
  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    systems.forEach(s => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value], i) => ({
      name: SYSTEM_TYPES[key as keyof typeof SYSTEM_TYPES]?.he || key,
      value,
      color: COLORS[i % COLORS.length]
    }));
  }, [systems]);

  // Growth by decade
  const byDecade = useMemo(() => {
    const decades: Record<string, number> = {};
    systems.forEach(s => {
      const decade = Math.floor(s.stats.opened_year / 10) * 10;
      decades[decade] = (decades[decade] || 0) + 1;
    });

    // Cumulative count
    let cumulative = 0;
    return Object.entries(decades)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([decade, count]) => {
        cumulative += count;
        return {
          decade: `${decade}`,
          new: count,
          total: cumulative
        };
      });
  }, [systems]);

  // Records
  const records = useMemo(() => {
    if (systems.length === 0) return null;

    return {
      oldest: systems.reduce((a, b) => a.stats.opened_year < b.stats.opened_year ? a : b),
      newest: systems.reduce((a, b) => a.stats.opened_year > b.stats.opened_year ? a : b),
      longest: systems.reduce((a, b) => a.stats.length_km > b.stats.length_km ? a : b),
      mostStations: systems.reduce((a, b) => a.stats.stations > b.stats.stations ? a : b),
      busiest: systems.reduce((a, b) => a.stats.annual_ridership > b.stats.annual_ridership ? a : b),
      mostLines: systems.reduce((a, b) => a.stats.lines > b.stats.lines ? a : b),
    };
  }, [systems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <SEO
          title="סטטיסטיקות"
          description="נתונים וגרפים על מערכות תחבורה המונית בעולם - Top 10, התפלגות, צמיחה ושיאים"
          url="/statistics"
        />
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="h-12 bg-muted rounded animate-pulse w-1/3" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO
        title="סטטיסטיקות"
        description="נתונים וגרפים על מערכות תחבורה המונית בעולם - Top 10, התפלגות, צמיחה ושיאים"
        url="/statistics"
      />
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">סטטיסטיקות</h1>
              <p className="text-muted-foreground">נתונים וגרפים על מערכות תחבורה בעולם</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: <Train className="h-5 w-5" />, value: globalStats.totalSystems, label: 'מערכות', color: 'text-blue-500' },
            { icon: <Globe className="h-5 w-5" />, value: globalStats.countries, label: 'מדינות', color: 'text-green-500' },
            { icon: <Building2 className="h-5 w-5" />, value: formatNumber(globalStats.totalStations), label: 'תחנות', color: 'text-purple-500' },
            { icon: <Ruler className="h-5 w-5" />, value: formatNumber(globalStats.totalLength), label: 'ק״מ', color: 'text-orange-500' },
            { icon: <Hash className="h-5 w-5" />, value: formatNumber(globalStats.totalLines), label: 'קווים', color: 'text-pink-500' },
            { icon: <Users className="h-5 w-5" />, value: formatNumber(globalStats.totalRidership), label: 'נוסעים/שנה', color: 'text-teal-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className={`inline-flex p-2 rounded-lg bg-muted mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="top10" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="top10">Top 10</TabsTrigger>
            <TabsTrigger value="distribution">התפלגות</TabsTrigger>
            <TabsTrigger value="growth">צמיחה</TabsTrigger>
            <TabsTrigger value="records">שיאים</TabsTrigger>
          </TabsList>

          {/* Top 10 Charts */}
          <TabsContent value="top10" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top by Length */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Top 10 - הארוכות ביותר (ק״מ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topByLength} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [`${value} ק״מ`, 'אורך']}
                        contentStyle={{ textAlign: 'right' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top by Stations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Top 10 - הכי הרבה תחנות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topByStations} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [`${value} תחנות`, 'תחנות']}
                        contentStyle={{ textAlign: 'right' }}
                      />
                      <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top by Ridership */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top 10 - העמוסות ביותר (מיליון נוסעים/שנה)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topByRidership}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} מיליון`, 'נוסעים']}
                        contentStyle={{ textAlign: 'right' }}
                      />
                      <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribution Charts */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* By Continent */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    התפלגות לפי יבשות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={byContinent}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {byContinent.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} מערכות`, 'כמות']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {byContinent.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <span className="text-muted-foreground mr-auto">({item.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Train className="h-5 w-5" />
                    התפלגות לפי סוג מערכת
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={byType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} מערכות`, 'כמות']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {byType.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <span className="text-muted-foreground mr-auto">({item.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Growth Chart */}
          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  צמיחת מערכות לאורך השנים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={byDecade}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="decade" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="new" fill="#3b82f6" name="מערכות חדשות" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} name="סה״כ מצטבר" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records */}
          <TabsContent value="records">
            {records && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'הראשונה בעולם', icon: <Calendar className="h-5 w-5" />, system: records.oldest, stat: `${records.oldest.stats.opened_year}`, color: 'bg-amber-500' },
                  { title: 'החדשה ביותר', icon: <Calendar className="h-5 w-5" />, system: records.newest, stat: `${records.newest.stats.opened_year}`, color: 'bg-green-500' },
                  { title: 'הארוכה ביותר', icon: <Ruler className="h-5 w-5" />, system: records.longest, stat: `${records.longest.stats.length_km} ק״מ`, color: 'bg-blue-500' },
                  { title: 'הכי הרבה תחנות', icon: <Building2 className="h-5 w-5" />, system: records.mostStations, stat: `${records.mostStations.stats.stations} תחנות`, color: 'bg-purple-500' },
                  { title: 'הכי עמוסה', icon: <Users className="h-5 w-5" />, system: records.busiest, stat: formatNumber(records.busiest.stats.annual_ridership), color: 'bg-red-500' },
                  { title: 'הכי הרבה קווים', icon: <Hash className="h-5 w-5" />, system: records.mostLines, stat: `${records.mostLines.stats.lines} קווים`, color: 'bg-pink-500' },
                ].map((record, i) => (
                  <motion.div
                    key={record.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/system/${record.system.id}`}>
                      <Card className="hover:shadow-lg hover:border-primary/30 transition-all h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${record.color} text-white`}>
                              <Trophy className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">{record.title}</p>
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                <span>{getFlag(record.system.country.code)}</span>
                                {record.system.name.he}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {record.system.city.he}, {record.system.country.he}
                              </p>
                              <Badge className="mt-2" variant="secondary">
                                {record.stat}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
