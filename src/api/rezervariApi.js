// Functiile pentru rutele /rezervari din documentul API.
import { httpClient } from './httpClient.js';

/**
 * GET /rezervari
 * @returns {Promise<object[]>} Rezervarile utilizatorului autentificat, cu
 *   `slot` si `facilitate`.
 */
export async function getRezervari() {
  const { data } = await httpClient.get('/rezervari');
  return data;
}

/**
 * POST /rezervari
 * @param {number} idSlot
 * @returns {Promise<object>} Rezervarea creata, cu `id_rezervare`.
 */
export async function createRezervare(idSlot) {
  const { data } = await httpClient.post('/rezervari', { id_slot: idSlot });
  return data;
}

/**
 * GET /rezervari/{id_rezervare}
 * @param {number | string} idRezervare
 * @returns {Promise<object>} Rezervarea, cu `slot`, `facilitate` si `cod_qr`.
 */
export async function getRezervare(idRezervare) {
  const { data } = await httpClient.get(`/rezervari/${idRezervare}`);
  return data;
}

/**
 * POST /rezervari/{id_rezervare}/anulare
 * @param {number} idRezervare
 * @returns {Promise<object>} Rezervarea, in starea `Anulata`.
 */
export async function anuleazaRezervare(idRezervare) {
  const { data } = await httpClient.post(`/rezervari/${idRezervare}/anulare`);
  return data;
}
