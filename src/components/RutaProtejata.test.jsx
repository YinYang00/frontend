import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loginUtilizator } from '../api/authApi.js';
import { salveazaToken } from '../api/httpClient.js';
import { getProfil } from '../api/utilizatoriApi.js';
import AutentificarePage from '../pages/Autentificare/AutentificarePage.jsx';
import { renderAplicatia } from '../test/renderAplicatia.jsx';

import RutaProtejata from './RutaProtejata.jsx';

vi.mock('../api/authApi.js', () => ({
  loginUtilizator: vi.fn(),
  registerUtilizator: vi.fn(),
}));
vi.mock('../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

const RUTE = (
  <>
    <Route path="/autentificare" element={<AutentificarePage />} />
    <Route element={<RutaProtejata />}>
      <Route path="/rezervari" element={<p>Pagina rezervărilor</p>} />
    </Route>
    <Route element={<RutaProtejata rol="Administrator" />}>
      <Route path="/admin/facilitati" element={<p>Pagina de administrare</p>} />
    </Route>
  </>
);

describe('RutaProtejata', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(loginUtilizator).mockReset();
    vi.mocked(getProfil).mockReset();
  });

  it('trimite Guest la autentificare si apoi inapoi pe ruta ceruta', async () => {
    vi.mocked(loginUtilizator).mockResolvedValue({
      token: 'abc.def.ghi',
      utilizator: ANA,
    });
    const user = renderAplicatia('/rezervari?zi=2026-11-24', RUTE);

    expect(
      await screen.findByRole('heading', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Pagina rezervărilor')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('E-mail'), ANA.email);
    await user.type(screen.getByLabelText('Parolă'), 'parola123');
    await user.click(screen.getByRole('button', { name: 'Autentifică-te' }));

    expect(await screen.findByText('Pagina rezervărilor')).toBeInTheDocument();
    expect(
      within(screen.getByRole('banner')).getByText('Ana Pop'),
    ).toBeInTheDocument();
  });

  it('arata Nu ai acces unui Utilizator pe o ruta de administrare', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockResolvedValue(ANA);

    renderAplicatia('/admin/facilitati', RUTE);

    expect(
      await screen.findByRole('heading', {
        name: 'Nu ai acces la această pagină',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Pagina de administrare'),
    ).not.toBeInTheDocument();
  });

  it('cat se incarca profilul asteapta, apoi Administratorul vede pagina', async () => {
    salveazaToken('abc.def.ghi');
    let raspundeProfilul;
    vi.mocked(getProfil).mockReturnValue(
      new Promise((resolve) => {
        raspundeProfilul = resolve;
      }),
    );

    renderAplicatia('/admin/facilitati', RUTE);

    expect(
      screen.getByRole('status', { name: 'Se încarcă pagina' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Nu ai acces la această pagină' }),
    ).not.toBeInTheDocument();

    raspundeProfilul({ ...ANA, nume: 'Ion Admin', rol: 'Administrator' });

    expect(
      await screen.findByText('Pagina de administrare'),
    ).toBeInTheDocument();
  });

  it('arata eroarea cand profilul nu se poate incarca', async () => {
    salveazaToken('abc.def.ghi');
    vi.mocked(getProfil).mockRejectedValue({
      response: { status: 500, data: { cod: 'EROARE', mesaj: 'Eroare.' } },
    });

    renderAplicatia('/rezervari', RUTE);

    expect(
      await screen.findByText(
        'Pagina nu se poate afișa: profilul nu s-a putut încărca.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Pagina rezervărilor')).not.toBeInTheDocument();
  });
});
