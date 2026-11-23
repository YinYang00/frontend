import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate, getFacilitati } from './api/facilitatiApi.js';
import { salveazaToken } from './api/httpClient.js';
import { getProfil } from './api/utilizatoriApi.js';
import App from './App.jsx';

vi.mock('./api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));
vi.mock('./api/facilitatiApi.js', () => ({
  getFacilitati: vi.fn(),
  getFacilitate: vi.fn(),
  createFacilitate: vi.fn(),
  updateFacilitate: vi.fn(),
  deleteFacilitate: vi.fn(),
}));

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

const ADMIN = {
  ...ANA,
  id_utilizator: 2,
  nume: 'Ion Rusu',
  rol: 'Administrator',
};

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

/**
 * Randeaza aplicatia reala, cu rutele ei, deschisa la `ruta`.
 * @param {string} ruta
 */
function renderApp(ruta) {
  window.history.pushState({}, '', ruta);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getProfil).mockReset();
    vi.mocked(getFacilitati).mockReset().mockResolvedValue([BAZIN]);
    vi.mocked(getFacilitate).mockReset().mockResolvedValue(BAZIN);
  });

  it('trimite Guest de pe Rezervarile mele la autentificare', async () => {
    renderApp('/rezervari');

    expect(
      await screen.findByRole('heading', { name: 'Autentificare' }),
    ).toBeInTheDocument();
  });

  it('nu lasa un Utilizator pe paginile de administrare', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockResolvedValue(ANA);

    renderApp('/admin/facilitati');

    expect(
      await screen.findByRole('heading', {
        name: 'Nu ai acces la această pagină',
      }),
    ).toBeInTheDocument();
  });

  it('duce administratorul din meniu la administrarea facilitatilor', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockResolvedValue(ADMIN);
    renderApp('/facilitati');
    const user = userEvent.setup();

    expect(
      await screen.findByRole('link', { name: 'Bazin olimpic' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Adaugă facilitate' }),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByRole('link', { name: 'Administrare' }));
    await user.click(
      await screen.findByRole('link', { name: 'Bazin olimpic' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Bazin olimpic' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/facilitati/7');
  });
});
