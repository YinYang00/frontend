import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  areToken,
  httpClient,
  onSesiuneExpirata,
  salveazaToken,
} from './httpClient.js';

/**
 * Inlocuieste reteaua: fiecare cerere ajunge la `raspunde`, care intoarce
 * { status, data }. Statusurile >= 400 devin erori, ca la Axios.
 * @param {(config: object) => {status: number, data?: unknown}} raspunde
 */
function inlocuiesteReteaua(raspunde) {
  httpClient.defaults.adapter = async (config) => {
    const { status, data = {} } = raspunde(config);
    const response = { status, data, headers: {}, config, statusText: '' };
    if (status >= 400) {
      throw new AxiosError('Eroare', 'ERR_BAD_REQUEST', config, {}, response);
    }
    return response;
  };
}

// Anularile ascultatorilor inregistrati in testul curent; afterEach le
// apeleaza chiar daca o asertiune a picat, ca testele sa nu se influenteze.
let renuntari = [];

/**
 * Inregistreaza un ascultator de expirare, sters automat dupa test.
 * @returns {import('vitest').Mock} Ascultatorul.
 */
function ascultaExpirarea() {
  const laExpirare = vi.fn();
  renuntari.push(onSesiuneExpirata(laExpirare));
  return laExpirare;
}

describe('httpClient', () => {
  const adaptorOriginal = httpClient.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpClient.defaults.adapter = adaptorOriginal;
    renuntari.forEach((renunta) => renunta());
    renuntari = [];
  });

  it('pune tokenul salvat in antetul Authorization', async () => {
    const antete = vi.fn();
    inlocuiesteReteaua((config) => {
      antete(config.headers.Authorization);
      return { status: 200 };
    });
    salveazaToken('abc.def.ghi');

    await httpClient.get('/rezervari');

    expect(antete).toHaveBeenCalledWith('Bearer abc.def.ghi');
  });

  it('la 401 pe o cerere autentificata sterge tokenul si anunta sesiunea', async () => {
    const antete = vi.fn();
    inlocuiesteReteaua((config) => {
      antete(config.headers.Authorization);
      return { status: 401 };
    });
    const laExpirare = ascultaExpirarea();
    salveazaToken('expirat');

    await expect(httpClient.get('/rezervari')).rejects.toThrow();
    await expect(httpClient.get('/rezervari')).rejects.toThrow();

    expect(laExpirare).toHaveBeenCalledTimes(1);
    expect(antete).toHaveBeenLastCalledWith(undefined);
  });

  it('nu anunta sesiunea la 401 pe o cerere fara token (login gresit)', async () => {
    inlocuiesteReteaua(() => ({ status: 401 }));
    const laExpirare = ascultaExpirarea();

    await expect(httpClient.post('/auth/login', {})).rejects.toThrow();

    expect(laExpirare).not.toHaveBeenCalled();
  });

  it('nu trimite tokenul la login, deci un login gresit nu inchide sesiunea', async () => {
    const antete = vi.fn();
    inlocuiesteReteaua((config) => {
      antete(config.headers.Authorization);
      return { status: 401 };
    });
    const laExpirare = ascultaExpirarea();
    salveazaToken('valid');

    await expect(httpClient.post('/auth/login', {})).rejects.toThrow();

    expect(antete).toHaveBeenCalledWith(undefined);
    expect(laExpirare).not.toHaveBeenCalled();
    expect(areToken()).toBe(true);
  });

  it('un 401 primit pentru un token vechi nu sterge tokenul nou', async () => {
    let raspundeServerul;
    httpClient.defaults.adapter = (config) =>
      new Promise((_resolve, reject) => {
        raspundeServerul = () =>
          reject(
            new AxiosError(
              '401',
              'ERR_BAD_REQUEST',
              config,
              {},
              {
                status: 401,
                data: {},
                headers: {},
                config,
              },
            ),
          );
      });
    const laExpirare = ascultaExpirarea();
    salveazaToken('vechi');
    const cerereVeche = httpClient.get('/rezervari');
    await vi.waitFor(() => expect(raspundeServerul).toBeDefined());

    salveazaToken('nou');
    raspundeServerul();
    await expect(cerereVeche).rejects.toThrow();

    expect(laExpirare).not.toHaveBeenCalled();
    expect(areToken()).toBe(true);
  });
});
