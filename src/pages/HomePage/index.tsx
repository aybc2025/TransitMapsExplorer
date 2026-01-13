import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Train, Search, MapPin, ArrowLeft, Sparkles, 
  Clock, Users, Ruler, Building2, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { WorldMap } from '@/components/map/WorldMap';
import { SystemCard } from '@/components/common/SystemCard';
import { dataService } from '@/services/dataService';
import type { TransitSystemSummary } from '@/types';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface FeaturedSystem {
  system: TransitSystemSummary;
  label: string;
  icon: React.ReactNode;
  stat: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState<TransitSystemSummary[]>([]);
  const [featuredSystems, setFeaturedSystems] = useState<FeaturedSystem[]>([]);
  const [stats, setStats] = useState({
    totalSystems: 0,
    totalStations: 0,
    totalLength: 0,
    totalRidership: 0,
    uniqueCountries: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allSystems, globalStats, featured] = await Promise.all([
          dataService.getAllSystems(),
          dataService.getGlobalStats(),
          dataService.getFeaturedSystems()
        ]);

        setSystems(allSystems);
        setStats(globalStats);
        setFeaturedSystems([
          {
            system: featured.oldest,
            label: 'הראשונה בעולם',
            icon: <Clock className="h-5 w-5" />,
            stat: `${featured.oldest.stats.opened_year}`
          },
          {
            system: featured.longest,
            label: 'הארוכה ביותר',
            icon: <Ruler className="h-5 w-5" />,
            stat: `${featured.longest.stats.length_km} ק"מ`
          },
          {
            system: featured.busiest,
            label: 'העמוסה ביותר',
            icon: <Users className="h-5 w-5" />,
            stat: `${(featured.busiest.stats.annual_ridership / 1_000_000_000).toFixed(1)}B נוסעים`
          },
          {
            system: featured.mostStations,
            label: 'הכי הרבה תחנות',
            icon: <Building2 className="h-5 w-5" />,
            stat: `${featured.mostStations.stats.stations} תחנות`
          }
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSystemClick = (system: TransitSystemSummary) => {
    navigate(`/system/${system.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                גלה את עולם התחבורה ההמונית
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              מפות תחבורה
              <br />
              <span className="text-white/80">מכל העולם</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed"
            >
              אוסף מקיף של מערכות תחבורה המונית מ-{stats.uniqueCountries}+ מדינות ברחבי העולם.
              <br className="hidden md:block" />
              גלה מפות, נתונים, והיסטוריה של מטרו, רכבת קלה, וחשמליות.
            </motion.p>

            {/* Search Box */}
            <motion.form 
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="flex gap-3 max-w-xl mx-auto mb-8"
            >
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="חפש עיר או מדינה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pr-12 text-lg bg-white text-foreground rounded-xl"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-accent hover:bg-accent/90">
                חפש
              </Button>
            </motion.form>

            {/* Quick Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { value: `${stats.totalSystems}+`, label: 'מערכות', icon: <Train /> },
                { value: `${Math.round(stats.totalLength / 1000)}K`, label: 'ק״מ', icon: <Ruler /> },
                { value: `${Math.round(stats.totalStations / 1000)}K`, label: 'תחנות', icon: <MapPin /> },
                { value: `${stats.uniqueCountries}`, label: 'מדינות', icon: <Globe /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm flex items-center justify-center gap-1">
                    {stat.icon}
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">מפת העולם</h2>
            <p className="text-muted-foreground">לחץ על סמן כדי לראות פרטים על המערכת</p>
          </div>
          
          {!isLoading && systems.length > 0 && (
            <WorldMap 
              systems={systems} 
              height="550px"
              onSystemClick={handleSystemClick}
            />
          )}
        </div>
      </section>

      {/* Featured Systems */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">המערכות המיוחדות</h2>
            <p className="text-muted-foreground">שיאים ומערכות בולטות מכל העולם</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSystems.map((item, index) => (
              <motion.div
                key={item.system.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/system/${item.system.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                    <div className="relative h-32 overflow-hidden">
                      {(item.system.headerImage || item.system.thumbnail) ? (
                        <img
                          src={item.system.headerImage || item.system.thumbnail}
                          alt={item.system.name.he}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 right-3 left-3">
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <div className="text-xl font-bold text-white">{item.stat}</div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {item.system.name.he}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.system.city.he}, {item.system.country.he}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Systems Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">מערכות נבחרות</h2>
              <p className="text-muted-foreground">חלק מהמערכות המובילות באוסף שלנו</p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="gap-2">
                צפה בכולן
                <ArrowLeft className="h-4 w-4 rtl-flip" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {systems.slice(0, 8).map((system, index) => (
              <SystemCard key={system.id} system={system} index={index} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/browse">
              <Button size="lg" className="gap-2">
                גלה את כל {stats.totalSystems} המערכות
                <ArrowLeft className="h-5 w-5 rtl-flip" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Train className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              מתכננים טיול?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              גלו את מערכות התחבורה בערים שאתם מתכוונים לבקר בהן.
              מידע על מפות, מחירים, ועצות שימושיות.
            </p>
            <Link to="/browse">
              <Button size="lg" variant="secondary" className="gap-2">
                התחל לחקור
                <ArrowLeft className="h-5 w-5 rtl-flip" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
