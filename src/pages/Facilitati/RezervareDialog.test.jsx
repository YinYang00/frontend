import { act, screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loginUtilizator } from '../../api/authApi.js';
import { getFacilitate, getSloturi } from '../../api/facilitatiApi.js';
import { salveazaToken } from '../../api/httpClient.js';
import { createRezervare } from '../../api/rezervariApi.js';
import { getProfil } from '../../api/utilizatoriApi.js';
import { emiteSlotActualizat } from '../../test/eventSourceFals.js';
import { renderAplicatia } from '../../test/renderAplicatia.jsx';
import AutentificarePage from '../Autentificare/AutentificarePage.jsx';

import FacilitatePage from './FacilitatePage.jsx';

vi.mock('../../api/authApi.js', () => ({
  loginUtilizator: vi.fn(),
  registerUtilizator: vi.fn(),
}));
vi.mock('../../api/facilitatiApi.js', () => ({
  getFacilitate: vi.fn(),
  getSloturi: vi.fn(),
}));
vi.mock('../../api/rezervariApi.js', () => ({ createRezervare: vi.fn() }));
vi.mock('../../api/utilizatoriApi.js', () => ({ getProfil: vi.fn() }));

const TENIS = {
  id_facilitate: 7,
  denumire: 'Teren tenis',
  tip: 'Tenis',
  capacitate_maxima: 1,
  locatie: 'Complex sportiv',
};

const ANA = {
  id_utilizator: 1,
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  categorie: 'Student',
  rol: 'Utilizator',
};

// Marti, 24 noiembrie 2026, 10:00 in Romania (+02:00).
const ACUM = new Date('2026-11-24T08:00:00Z');

const SLOT_LIBER = {
  id_slot: 41,
  id_facilitate: 7,
  ora_inceput: '2026-11-24T16:00:00Z',
  ora_sfarsit: '2026-11-24T17:00:00Z',
  stare: 'Liber',
  locuri_libere: 1,
};

const RUTE = (
  <>
    <Route path="/facilitati/:id" element={<FacilitatePage />} />
    <Route path="/rezervari/:id" element={<p>Detaliile rezervării</p>} />
    <Route path="/autentificare" element={<AutentificarePage />} />
  </>
);

/**
 * Deschide pagina facilitatii ca Ana si dialogul slotului liber.
 * @returns {Promise<import('@testing-library/user-event').UserEvent>}
 */
async function deschideDialogul() {
  salveazaToken('abc.def.ghi');
  const user = renderAplicatia('/facilitati/7', RUTE);
  await user.click(await screen.findByRole('button', { name: /Rezervă/ }));
  return user;
}

/**
 * Altcineva schimba slotul: serverul il intoarce altfel si anunta calendarul.
 * @param {object} schimbari `stare` si `locuri_libere`.
 */
function schimbaSlotul(schimbari) {
  vi.mocked(getSloturi).mockResolvedValue([{ ...SLOT_LIBER, ...schimbari }]);
  act(() =>
    emiteSlotActualizat({ id_slot: 41, id_facilitate: 7, ...schimbari }),
  );
}

describe('Rezervarea unui slot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ACUM);
    vi.mocked(getFacilitate).mockReset().mockResolvedValue(TENIS);
    vi.mocked(getSloturi).mockReset().mockResolvedValue([SLOT_LIBER]);
    vi.mocked(getProfil).mockReset().mockResolvedValue(ANA);
    vi.mocked(createRezervare).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rezerva slotul liber si arata confirmarea cu link spre detalii', async () => {
    vi.mocked(createRezervare).mockResolvedValue({ id_rezervare: 55 });
    const user = await deschideDialogul();

    const dialog = screen.getByRole('dialog', { name: 'Rezervă slotul' });
    expect(dialog).toHaveTextContent('Teren tenis');
    expect(dialog).toHaveTextContent(/24 noiembrie/);
    expect(dialog).toHaveTextContent('18:00 – 19:00');
    expect(getSloturi).toHaveBeenCalledTimes(1);

    await user.click(
      within(dialog).getByRole('button', { name: 'Rezervă locul' }),
    );

    expect(
      await within(dialog).findByText('Rezervare confirmată'),
    ).toBeVisible();
    expect(vi.mocked(createRezervare).mock.calls[0][0]).toBe(41);
    expect(getSloturi).toHaveBeenCalledTimes(2);

    await user.click(within(dialog).getByRole('link', { name: /detalii/i }));
    expect(screen.getByText('Detaliile rezervării')).toBeInTheDocument();
  });

  it.each([
    [409, 'SLOT_OCUPAT', 'Alt mesaj', 'Slotul tocmai a fost ocupat'],
    [404, 'SLOT_NEGASIT', 'Alt mesaj', 'Slotul nu mai există'],
    [
      409,
      'REZERVARE_SUPRAPUSA',
      'Ai deja o rezervare.',
      'Ai deja o rezervare.',
    ],
    [422, 'LIMITA_SAPTAMANALA', 'Limita atinsă.', 'Limita atinsă.'],
    [422, 'PREA_DEVREME', 'Prea devreme.', 'Prea devreme.'],
  ])(
    'la %i %s arata „%s” in dialog si reincarca sloturile',
    async (status, cod, mesaj, asteptat) => {
      vi.mocked(createRezervare).mockRejectedValue({
        response: { status, data: { cod, mesaj } },
      });
      const user = await deschideDialogul();
      const dialog = screen.getByRole('dialog', { name: 'Rezervă slotul' });

      await user.click(
        within(dialog).getByRole('button', { name: 'Rezervă locul' }),
      );

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        asteptat,
      );
      expect(getSloturi).toHaveBeenCalledTimes(2);
    },
  );

  it('dezactiveaza butonul cat cererea e in curs', async () => {
    vi.mocked(createRezervare).mockReturnValue(new Promise(() => {}));
    const user = await deschideDialogul();

    await user.click(screen.getByRole('button', { name: 'Rezervă locul' }));

    expect(screen.getByRole('button', { name: 'Se rezervă…' })).toBeDisabled();

    // Inchis acum, utilizatorul n-ar mai afla daca rezervarea s-a facut.
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Închide' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('nu ofera rezervarea pe sloturile Ocupat si Mentenanta', async () => {
    vi.mocked(getSloturi).mockResolvedValue([
      { ...SLOT_LIBER, id_slot: 42, stare: 'Ocupat', locuri_libere: 0 },
      { ...SLOT_LIBER, id_slot: 43, stare: 'Mentenanta', locuri_libere: 0 },
    ]);
    salveazaToken('abc.def.ghi');
    renderAplicatia('/facilitati/7', RUTE);

    expect(await screen.findByText('Ocupat')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Rezervă/ }),
    ).not.toBeInTheDocument();
  });

  it('se inchide cu Escape si focusul revine pe slot', async () => {
    const user = await deschideDialogul();
    expect(screen.getByRole('button', { name: 'Închide' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rezervă/ })).toHaveFocus();
  });

  it('trimite Guest la autentificare si inapoi in aceeasi zi', async () => {
    vi.mocked(loginUtilizator).mockResolvedValue({
      token: 'abc.def.ghi',
      utilizator: ANA,
    });
    const user = renderAplicatia('/facilitati/7', RUTE);
    await user.click(await screen.findByRole('button', { name: /26 nov/ }));
    await user.click(await screen.findByRole('button', { name: /Rezervă/ }));

    expect(
      await screen.findByRole('heading', { name: 'Autentificare' }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), ANA.email);
    await user.type(screen.getByLabelText('Parolă'), 'parola123');
    await user.click(screen.getByRole('button', { name: 'Autentifică-te' }));

    expect(
      await screen.findByRole('button', { name: /26 nov/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(getSloturi).toHaveBeenLastCalledWith(7, '2026-11-26');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se inchide la atingerea in afara lui', async () => {
    const user = await deschideDialogul();

    await user.click(
      screen.getByRole('dialog').parentElement.querySelector('[aria-hidden]'),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['Ocupat', 0],
    // Serverul refuza si un slot in mentenanta tot cu SLOT_OCUPAT.
    ['Mentenanta', 1],
  ])(
    'opreste rezervarea cand slotul deschis devine %s',
    async (stare, locuri) => {
      await deschideDialogul();
      const dialog = screen.getByRole('dialog', { name: 'Rezervă slotul' });

      schimbaSlotul({ stare, locuri_libere: locuri });

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'Slotul tocmai a fost ocupat',
      );
      expect(
        within(dialog).getByRole('button', { name: 'Rezervă locul' }),
      ).toBeDisabled();
    },
  );

  it('nu anunta slotul ocupat cand ultimul loc l-a luat chiar utilizatorul', async () => {
    let confirmaRezervarea;
    vi.mocked(createRezervare).mockReturnValue(
      new Promise((resolve) => {
        confirmaRezervarea = () => resolve({ id_rezervare: 55 });
      }),
    );
    const user = await deschideDialogul();
    const dialog = screen.getByRole('dialog', { name: 'Rezervă slotul' });
    await user.click(
      within(dialog).getByRole('button', { name: 'Rezervă locul' }),
    );

    // Evenimentul poate ajunge inaintea raspunsului la rezervare.
    schimbaSlotul({ stare: 'Ocupat', locuri_libere: 0 });
    expect(await screen.findByText('Ocupat')).toBeInTheDocument();
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => confirmaRezervarea());
    expect(
      await within(dialog).findByText('Rezervare confirmată'),
    ).toBeVisible();
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('spune o singura data ca slotul e ocupat dupa un refuz SLOT_OCUPAT', async () => {
    vi.mocked(createRezervare).mockRejectedValue({
      response: { status: 409, data: { cod: 'SLOT_OCUPAT', mesaj: 'Alt' } },
    });
    const user = await deschideDialogul();
    vi.mocked(getSloturi).mockResolvedValue([
      { ...SLOT_LIBER, stare: 'Ocupat', locuri_libere: 0 },
    ]);

    await user.click(screen.getByRole('button', { name: 'Rezervă locul' }));

    expect(await screen.findByText('Ocupat')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Rezervă locul' }),
    ).toBeDisabled();
  });
});
