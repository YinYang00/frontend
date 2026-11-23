// Helper-ul comun de randare din testele paginilor: un QueryClient nou, fara
// reincercari, un router in memorie pornit de la `ruta`, sesiunea si antetul.
// Un utilizator autentificat se pregateste in test cu salveazaToken si cu
// raspunsul lui getProfil. Testele politicii de reincercare dau clientul
// aplicatiei prin `optiuni.queryClient`.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes } from 'react-router';

import AppHeader from '../components/AppHeader.jsx';
import SesiuneProvider from '../components/SesiuneProvider.jsx';

/**
 * Randeaza antetul si rutele date, cu sesiunea, pornind de la `ruta`.
 * @param {string | object} ruta Intrarea initiala din istoric.
 * @param {import('react').ReactNode} rute Elementele `<Route>` ale testului.
 * @param {object} [optiuni]
 * @param {QueryClient} [optiuni.queryClient] Clientul folosit in locul celui
 *   fara reincercari.
 * @returns {import('@testing-library/user-event').UserEvent}
 */
export function renderAplicatia(ruta, rute, optiuni = {}) {
  const queryClient =
    optiuni.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ruta]}>
        <SesiuneProvider>
          <AppHeader />
          <Routes>{rute}</Routes>
        </SesiuneProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}
