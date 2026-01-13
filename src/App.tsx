import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from '@/components/layout';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { SystemPage } from '@/pages/SystemPage';
import { AboutPage } from '@/pages/AboutPage';
import { ComparePage } from '@/pages/ComparePage';
import { TimelinePage } from '@/pages/TimelinePage';
import { StatisticsPage } from '@/pages/StatisticsPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/system/:id" element={<SystemPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
