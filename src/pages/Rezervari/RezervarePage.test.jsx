import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { salveazaToken } from '../../api/httpClient.js';
import { getRezervare } from '../../api/rezervariApi.js';
import { getProfil } from '../../api/utilizatoriApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import RezervarePage from './RezervarePage.jsx';

vi.mock('../../api/rezervariApi.js', () => ({ getRezervare: vi.fn() }));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ACUM = new Date('2026-11-20T12:00:00+02:00');

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

// O rezervare ca in raspunsul GET /rezervari/{id_rezervare}.
const REZERVARE = {
  id_rezervare: 7,
  stare_rezervare: 'Confirmata',
  cod_qr: 'a1b2c3d4-e5f6',
  data_crearii: '2026-11-10T09:00:00+02:00',
  slot: {
    id_slot: 12,
    ora_inceput: '2026-11-25T10:00:00+02:00',
    ora_sfarsit: '2026-11-25T11:00:00+02:00',
  },
  facilitate: { id_facilitate: 3, denumire: 'Teren tenis' },
};

const RUTE = <Route path="/rezervari/:id" element={<RezervarePage />} />;

describe('RezervarePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ACUM);
    salveazaToken('token-ana');
    vi.mocked(getProfil).mockResolvedValue(ANA);
    vi.mocked(getRezervare).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('arata facilitatea, ziua, intervalul, starea si codul rezervarii', async () => {
    vi.mocked(getRezervare).mockResolvedValue(REZERVARE);

    renderAplicatia('/rezervari/7', RUTE);

    expect(
      await screen.findByRole('heading', { name: 'Teren tenis' }),
    ).toBeInTheDocument();
    expect(getRezervare).toHaveBeenCalledWith('7');
    expect(screen.getByText(/25 noiembrie/)).toBeInTheDocument();
    expect(screen.getByText('10:00 – 11:00')).toBeInTheDocument();
    expect(screen.getByText('Confirmată')).toBeInTheDocument();
    expect(screen.getByText('a1b2c3d4-e5f6')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Înapoi la rezervări/ }),
    ).toHaveAttribute('href', '/rezervari');
  });

  it('la 404 spune ca rezervarea nu exista si trimite inapoi la rezervari', async () => {
    vi.mocked(getRezervare).mockRejectedValue({
      response: {
        status: 404,
        data: { cod: 'NOT_FOUND', mesaj: 'Rezervarea 99 nu există.' },
      },
    });

    renderAplicatia('/rezervari/99', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Rezervarea nu există',
    );
    expect(
      screen.getByRole('link', { name: /Înapoi la rezervări/ }),
    ).toHaveAttribute('href', '/rezervari');
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('arata mesajul de eroare cand serverul nu raspunde', async () => {
    vi.mocked(getRezervare).mockRejectedValue({ request: {} });

    renderAplicatia('/rezervari/7', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serverul nu răspunde',
    );
  });
});
