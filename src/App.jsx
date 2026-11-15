import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import AppFooter from './components/AppFooter.jsx';
import AppHeader from './components/AppHeader.jsx';
import FacilitatiPage from './pages/Facilitati/FacilitatiPage.jsx';
import InregistrarePage from './pages/Inregistrare/InregistrarePage.jsx';

/**
 * Componenta radacina: antetul, rutele aplicatiei si subsolul.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <Routes>
            <Route path="/" element={<Navigate to="/facilitati" replace />} />
            <Route path="/facilitati" element={<FacilitatiPage />} />
            <Route path="/inregistrare" element={<InregistrarePage />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}
