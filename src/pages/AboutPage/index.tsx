import { motion } from 'framer-motion';
import { Train, Mail, Github, Book, Heart, Database, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Train className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">אודות מפות תחבורה מכל העולם</h1>
            <p className="text-lg opacity-90">
              פרויקט שנוצר מתוך אהבה למפות, תחבורה ציבורית ועיצוב אינפורמציה
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  על הפרויקט
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <p className="leading-relaxed">
                  פרויקט זה נוצר בהשראת הספר המופלא 
                  <strong> "Transit Maps of the World"</strong>
                  {' '}מאת Mark Ovenden - אוסף מרהיב של מפות תחבורה המונית מכל רחבי העולם.
                </p>
                <p className="leading-relaxed mt-4">
                  המטרה שלנו היא ליצור משאב מקיף בעברית המרכז את כל מערכות התחבורה ההמונית 
                  בעולם במקום אחד, עם נתונים עדכניים, מפות, והיסטוריה.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  מקורות מידע
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">📚 מידע וסטטיסטיקות</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Wikipedia (עברית ואנגלית)</li>
                      <li>• Wikidata</li>
                      <li>• אתרים רשמיים של חברות תחבורה</li>
                      <li>• דוחות שנתיים וסטטיסטיקות ציבוריות</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🗺️ מפות</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• קישורים למפות רשמיות</li>
                      <li>• OpenStreetMap (רישיון ODbL)</li>
                      <li>• מפות היסטוריות מארכיונים ציבוריים</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  צור קשר
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:contact@transit-maps.co.il" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex-1">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">אימייל</div>
                      <div className="text-sm text-muted-foreground">contact@transit-maps.co.il</div>
                    </div>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex-1">
                    <Github className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">GitHub</div>
                      <div className="text-sm text-muted-foreground">קוד פתוח (בקרוב)</div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  זכויות יוצרים
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>המידע באתר מיועד למטרות מידע בלבד. כל הזכויות שמורות לחברות התחבורה המקוריות.</p>
                <Separator />
                <p className="text-sm">© {new Date().getFullYear()} מפות תחבורה מכל העולם. כל הזכויות שמורות.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto text-red-500 fill-red-500 mb-3" />
                  <p className="text-lg">נבנה עם אהבה לחובבי תחבורה ומפות</p>
                  <p className="text-muted-foreground mt-2">בהשראת הספר "Transit Maps of the World" מאת Mark Ovenden</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
