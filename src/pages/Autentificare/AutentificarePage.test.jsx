import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loginUtilizator } from '../../api/authApi.js';
import { httpClient, salveazaToken } from '../../api/httpClient.js';
import { getProfil } from '../../api/utilizatoriApi.js';
import AppHeader from '../../components/AppHeader.jsx';
import SesiuneProvider from '../../components/SesiuneProvider.jsx';

import AutentificarePage from './AutentificarePage.jsx';

vi.mock('../../api/authApi.js', () => ({
  loginUtilizator: vi.fn(),
  registerUtilizator: vi.fn(),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

/**
 * O pagina protejata oarecare: arata ziua din adresa, ca testul sa vada si
 * parametrii pastrati la intoarcere.
 */
function RezervariStub() {
  const [parametri] = useSearchParams();
  return <p>Pagina rezervărilor pentru {parametri.get('zi')}</p>;
}

/**
 * Randeaza antetul si rutele aplicatiei, cu sesiunea, pornind de la `ruta`.
 * @param {string | object} ruta Intrarea initiala din istoric.
 */
function renderAplicatia(ruta) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ruta]}>
        <SesiuneProvider>
          <AppHeader />
          <Routes>
            <Route path="/" element={<p>Pagina principală</p>} />
            <Route path="/autentificare" element={<AutentificarePage />} />
            <Route path="/rezervari" element={<RezervariStub />} />
          </Routes>
        </SesiuneProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

/**
 * Completeaza formularul de autentificare si il trimite.
 * @param {import('@testing-library/user-event').UserEvent} user
 * @param {{email: string, parola: string}} date
 */
async function autentifica(user, { email, parola }) {
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Parolă'), parola);
  await user.click(screen.getByRole('button', { name: 'Autentifică-te' }));
}

describe('AutentificarePage', () => {
  const adaptorOriginal = httpClient.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(loginUtilizator).mockReset();
    vi.mocked(getProfil).mockReset();
  });

  afterEach(() => {
    httpClient.defaults.adapter = adaptorOriginal;
  });

  it('arata erorile langa campuri si nu trimite cererea', async () => {
    const user = renderAplicatia('/autentificare');

    await user.click(screen.getByRole('button', { name: 'Autentifică-te' }));

    expect(
      await screen.findByText('E-mailul este obligatoriu.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Parola este obligatorie.')).toBeInTheDocument();
    expect(screen.getByLabelText('Parolă')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(loginUtilizator).not.toHaveBeenCalled();
  });

  it('respinge un e-mail fara formatul unei adrese', async () => {
    const user = renderAplicatia('/autentificare');

    await autentifica(user, { email: 'ana.pop', parola: 'parola123' });

    expect(
      await screen.findByText('Adresa de e-mail nu are un format valid.'),
    ).toBeInTheDocument();
    expect(loginUtilizator).not.toHaveBeenCalled();
  });

  it('din linkul din antet intoarce utilizatorul pe pagina curenta', async () => {
    vi.mocked(loginUtilizator).mockResolvedValue({
      token: 'abc.def.ghi',
      utilizator: ANA,
    });
    const user = renderAplicatia('/rezervari?zi=2026-11-24');

    await user.click(
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Autentificare',
      }),
    );
    await autentifica(user, { email: ANA.email, parola: 'parola123' });

    expect(
      await screen.findByText('Pagina rezervărilor pentru 2026-11-24'),
    ).toBeInTheDocument();
  });

  it('dupa login arata numele si categoria in antet', async () => {
    vi.mocked(loginUtilizator).mockResolvedValue({
      token: 'abc.def.ghi',
      utilizator: ANA,
    });
    const user = renderAplicatia('/autentificare');

    await autentifica(user, { email: ANA.email, parola: 'parola123' });

    const antet = screen.getByRole('banner');
    expect(await within(antet).findByText('Ana Pop')).toBeInTheDocument();
    expect(within(antet).getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Pagina principală')).toBeInTheDocument();
    expect(vi.mocked(loginUtilizator).mock.calls[0][0]).toEqual({
      email: ANA.email,
      parola: 'parola123',
    });
  });

  it('la 401 arata mesajul serverului si ramane Guest', async () => {
    vi.mocked(loginUtilizator).mockRejectedValue({
      response: {
        status: 401,
        data: {
          cod: 'AUTENTIFICARE_ESUATA',
          mesaj: 'E-mailul sau parola nu sunt corecte.',
        },
      },
    });
    const user = renderAplicatia('/autentificare');

    await autentifica(user, { email: ANA.email, parola: 'gresita1' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mailul sau parola nu sunt corecte.',
    );
    expect(localStorage.length).toBe(0);
    expect(
      within(screen.getByRole('banner')).queryByText('Ana Pop'),
    ).not.toBeInTheDocument();
  });

  it('dupa reincarcare cere profilul si ramane autentificat', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockResolvedValue(ANA);

    renderAplicatia('/');

    const antet = screen.getByRole('banner');
    expect(await within(antet).findByText('Ana Pop')).toBeInTheDocument();
    expect(within(antet).getByText('Student')).toBeInTheDocument();
  });

  it('cat se incarca profilul nu arata antetul de Guest', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockReturnValue(new Promise(() => {}));

    renderAplicatia('/');

    const antet = screen.getByRole('banner');
    expect(
      await within(antet).findByRole('status', { name: 'Se încarcă profilul' }),
    ).toBeInTheDocument();
    expect(
      within(antet).queryByRole('link', { name: 'Autentificare' }),
    ).not.toBeInTheDocument();
  });

  it('arata eroarea cand profilul nu se poate incarca', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockRejectedValue({
      response: { status: 500, data: { cod: 'EROARE', mesaj: 'Eroare.' } },
    });

    renderAplicatia('/');

    const antet = screen.getByRole('banner');
    expect(await within(antet).findByRole('alert')).toHaveTextContent(
      'Profilul nu s-a putut încărca.',
    );
    expect(
      within(antet).getByRole('button', { name: 'Deconectare' }),
    ).toBeInTheDocument();
  });

  it('Deconectare sterge tokenul si antetul revine la Guest', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockResolvedValue(ANA);
    const user = renderAplicatia('/');
    const antet = screen.getByRole('banner');

    await user.click(
      await within(antet).findByRole('button', { name: 'Deconectare' }),
    );

    expect(within(antet).queryByText('Ana Pop')).not.toBeInTheDocument();
    expect(
      within(antet).getByRole('link', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it('la 401 pe alta cerere duce la autentificare si apoi inapoi', async () => {
    salveazaToken('expirat');
    vi.mocked(getProfil).mockResolvedValue(ANA);
    vi.mocked(loginUtilizator).mockResolvedValue({
      token: 'nou',
      utilizator: ANA,
    });
    const user = renderAplicatia('/rezervari?zi=2026-11-23');
    await within(screen.getByRole('banner')).findByText('Ana Pop');

    // O cerere oarecare a paginii primeste 401 de la server.
    httpClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        '401',
        'ERR_BAD_REQUEST',
        config,
        {},
        {
          status: 401,
          data: {},
          headers: {},
          config,
        },
      );
    };
    await expect(httpClient.get('/rezervari')).rejects.toThrow();

    expect(
      await screen.findByRole('heading', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    expect(localStorage.length).toBe(0);

    await autentifica(user, { email: ANA.email, parola: 'parola123' });

    expect(
      await screen.findByText('Pagina rezervărilor pentru 2026-11-23'),
    ).toBeInTheDocument();
  });
});
