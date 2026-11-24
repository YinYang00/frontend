import { act, screen } from '@testing-library/react';
import { Link, Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate, getSloturi } from '../../api/facilitatiApi.js';
import {
  emiteSlotActualizat,
  getConexiuniDeschise,
  stabilesteConexiunea,
} from '../../test/eventSourceFals.js';
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

// Marti, 24 noiembrie 2026, 10:00 in Romania (+02:00).
const ACUM = new Date('2026-11-24T08:00:00Z');

const SLOT = {
  id_slot: 41,
  id_facilitate: 7,
  ora_inceput: '2026-11-24T16:00:00Z',
  ora_sfarsit: '2026-11-24T17:00:00Z',
  stare: 'Liber',
  locuri_libere: 2,
};

const EVENIMENT = {
  id_slot: 41,
  id_facilitate: 7,
  stare: 'Liber',
  locuri_libere: 1,
};

const RUTE = <Route path="/facilitati/:id" element={<FacilitatePage />} />;

describe('Actualizarea in timp real a calendarului', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ACUM);
    vi.mocked(getFacilitate).mockReset().mockResolvedValue(BAZIN);
    vi.mocked(getSloturi).mockReset().mockResolvedValue([SLOT]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schimba locurile libere si starea slotului, si pentru Guest', async () => {
    renderAplicatia('/facilitati/7', RUTE);
    expect(await screen.findByText('2 locuri libere')).toBeInTheDocument();

    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, locuri_libere: 1 }]);
    act(() => emiteSlotActualizat(EVENIMENT));
    expect(await screen.findByText('1 loc liber')).toBeInTheDocument();

    vi.mocked(getSloturi).mockResolvedValue([
      { ...SLOT, stare: 'Ocupat', locuri_libere: 0 },
    ]);
    act(() =>
      emiteSlotActualizat({ ...EVENIMENT, stare: 'Ocupat', locuri_libere: 0 }),
    );
    expect(await screen.findByText('Ocupat')).toBeInTheDocument();
    expect(screen.queryByText(/loc liber/)).not.toBeInTheDocument();
  });

  it('ignora evenimentele altei facilitati', async () => {
    renderAplicatia('/facilitati/7', RUTE);
    expect(await screen.findByText('2 locuri libere')).toBeInTheDocument();

    act(() => emiteSlotActualizat({ ...EVENIMENT, id_facilitate: 8 }));

    expect(getSloturi).toHaveBeenCalledTimes(1);
  });

  it('tine conexiunea deschisa doar pe pagina cu calendar', async () => {
    const user = renderAplicatia(
      '/facilitati',
      <>
        {RUTE}
        <Route
          path="/facilitati"
          element={<Link to="/facilitati/7">Deschide bazinul</Link>}
        />
      </>,
    );
    expect(getConexiuniDeschise()).toEqual([]);

    await user.click(screen.getByRole('link', { name: 'Deschide bazinul' }));
    expect(await screen.findByText('2 locuri libere')).toBeInTheDocument();
    expect(getConexiuniDeschise()).toEqual([
      expect.stringMatching(/\/evenimente$/),
    ]);

    // Schimbarea zilei nu reface conexiunea si nu deschide alta.
    await user.click(screen.getByRole('button', { name: /26 nov/ }));
    expect(await screen.findByText('2 locuri libere')).toBeInTheDocument();
    expect(getConexiuniDeschise()).toHaveLength(1);

    await user.click(screen.getByRole('link', { name: /Înapoi/ }));
    expect(getConexiuniDeschise()).toEqual([]);
  });

  it('reincarca sloturile la fiecare stabilire a conexiunii', async () => {
    renderAplicatia('/facilitati/7', RUTE);
    expect(await screen.findByText('2 locuri libere')).toBeInTheDocument();

    // Ce s-a schimbat intre prima cerere si conectare nu a venit ca eveniment.
    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, locuri_libere: 1 }]);
    act(() => stabilesteConexiunea());
    expect(await screen.findByText('1 loc liber')).toBeInTheDocument();

    // La fel dupa o intrerupere, cand browserul reface conexiunea.
    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, locuri_libere: 3 }]);
    act(() => stabilesteConexiunea());
    expect(await screen.findByText('3 locuri libere')).toBeInTheDocument();
  });

  it('nu pierde un eveniment venit in timpul primei incarcari', async () => {
    let raspundeCuSloturiVechi;
    vi.mocked(getSloturi).mockReturnValueOnce(
      new Promise((resolve) => {
        raspundeCuSloturiVechi = () => resolve([SLOT]);
      }),
    );
    renderAplicatia('/facilitati/7', RUTE);
    expect(await screen.findByText(/Se încarcă sloturile/)).toBeInTheDocument();

    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, locuri_libere: 1 }]);
    act(() => emiteSlotActualizat(EVENIMENT));
    await act(async () => raspundeCuSloturiVechi());

    expect(await screen.findByText('1 loc liber')).toBeInTheDocument();
  });
});
