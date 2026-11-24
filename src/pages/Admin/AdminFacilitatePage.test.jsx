import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate } from '../../api/facilitatiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import AdminFacilitatePage from './AdminFacilitatePage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  createSloturi: vi.fn(),
}));
vi.mock('../../api/reguliAccesApi.js', () => ({
  getReguliAcces: vi.fn(async () => []),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const RUTE = (
  <Route path="/admin/facilitati/:id" element={<AdminFacilitatePage />} />
);

describe('AdminFacilitatePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getFacilitate).mockReset();
  });

  it('arata numele facilitatii din adresa', async () => {
    vi.mocked(getFacilitate).mockResolvedValue({
      id_facilitate: 7,
      denumire: 'Bazin olimpic',
      tip: 'Înot',
      capacitate_maxima: 30,
      locatie: 'Complex sportiv',
    });

    renderAplicatia('/admin/facilitati/7', RUTE);

    expect(
      await screen.findByRole('heading', { name: 'Bazin olimpic' }),
    ).toBeInTheDocument();
    expect(getFacilitate).toHaveBeenCalledWith('7');
    expect(
      screen.getByRole('link', { name: /Înapoi la administrare/ }),
    ).toHaveAttribute('href', '/admin/facilitati');
  });

  it('arata mesajul serverului pentru o facilitate inexistenta', async () => {
    vi.mocked(getFacilitate).mockRejectedValue({
      response: {
        status: 404,
        data: { cod: 'NU_EXISTA', mesaj: 'Facilitatea nu există.' },
      },
    });

    renderAplicatia('/admin/facilitati/999', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Facilitatea nu există.',
    );
  });
});
