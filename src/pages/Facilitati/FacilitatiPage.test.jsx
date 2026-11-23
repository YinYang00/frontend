import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitati } from '../../api/facilitatiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import FacilitatiPage from './FacilitatiPage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({ getFacilitati: vi.fn() }));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

const RUTE = <Route path="/facilitati" element={<FacilitatiPage />} />;

describe('FacilitatiPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getFacilitati).mockReset();
  });

  it('arata facilitatile fara cont, doar pentru citire, cu link spre detalii', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([BAZIN]);

    renderAplicatia('/facilitati', RUTE);

    const card = (
      await screen.findByRole('link', { name: /Bazin olimpic/ })
    ).closest('li');
    expect(
      within(card).getByRole('link', { name: /Bazin olimpic/ }),
    ).toHaveAttribute('href', '/facilitati/7');
    expect(within(card).getByText('Înot')).toBeInTheDocument();
    expect(within(card).getByText('30 persoane')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Editează|Șterge|Adaugă/ }),
    ).not.toBeInTheDocument();
  });

  it('spune cand nu exista nicio facilitate', async () => {
    vi.mocked(getFacilitati).mockResolvedValue([]);

    renderAplicatia('/facilitati', RUTE);

    expect(
      await screen.findByText('Nu există încă nicio facilitate.'),
    ).toBeInTheDocument();
  });

  it('arata mesajul de eroare cand serverul nu raspunde', async () => {
    vi.mocked(getFacilitati).mockRejectedValue({ request: {} });

    renderAplicatia('/facilitati', RUTE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serverul nu răspunde',
    );
  });
});
