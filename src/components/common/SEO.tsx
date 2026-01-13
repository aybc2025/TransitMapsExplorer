import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const DEFAULT_TITLE = 'מפות תחבורה מכל העולם';
const DEFAULT_DESCRIPTION = 'אתר אינטראקטיבי בעברית המציג מערכות תחבורה המונית מכל העולם - רכבות תחתיות, רכבות קלות, חשמליות ועוד. מפות, נתונים סטטיסטיים והיסטוריה.';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = 'https://transit-maps.co.il';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website'
}: SEOProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Language */}
      <html lang="he" dir="rtl" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={DEFAULT_TITLE} />
      <meta property="og:locale" content="he_IL" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Transit Maps Explorer" />
      <meta name="keywords" content="מטרו, רכבת תחתית, תחבורה ציבורית, מפות תחבורה, רכבת קלה, metro, subway, transit maps" />
    </Helmet>
  );
}
