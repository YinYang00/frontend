import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { salveazaToken } from './api/httpClient.js';
import { getProfil } from './api/utilizatoriApi.js';
import App from './App.jsx';

vi.mock('./api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
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
});
