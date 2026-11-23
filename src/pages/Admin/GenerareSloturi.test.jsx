import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSloturi, getFacilitate } from '../../api/facilitatiApi.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';

import AdminFacilitatePage from './AdminFacilitatePage.jsx';

vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  createSloturi: vi.fn(),
}));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

// Sectiunea se testeaza pe pagina de administrare, unde o vede utilizatorul.
const RUTE = (
  <Route path="/admin/facilitati/:id" element={<AdminFacilitatePage />} />
);

const BAZIN = {
  id_facilitate: 7,
  denumire: 'Bazin olimpic',
  tip: 'Înot',
  capacitate_maxima: 30,
  locatie: 'Complex sportiv',
};

/**
 * Un slot ca in raspunsul POST /facilitati/{id_facilitate}/sloturi.
 * @param {number} id
 * @returns {object}
 */
function slot(id) {
  return { id_slot: id, id_facilitate: 7, stare: 'Liber', locuri_libere: 30 };
}

/**
 * Deschide pagina bazinului si asteapta sectiunea de generare.
 * @returns {Promise<import('@testing-library/user-event').UserEvent>}
 */
async function deschideGenerarea() {
  const user = renderAplicatia('/admin/facilitati/7', RUTE);
  await screen.findByRole('heading', { name: 'Generare sloturi' });
  return user;
}

/**
 * Completeaza formularul de generare.
 * @param {import('@testing-library/user-event').UserEvent} user
 * @param {object} valori
 * @param {string} valori.data
 * @param {string} valori.inceput
 * @param {string} valori.sfarsit
 * @param {string} valori.durata
 */
async function completeaza(user, { data, inceput, sfarsit, durata }) {
  const campuri = [
    ['Data', data],
    ['Ora de început', inceput],
    ['Ora de sfârșit', sfarsit],
    ['Durata unui slot (minute)', durata],
  ];
  for (const [eticheta, valoare] of campuri) {
    const camp = screen.getByLabelText(eticheta);
    await user.clear(camp);
    await user.type(camp, valoare);
  }
}

const PROGRAM = {
  data: '2026-11-25',
  inceput: '08:00',
  sfarsit: '11:00',
  durata: '60',
};

describe('GenerareSloturi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-23T12:00:00+02:00'));
    vi.mocked(getFacilitate).mockResolvedValue(BAZIN);
    vi.mocked(createSloturi).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('genereaza sloturile zilei si spune cate s-au creat', async () => {
    vi.mocked(createSloturi).mockResolvedValue([slot(1), slot(2), slot(3)]);
    const user = await deschideGenerarea();

    await completeaza(user, PROGRAM);
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '3 sloturi create',
    );
    expect(createSloturi).toHaveBeenCalledWith('7', {
      data: '2026-11-25',
      ora_inceput: '08:00',
      ora_sfarsit: '11:00',
      durata_minute: 60,
    });
  });

  it.each([
    [
      'sfarsitul e inaintea inceputului',
      { ...PROGRAM, inceput: '12:00', sfarsit: '10:00' },
      'Ora de sfârșit',
      'Ora de sfârșit trebuie să fie după ora de început.',
    ],
    [
      'sfarsitul e egal cu inceputul',
      { ...PROGRAM, inceput: '10:00', sfarsit: '10:00' },
      'Ora de sfârșit',
      'Ora de sfârșit trebuie să fie după ora de început.',
    ],
    [
      'durata e zero',
      { ...PROGRAM, durata: '0' },
      'Durata unui slot (minute)',
      'Durata trebuie să fie un număr întreg pozitiv de minute.',
    ],
  ])(
    'cand %s arata mesajul langa camp, fara cerere',
    async (_caz, program, eticheta, mesaj) => {
      const user = await deschideGenerarea();

      await completeaza(user, program);
      await user.click(
        screen.getByRole('button', { name: 'Generează sloturi' }),
      );

      expect(await screen.findByText(mesaj)).toBeInTheDocument();
      expect(screen.getByLabelText(eticheta)).toHaveAccessibleDescription(
        mesaj,
      );
      expect(createSloturi).not.toHaveBeenCalled();
    },
  );

  it('la 400 arata mesajul serverului', async () => {
    vi.mocked(createSloturi).mockRejectedValue({
      response: {
        status: 400,
        data: {
          cod: 'VALIDARE',
          mesaj: 'Nu se pot genera sloturi pentru o zi din trecut.',
        },
      },
    });
    const user = await deschideGenerarea();

    await completeaza(user, PROGRAM);
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nu se pot genera sloturi pentru o zi din trecut.',
    );
  });

  it('spune 0 sloturi create cand toate existau deja', async () => {
    vi.mocked(createSloturi).mockResolvedValue([]);
    const user = await deschideGenerarea();

    await completeaza(user, PROGRAM);
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '0 sloturi create',
    );
  });

  it('dezactiveaza butonul cat cererea e in curs', async () => {
    vi.mocked(createSloturi).mockReturnValue(new Promise(() => {}));
    const user = await deschideGenerarea();

    await completeaza(user, PROGRAM);
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));

    expect(
      await screen.findByRole('button', { name: 'Se generează…' }),
    ).toBeDisabled();
  });

  it('ascunde rezultatul vechi cand formularul trimis nu e valid', async () => {
    vi.mocked(createSloturi).mockResolvedValue([slot(1)]);
    const user = await deschideGenerarea();
    await completeaza(user, PROGRAM);
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));
    await screen.findByRole('status');

    await completeaza(user, { ...PROGRAM, durata: '0' });
    await user.click(screen.getByRole('button', { name: 'Generează sloturi' }));

    await screen.findByText(
      'Durata trebuie să fie un număr întreg pozitiv de minute.',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
