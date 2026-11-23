import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFacilitate,
  deleteFacilitate,
  getFacilitati,
  updateFacilitate,
} from '../../api/facilitatiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import AdminFacilitatiPage from './AdminFacilitatiPage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitati: vi.fn(),
  createFacilitate: vi.fn(),
  updateFacilitate: vi.fn(),
  deleteFacilitate: vi.fn(),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

const RUTE = (
  <Route path="/admin/facilitati" element={<AdminFacilitatiPage />} />
);

describe('AdminFacilitatiPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getFacilitati).mockReset();
    vi.mocked(createFacilitate).mockReset();
    vi.mocked(deleteFacilitate).mockReset();
    vi.mocked(updateFacilitate).mockReset();
  });

  it('duce de la fiecare facilitate la pagina ei de administrare', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([BAZIN]);

    renderAplicatia('/admin/facilitati', RUTE);

    expect(
      await screen.findByRole('link', { name: 'Bazin olimpic' }),
    ).toHaveAttribute('href', '/admin/facilitati/7');
  });

  it('adauga o facilitate si reincarca lista', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([]);
    vi.mocked(createFacilitate).mockResolvedValue(BAZIN);
    const user = renderAplicatia('/admin/facilitati', RUTE);

    await user.click(
      await screen.findByRole('button', { name: 'Adaugă facilitate' }),
    );
    await user.type(screen.getByLabelText('Denumire'), BAZIN.denumire);
    await user.type(screen.getByLabelText('Tip'), BAZIN.tip);
    await user.type(screen.getByLabelText('Capacitate maximă'), '30');
    await user.type(screen.getByLabelText('Locație'), BAZIN.locatie);
    vi.mocked(getFacilitati).mockResolvedValue([BAZIN]);
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(vi.mocked(createFacilitate).mock.calls[0][0]).toEqual({
      denumire: BAZIN.denumire,
      tip: BAZIN.tip,
      capacitate_maxima: 30,
      locatie: BAZIN.locatie,
    });
    expect(
      await screen.findByText('Facilitatea „Bazin olimpic" a fost salvată.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Bazin olimpic' }),
    ).toBeInTheDocument();
  });

  it('modifica o facilitate existenta', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([BAZIN]);
    vi.mocked(updateFacilitate).mockResolvedValue({
      ...BAZIN,
      capacitate_maxima: 25,
    });
    const user = renderAplicatia('/admin/facilitati', RUTE);

    await user.click(
      await screen.findByRole('button', { name: 'Editează Bazin olimpic' }),
    );
    const capacitate = screen.getByLabelText('Capacitate maximă');
    await user.clear(capacitate);
    await user.type(capacitate, '25');
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(vi.mocked(updateFacilitate).mock.calls[0][0]).toBe(7);
    expect(vi.mocked(updateFacilitate).mock.calls[0][1]).toMatchObject({
      capacitate_maxima: 25,
    });
    expect(
      await screen.findByText('Facilitatea „Bazin olimpic" a fost salvată.'),
    ).toBeInTheDocument();
  });

  it('sterge o facilitate dupa confirmare', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([BAZIN]);
    vi.mocked(deleteFacilitate).mockResolvedValue();
    const user = renderAplicatia('/admin/facilitati', RUTE);

    await user.click(
      await screen.findByRole('button', { name: 'Șterge Bazin olimpic' }),
    );
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Șterge' }));

    expect(vi.mocked(deleteFacilitate).mock.calls[0][0]).toBe(7);
    expect(
      await screen.findByText('Facilitatea „Bazin olimpic" a fost ștearsă.'),
    ).toBeInTheDocument();
  });
});
