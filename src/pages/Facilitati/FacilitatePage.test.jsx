import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate, getSloturi } from '../../api/facilitatiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import FacilitatePage from './FacilitatePage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  getSloturi: vi.fn(),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

// In UTC e inca 24 octombrie, dar in Romania e deja duminica, 25 octombrie,
// ziua trecerii la ora de iarna.
const ACUM = new Date('2026-10-24T22:30:00Z');

const RUTE = <Route path="/facilitati/:id" element={<FacilitatePage />} />;

describe('FacilitatePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ACUM);
    vi.mocked(getFacilitate).mockReset().mockResolvedValue(BAZIN);
    vi.mocked(getSloturi).mockReset().mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('arata detaliile facilitatii si banda de 14 zile care incepe azi', async () => {
    renderAplicatia('/facilitati/7', RUTE);

    expect(
      await screen.findByRole('heading', { name: 'Bazin olimpic' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Complex sportiv/)).toBeInTheDocument();
    expect(getFacilitate).toHaveBeenCalledWith('7');

    const zile = within(
      screen.getByRole('group', { name: 'Alege ziua' }),
    ).getAllByRole('button');
    expect(zile).toHaveLength(14);
    expect(zile[0]).toHaveAccessibleName(/25 oct/);
    expect(zile[0]).toHaveAttribute('aria-pressed', 'true');
    expect(zile[13]).toHaveAccessibleName(/7 nov/);
    expect(getSloturi).toHaveBeenCalledWith(7, '2026-10-25');
  });

  it('cere sloturile zilei alese', async () => {
    const user = renderAplicatia('/facilitati/7', RUTE);

    const zi = await screen.findByRole('button', { name: /27 oct/ });
    await user.click(zi);

    expect(zi).toHaveAttribute('aria-pressed', 'true');
    expect(getSloturi).toHaveBeenLastCalledWith(7, '2026-10-27');
  });

  it('arata sloturile zilei dupa ora, in ora Romaniei, cu starea lor', async () => {
    // Orele vin in UTC. Pana la 01:00Z Romania e la ora de vara (+03:00),
    // deci 23:00Z din ziua de dinainte este 02:00; dupa trecerea la ora de
    // iarna (+02:00), 06:00Z este 08:00.
    vi.mocked(getSloturi).mockResolvedValue([
      slot(3, '2026-10-25T08:00:00Z', 'Mentenanta', 0),
      slot(1, '2026-10-25T06:00:00Z', 'Liber', 12),
      slot(2, '2026-10-25T07:00:00Z', 'Ocupat', 0),
      slot(4, '2026-10-24T23:00:00Z', 'Liber', 1),
    ]);

    renderAplicatia('/facilitati/7', RUTE);

    const sloturi = within(
      await screen.findByRole('list', { name: 'Sloturile zilei' }),
    ).getAllByRole('listitem');
    expect(sloturi.map((element) => element.textContent)).toEqual([
      expect.stringMatching(/02:00 – 03:00.*Liber.*1 loc liber/),
      expect.stringMatching(/08:00 – 09:00.*Liber.*12 locuri libere/),
      expect.stringMatching(/09:00 – 10:00.*Ocupat/),
      expect.stringMatching(/10:00 – 11:00.*Mentenanță/),
    ]);
    // Blocarea sloturilor e doar pe pagina de administrare.
    expect(
      screen.queryByRole('button', { name: /Blochează|Deblochează/ }),
    ).not.toBeInTheDocument();
  });

  it('arata ambele sloturi de la 03:00 din noaptea trecerii la ora de iarna', async () => {
    // La 01:00Z ceasul se da inapoi de la 04:00 la 03:00, deci ora 03:00
    // apare de doua ori: o data la +03:00 (00:00Z), o data la +02:00 (01:00Z).
    vi.mocked(getSloturi).mockResolvedValue([
      slot(2, '2026-10-25T01:00:00Z', 'Liber', 30),
      slot(1, '2026-10-25T00:00:00Z', 'Liber', 30),
    ]);

    renderAplicatia('/facilitati/7', RUTE);

    const sloturi = within(
      await screen.findByRole('list', { name: 'Sloturile zilei' }),
    ).getAllByRole('listitem');
    expect(sloturi.map((element) => element.textContent)).toEqual([
      expect.stringMatching(/^03:00 – 03:00/),
      expect.stringMatching(/^03:00 – 04:00/),
    ]);
  });

  it('nu arata locurile libere la o facilitate cu capacitatea 1', async () => {
    vi.mocked(getFacilitate).mockResolvedValue({
      ...BAZIN,
      denumire: 'Teren tenis',
      tip: 'Tenis',
      capacitate_maxima: 1,
    });
    vi.mocked(getSloturi).mockResolvedValue([
      slot(1, '2026-10-25T06:00:00Z', 'Liber', 1),
    ]);

    renderAplicatia('/facilitati/7', RUTE);

    expect(await screen.findByText('Liber')).toBeInTheDocument();
    expect(screen.queryByText(/loc(uri)? liber/)).not.toBeInTheDocument();
  });

  it('spune cand ziua aleasa nu are sloturi', async () => {
    renderAplicatia('/facilitati/7', RUTE);

    expect(
      await screen.findByText('Nu există sloturi în această zi.'),
    ).toBeInTheDocument();
  });

  it('arata mesajul serverului cand facilitatea nu exista', async () => {
    vi.mocked(getFacilitate).mockRejectedValue({
      response: {
        status: 404,
        data: { cod: 'FACILITATE_NEGASITA', mesaj: 'Facilitatea nu exista.' },
      },
    });

    renderAplicatia('/facilitati/99', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Facilitatea nu exista.',
    );
    expect(
      screen.queryByRole('group', { name: 'Alege ziua' }),
    ).not.toBeInTheDocument();
  });

  it('arata eroarea cand sloturile nu se pot incarca', async () => {
    vi.mocked(getSloturi).mockRejectedValue({ request: {} });

    renderAplicatia('/facilitati/7', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serverul nu răspunde',
    );
  });
});

/**
 * Un slot de o ora, ca in raspunsul API.
 * @param {number} id
 * @param {string} inceput Momentul de inceput, ISO 8601.
 * @param {string} stare
 * @param {number} locuriLibere
 * @returns {object}
 */
function slot(id, inceput, stare, locuriLibere) {
  const sfarsit = new Date(Date.parse(inceput) + 60 * 60 * 1000);
  return {
    id_slot: id,
    id_facilitate: 7,
    ora_inceput: inceput,
    ora_sfarsit: sfarsit.toISOString(),
    stare,
    locuri_libere: locuriLibere,
  };
}
