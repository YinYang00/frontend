import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { salveazaToken } from '../../api/httpClient.js';
import { getRezervari } from '../../api/rezervariApi.js';
import { getProfil } from '../../api/utilizatoriApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import RezervariPage from './RezervariPage.jsx';

vi.mock('../../api/rezervariApi.js', () => ({ getRezervari: vi.fn() }));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ACUM = new Date('2026-11-20T12:00:00+02:00');

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

/**
 * O rezervare ca in raspunsul GET /rezervari.
 * @param {number} id
 * @param {string} stare
 * @param {string} inceput Ora de inceput, ISO 8601; slotul tine o ora.
 * @param {string} denumire
 */
function rezervare(id, stare, inceput, denumire) {
  const ora = new Date(inceput);
  return {
    id_rezervare: id,
    id_utilizator: 1,
    stare_rezervare: stare,
    cod_qr: `qr-${id}`,
    data_crearii: '2026-11-10T09:00:00+02:00',
    slot: {
      id_slot: id,
      ora_inceput: ora.toISOString(),
      ora_sfarsit: new Date(ora.getTime() + 60 * 60 * 1000).toISOString(),
    },
    facilitate: { id_facilitate: id, denumire },
  };
}

const RUTE = <Route path="/rezervari" element={<RezervariPage />} />;

/**
 * Textele randurilor dintr-o sectiune a paginii.
 * @param {string} titlu
 * @returns {string[]}
 */
function getRanduri(titlu) {
  return within(screen.getByRole('region', { name: titlu }))
    .getAllByRole('listitem')
    .map((rand) => rand.textContent);
}

describe('RezervariPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ACUM);
    salveazaToken('token-ana');
    vi.mocked(getProfil).mockResolvedValue(ANA);
    vi.mocked(getRezervari).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('imparte rezervarile in Viitoare si Istoric, cu etichetele starilor', async () => {
    vi.mocked(getRezervari).mockResolvedValue([
      rezervare(1, 'Confirmata', '2026-11-25T10:00:00+02:00', 'Teren tenis'),
      rezervare(2, 'Confirmata', '2026-11-19T10:00:00+02:00', 'Sala fitness'),
      rezervare(3, 'Anulata', '2026-11-22T10:00:00+02:00', 'Bazin'),
      rezervare(
        4,
        'PrezentaConfirmata',
        '2026-11-20T11:30:00+02:00',
        'Sala box',
      ),
      rezervare(5, 'Neonorata', '2026-11-18T10:00:00+02:00', 'Teren fotbal'),
      rezervare(
        6,
        'PrezentaConfirmata',
        '2026-11-21T08:00:00+02:00',
        'Sala yoga',
      ),
      rezervare(7, 'Confirmata', '2026-11-21T10:00:00+02:00', 'Teren baschet'),
    ]);

    renderAplicatia('/rezervari', RUTE);

    await screen.findByRole('region', { name: 'Viitoare' });
    const viitoare = getRanduri('Viitoare');
    expect(viitoare).toHaveLength(4);
    expect(viitoare[0]).toMatch(/Sala box.*11:30 – 12:30.*În desfășurare/);
    expect(viitoare[1]).toMatch(
      /Sala yoga.*08:00 – 09:00.*Prezență confirmată/,
    );
    expect(viitoare[2]).toMatch(/Teren baschet.*Confirmată/);
    expect(viitoare[3]).toMatch(/Teren tenis.*25 noiembrie.*Confirmată/);

    const istoric = getRanduri('Istoric');
    expect(istoric).toHaveLength(3);
    expect(istoric[0]).toMatch(/Bazin.*Anulată/);
    expect(istoric[1]).toMatch(/Sala fitness.*Finalizată/);
    expect(istoric[2]).toMatch(/Teren fotbal.*Neonorată/);

    expect(screen.getByRole('link', { name: /Bazin/ })).toHaveAttribute(
      'href',
      '/rezervari/3',
    );
  });

  it('cand nu exista rezervari trimite spre facilitati', async () => {
    vi.mocked(getRezervari).mockResolvedValue([]);

    renderAplicatia('/rezervari', RUTE);

    expect(
      await screen.findByText(/Nu ai încă nicio rezervare/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Vezi facilitățile' }),
    ).toHaveAttribute('href', '/facilitati');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('arata mesajul de eroare cand serverul nu raspunde', async () => {
    vi.mocked(getRezervari).mockRejectedValue({ request: {} });

    renderAplicatia('/rezervari', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serverul nu răspunde',
    );
  });
});
