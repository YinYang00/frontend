// Functiile pentru rutele /auth din documentul API.
import { httpClient } from './httpClient.js';

/**
 * POST /auth/inregistrare
 * @param {{nume: string, email: string, parola: string}} date
 * @returns {Promise<object>} Utilizatorul creat.
 */
export async function registerUtilizator(date) {
  const { data } = await httpClient.post('/auth/inregistrare', date);
  return data;
}
