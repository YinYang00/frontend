import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate, getSloturi } from '../../api/facilitatiApi.js';
import { updateStareSlot } from '../../api/sloturiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import AdminFacilitatePage from './AdminFacilitatePage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  getSloturi: vi.fn(),
  createSloturi: vi.fn(),
}));
vi.mock('../../api/sloturiApi.js', () => ({ updateStareSlot: vi.fn() }));
vi.mock('../../api/reguliAccesApi.js', () => ({
  getReguliAcces: vi.fn(async () => []),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const RUTE = (
  <Route path="/admin/facilitati/:id" element={<AdminFacilitatePage />} />
);

describe('MentenantaSloturi', () => {
  const SLOT = {
    id_slot: 41,
    id_facilitate: 7,
    ora_inceput: '2026-11-24T16:00:00Z',
    ora_sfarsit: '2026-11-24T17:00:00Z',
    stare: 'Liber',
    locuri_libere: 30,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getFacilitate).mockResolvedValue({
      id_facilitate: 7,
      denumire: 'Bazin olimpic',
      tip: 'Înot',
      capacitate_maxima: 30,
      locatie: 'Complex sportiv',
    });
    vi.mocked(getSloturi).mockReset().mockResolvedValue([SLOT]);
    vi.mocked(updateStareSlot).mockReset();
  });

  it('blocheaza slotul dupa confirmarea avertismentului', async () => {
    const user = renderAplicatia('/admin/facilitati/7', RUTE);

    await user.click(
      await screen.findByRole('button', { name: 'Blochează 18:00 – 19:00' }),
    );
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Rezervările active ale slotului vor fi anulate',
    );
    expect(updateStareSlot).not.toHaveBeenCalled();

    vi.mocked(updateStareSlot).mockResolvedValue({
      ...SLOT,
      stare: 'Mentenanta',
    });
    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, stare: 'Mentenanta' }]);
    await user.click(within(dialog).getByRole('button', { name: 'Blochează' }));

    expect(updateStareSlot).toHaveBeenCalledWith(41, 'Mentenanta');
    expect(
      await screen.findByRole('button', {
        name: 'Deblochează 18:00 – 19:00',
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Sloturile zilei' })).getByText(
        'Mentenanță',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('deblocheaza slotul fara confirmare si il face rezervabil', async () => {
    vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT, stare: 'Mentenanta' }]);
    const user = renderAplicatia('/admin/facilitati/7', RUTE);

    const deblocheaza = await screen.findByRole('button', {
      name: 'Deblochează 18:00 – 19:00',
    });
    vi.mocked(updateStareSlot).mockResolvedValue(SLOT);
    vi.mocked(getSloturi).mockResolvedValue([SLOT]);
    await user.click(deblocheaza);

    expect(updateStareSlot).toHaveBeenCalledWith(41, 'Liber');
    expect(
      await screen.findByRole('button', { name: 'Blochează 18:00 – 19:00' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Liber')).toBeInTheDocument();
  });

  it('arata mesajul serverului cand blocarea esueaza', async () => {
    vi.mocked(updateStareSlot).mockRejectedValue({
      response: {
        status: 404,
        data: { cod: 'NU_EXISTA', mesaj: 'Slotul nu există.' },
      },
    });
    const user = renderAplicatia('/admin/facilitati/7', RUTE);

    await user.click(
      await screen.findByRole('button', { name: 'Blochează 18:00 – 19:00' }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Blochează',
      }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Slotul nu există.',
    );
  });
});
