import { act, screen, within } from '@testing-library/react';
import { Link, Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFacilitate } from '../../api/facilitatiApi.js';
import { getReguliAcces, updateReguliAcces } from '../../api/reguliAccesApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import AdminFacilitatePage from './AdminFacilitatePage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  getSloturi: vi.fn(async () => []),
  createSloturi: vi.fn(),
}));
vi.mock('../../api/reguliAccesApi.js', () => ({
  getReguliAcces: vi.fn(),
  updateReguliAcces: vi.fn(),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

// Sectiunea se testeaza pe pagina de administrare, unde o vede utilizatorul.
const RUTE = (
  <>
    <Route path="/admin/facilitati/:id" element={<AdminFacilitatePage />} />
    <Route
      path="/admin/facilitati"
      element={<Link to="/admin/facilitati/7">Bazin olimpic</Link>}
    />
  </>
);

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

const REGULA_STUDENT = {
  categorie_utilizator: 'Student',
  ore_maxim_saptamana: 6,
  prioritate: 2,
  zile_avans_maxim: 7,
};

const ORE = 'Ore maxime pe săptămână';
const ZILE = 'Zile maxime în avans';
const PRIORITATE = 'Prioritate';
const MESAJ_ORE = 'Orele trebuie să fie un număr întreg între 1 și 168.';
const MESAJ_ZILE = 'Zilele trebuie să fie un număr întreg între 1 și 30.';
const MESAJ_PRIORITATE =
  'Prioritatea trebuie să fie un număr întreg între 1 și 5.';

const REGULA_PERSONAL = {
  categorie_utilizator: 'PersonalAdministrativ',
  ore_maxim_saptamana: 4,
  prioritate: 3,
  zile_avans_maxim: 14,
};

// Mesajele se cauta in sectiune: calendarul de mentenanta are mesajele lui.
const sectiune = () =>
  within(screen.getByRole('region', { name: 'Reguli de acces' }));

/**
 * Deschide pagina bazinului.
 * @returns {import('@testing-library/user-event').UserEvent}
 */
function deschidePagina() {
  return renderAplicatia('/admin/facilitati/7', RUTE);
}

/**
 * Valorile din randul unei categorii, in ordinea coloanelor: ore, zile,
 * prioritate.
 * @param {string} categorie
 * @returns {string[]}
 */
function valoriRand(categorie) {
  const rand = screen.getByRole('row', { name: new RegExp(`^${categorie}`) });
  return within(rand)
    .getAllByRole('textbox')
    .map((camp) => camp.value);
}

/**
 * Deschide pagina bazinului si asteapta tabelul cu regulile date.
 * @param {object[]} reguli Regulile salvate pe server.
 * @returns {Promise<import('@testing-library/user-event').UserEvent>}
 */
async function deschideRegulile(reguli) {
  vi.mocked(getReguliAcces).mockResolvedValue(reguli);
  const user = deschidePagina();
  await screen.findByRole('table', { name: 'Reguli de acces' });
  return user;
}

/**
 * Completeaza randul unei categorii; o valoare goala sterge campul.
 * @param {import('@testing-library/user-event').UserEvent} user
 * @param {string} categorie
 * @param {string[]} valori Orele, zilele si prioritatea.
 */
async function completeazaRand(user, categorie, valori) {
  for (const [index, eticheta] of [ORE, ZILE, PRIORITATE].entries()) {
    const camp = screen.getByLabelText(`${categorie}: ${eticheta}`);
    await user.clear(camp);
    if (valori[index]) {
      await user.type(camp, valori[index]);
    }
  }
}

/**
 * Apasa butonul de salvare.
 * @param {import('@testing-library/user-event').UserEvent} user
 */
async function salveaza(user) {
  await user.click(screen.getByRole('button', { name: 'Salvează regulile' }));
}

describe('ReguliAcces', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getFacilitate).mockResolvedValue(BAZIN);
    vi.mocked(getReguliAcces).mockReset();
    vi.mocked(updateReguliAcces).mockReset();
  });

  it('arata regulile existente, cu randul gol la categoria fara regula', async () => {
    vi.mocked(getReguliAcces).mockResolvedValue([
      REGULA_STUDENT,
      REGULA_PERSONAL,
    ]);

    deschidePagina();

    const tabel = await screen.findByRole('table', { name: 'Reguli de acces' });
    expect(
      within(tabel)
        .getAllByRole('columnheader')
        .map((antet) => antet.textContent),
    ).toEqual(['Categorie', ORE, ZILE, PRIORITATE]);
    expect(valoriRand('Student')).toEqual(['6', '7', '2']);
    expect(valoriRand('Cadru didactic')).toEqual(['', '', '']);
    expect(valoriRand('Personal administrativ')).toEqual(['4', '14', '3']);
    expect(getReguliAcces).toHaveBeenCalledWith('7');
  });

  it('trimite o singura cerere cu randurile completate si confirma salvarea', async () => {
    const regulaCadru = {
      categorie_utilizator: 'CadruDidactic',
      ore_maxim_saptamana: 8,
      zile_avans_maxim: 30,
      prioritate: 1,
    };
    vi.mocked(updateReguliAcces).mockResolvedValue([
      REGULA_STUDENT,
      regulaCadru,
    ]);
    const user = await deschideRegulile([REGULA_STUDENT, REGULA_PERSONAL]);

    await completeazaRand(user, 'Cadru didactic', ['8', '30', '1']);
    await completeazaRand(user, 'Personal administrativ', ['', '', '']);
    await salveaza(user);

    expect(await sectiune().findByRole('status')).toHaveTextContent(
      'Regulile au fost salvate.',
    );
    expect(updateReguliAcces).toHaveBeenCalledTimes(1);
    expect(updateReguliAcces).toHaveBeenCalledWith('7', [
      REGULA_STUDENT,
      regulaCadru,
    ]);
  });

  it('cu toate randurile goale trimite lista goala', async () => {
    vi.mocked(updateReguliAcces).mockResolvedValue([]);
    const user = await deschideRegulile([REGULA_STUDENT]);

    await completeazaRand(user, 'Student', ['', '', '']);
    await salveaza(user);

    await sectiune().findByRole('status');
    expect(updateReguliAcces).toHaveBeenCalledWith('7', []);
  });

  it.each([
    ['orele sunt zero', ['0', '7', '1'], ORE, MESAJ_ORE],
    ['orele depasesc saptamana', ['169', '7', '1'], ORE, MESAJ_ORE],
    ['orele nu sunt intregi', ['2.5', '7', '1'], ORE, MESAJ_ORE],
    ['orele sunt in alta scriere', ['1e1', '7', '1'], ORE, MESAJ_ORE],
    ['orele nu sunt numar', ['abc', '7', '1'], ORE, MESAJ_ORE],
    ['zilele sunt zero', ['6', '0', '1'], ZILE, MESAJ_ZILE],
    ['zilele depasesc 30', ['6', '31', '1'], ZILE, MESAJ_ZILE],
    ['prioritatea e zero', ['6', '7', '0'], PRIORITATE, MESAJ_PRIORITATE],
    ['prioritatea depaseste 5', ['6', '7', '6'], PRIORITATE, MESAJ_PRIORITATE],
    ['randul e partial', ['6', '7', ''], PRIORITATE, MESAJ_PRIORITATE],
  ])(
    'cand %s arata mesajul langa camp, fara cerere',
    async (_caz, valori, eticheta, mesaj) => {
      const user = await deschideRegulile([REGULA_PERSONAL]);

      await completeazaRand(user, 'Student', valori);
      await salveaza(user);

      expect(await screen.findByText(mesaj)).toBeInTheDocument();
      expect(
        screen.getByLabelText(`Student: ${eticheta}`),
      ).toHaveAccessibleDescription(mesaj);
      expect(updateReguliAcces).not.toHaveBeenCalled();
    },
  );

  it('la 400 arata mesajul serverului si pastreaza valorile completate', async () => {
    vi.mocked(updateReguliAcces).mockRejectedValue({
      response: {
        status: 400,
        data: {
          cod: 'DATE_INVALIDE',
          mesaj: 'Fiecare categorie poate avea o singura regula.',
        },
      },
    });
    const user = await deschideRegulile([REGULA_STUDENT]);

    await completeazaRand(user, 'Student', ['10', '14', '3']);
    await salveaza(user);

    expect(await sectiune().findByRole('alert')).toHaveTextContent(
      'Fiecare categorie poate avea o singura regula.',
    );
    expect(valoriRand('Student')).toEqual(['10', '14', '3']);
  });

  it('ascunde confirmarea veche cand formularul trimis nu e valid', async () => {
    vi.mocked(updateReguliAcces).mockResolvedValue([REGULA_STUDENT]);
    const user = await deschideRegulile([REGULA_STUDENT]);
    await salveaza(user);
    await sectiune().findByRole('status');

    await completeazaRand(user, 'Student', ['6', '7', '9']);
    await salveaza(user);

    await screen.findByText(MESAJ_PRIORITATE);
    expect(sectiune().queryByRole('status')).not.toBeInTheDocument();
  });

  it('dupa salvare tabelul arata regulile intoarse de server', async () => {
    vi.mocked(updateReguliAcces).mockResolvedValue([REGULA_STUDENT]);
    const user = await deschideRegulile([REGULA_STUDENT]);

    await completeazaRand(user, 'Student', ['006', '7', '2']);
    await completeazaRand(user, 'Cadru didactic', [' ', '', '']);
    await salveaza(user);

    await sectiune().findByRole('status');
    expect(valoriRand('Student')).toEqual(['6', '7', '2']);
    expect(valoriRand('Cadru didactic')).toEqual(['', '', '']);
  });

  it('blocheaza tabelul cat salvarea e in curs', async () => {
    vi.mocked(updateReguliAcces).mockReturnValue(new Promise(() => {}));
    const user = await deschideRegulile([REGULA_STUDENT]);

    await salveaza(user);

    expect(
      await screen.findByRole('button', { name: 'Se salvează…' }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Student: Prioritate')).toBeDisabled();
  });

  it('cand regulile nu se pot citi arata mesajul, fara tabel', async () => {
    vi.mocked(getReguliAcces).mockRejectedValueOnce({
      response: {
        status: 500,
        data: { cod: 'EROARE_INTERNA', mesaj: 'A aparut o eroare.' },
      },
    });
    const user = deschidePagina();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A aparut o eroare.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    vi.mocked(getReguliAcces).mockResolvedValue([REGULA_STUDENT]);
    await user.click(screen.getByRole('button', { name: 'Încearcă din nou' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('arata ca regulile se incarca', async () => {
    vi.mocked(getReguliAcces).mockReturnValue(new Promise(() => {}));

    deschidePagina();

    expect(await screen.findByText('Se încarcă regulile…')).toBeInTheDocument();
  });

  it('la redeschiderea paginii cere din nou regulile, si dupa o salvare intarziata', async () => {
    let raspunde;
    vi.mocked(updateReguliAcces).mockReturnValue(
      new Promise((resolve) => {
        raspunde = resolve;
      }),
    );
    const user = await deschideRegulile([REGULA_STUDENT]);
    await salveaza(user);

    await user.click(
      screen.getByRole('link', { name: /Înapoi la administrare/ }),
    );
    await act(async () => raspunde([REGULA_STUDENT]));
    vi.mocked(getReguliAcces).mockResolvedValue([REGULA_PERSONAL]);
    await user.click(screen.getByRole('link', { name: 'Bazin olimpic' }));
    await screen.findByRole('table', { name: 'Reguli de acces' });

    expect(valoriRand('Student')).toEqual(['', '', '']);
    expect(valoriRand('Personal administrativ')).toEqual(['4', '14', '3']);
  });
});
