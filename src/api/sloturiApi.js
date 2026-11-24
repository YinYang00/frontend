// Functiile pentru rutele /sloturi din documentul API.
import { httpClient } from './httpClient.js';

/**
 * PATCH /sloturi/:id_slot
 * @param {number} idSlot
 * @param {'Mentenanta' | 'Liber'} stare `Mentenanta` anuleaza si rezervarile
 *   active ale slotului.
 * @returns {Promise<object>} Slotul cu starea noua.
 */
export async function updateStareSlot(idSlot, stare) {
  const { data } = await httpClient.patch(`/sloturi/${idSlot}`, { stare });
  return data;
}
