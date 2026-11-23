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
