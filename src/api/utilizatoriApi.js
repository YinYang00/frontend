// Functiile pentru rutele /utilizatori din documentul API.
import { httpClient } from './httpClient.js';

/**
 * GET /utilizatori/me
 * @returns {Promise<object>} Profilul utilizatorului autentificat.
 */
export async function getProfil() {
  const { data } = await httpClient.get('/utilizatori/me');
  return data;
}
