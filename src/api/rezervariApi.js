// Functiile pentru rutele /rezervari din documentul API.
import { httpClient } from './httpClient.js';

/**
 * POST /rezervari
 * @param {number} idSlot
 * @returns {Promise<object>} Rezervarea creata, cu `id_rezervare`.
 */
export async function createRezervare(idSlot) {
  const { data } = await httpClient.post('/rezervari', { id_slot: idSlot });
  return data;
}
