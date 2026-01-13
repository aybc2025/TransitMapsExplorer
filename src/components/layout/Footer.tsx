import { Link } from 'react-router-dom';
import { Train, Github, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Train className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">מפות תחבורה מכל העולם</h3>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              אוסף מקיף של מערכות התחבורה ההמונית בעולם - מפות, נתונים והיסטוריה.
              בהשראת הספר "Transit Maps of the World" מאת Mark Ovenden.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">ניווט מהיר</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  כל המערכות
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  אודות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">צור קשר</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:contact@transit-maps.co.il" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  contact@transit-maps.co.il
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} מפות תחבורה מכל העולם. כל הזכויות שמורות.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            נבנה עם <Heart className="h-4 w-4 text-red-500 fill-red-500" /> לחובבי תחבורה
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground/70 text-center max-w-3xl mx-auto">
            המידע באתר מיועד למטרות מידע בלבד. כל הזכויות שמורות לחברות התחבורה המקוריות.
            נתונים נאספו ממקורות ציבוריים זמינים. המפות הרשמיות הן רכושם של חברות התחבורה.
          </p>
        </div>
      </div>
    </footer>
  );
}
