import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router';

import FacilitatiPage from './pages/Facilitati/FacilitatiPage.jsx';

/**
 * Componenta radacina: bara de navigare si rutele aplicatiei.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <header className="bg-emerald-700 text-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <span className="text-lg font-bold">Campus Sports Booking</span>
            <NavLink
              to="/facilitati"
              className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-emerald-600 aria-[current=page]:bg-emerald-800"
            >
              Facilități
            </NavLink>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/facilitati" replace />} />
            <Route path="/facilitati" element={<FacilitatiPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
