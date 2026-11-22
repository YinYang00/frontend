import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { salveazaToken } from '../api/httpClient.js';
import { getProfil } from '../api/utilizatoriApi.js';
import { renderAplicatia } from '../test/renderAplicatia.jsx';

vi.mock('../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

/**
 * Numele legaturilor din meniul principal, in ordine.
 * @returns {string[]}
 */
function elementeMeniu() {
  const meniu = screen.getByRole('navigation', { name: 'Meniu principal' });
  return within(meniu)
    .getAllByRole('link')
    .map((link) => link.textContent);
}

/**
 * Randeaza aplicatia pe pagina principala cu utilizatorul dat autentificat.
 * @param {object} utilizator Profilul intors de server.
 */
async function renderAutentificat(utilizator) {
  salveazaToken('abc.def.ghi');
  vi.mocked(getProfil).mockResolvedValue(utilizator);
  const user = renderAplicatia('/', <Route path="/" element={<p>Acasă</p>} />);
  await within(screen.getByRole('banner')).findByText(utilizator.nume);
  return user;
}

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getProfil).mockReset();
  });

  it('Guest vede doar Facilitati si Autentificare', () => {
    renderAplicatia('/', <Route path="/" element={<p>Acasă</p>} />);

    expect(elementeMeniu()).toEqual(['Facilități', 'Autentificare']);
  });

  it('Utilizatorul vede Facilitati si Rezervarile mele', async () => {
    await renderAutentificat(ANA);

    expect(elementeMeniu()).toEqual(['Facilități', 'Rezervările mele']);
  });

  it('Administratorul vede si Administrare', async () => {
    await renderAutentificat({
      ...ANA,
      nume: 'Ion Admin',
      rol: 'Administrator',
    });

    expect(elementeMeniu()).toEqual([
      'Facilități',
      'Rezervările mele',
      'Administrare',
    ]);
  });

  it('pe telefon meniul se deschide si se inchide de la tastatura', async () => {
    const user = renderAplicatia(
      '/',
      <Route path="/" element={<p>Acasă</p>} />,
    );
    const buton = screen.getByRole('button', { name: 'Meniu' });
    const meniu = screen.getByRole('navigation', { name: 'Meniu principal' });
    expect(buton).toHaveAttribute('aria-controls', meniu.id);
    expect(buton).toHaveAttribute('aria-expanded', 'false');

    await user.tab();
    await user.tab();
    expect(buton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(buton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(buton).toHaveAttribute('aria-expanded', 'false');
    expect(buton).toHaveFocus();
  });

  it('meniul deschis se inchide dupa alegerea unei pagini', async () => {
    const user = renderAplicatia(
      '/',
      <>
        <Route path="/" element={<p>Acasă</p>} />
        <Route path="/facilitati" element={<p>Lista facilităților</p>} />
      </>,
    );
    const buton = screen.getByRole('button', { name: 'Meniu' });

    await user.click(buton);
    await user.click(screen.getByRole('link', { name: 'Facilități' }));

    expect(screen.getByText('Lista facilităților')).toBeInTheDocument();
    expect(buton).toHaveAttribute('aria-expanded', 'false');
  });
});
