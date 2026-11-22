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

/**
 * POST /auth/login
 * @param {{email: string, parola: string}} date
 * @returns {Promise<{token: string, utilizator: object}>}
 */
export async function loginUtilizator(date) {
  const { data } = await httpClient.post('/auth/login', date);
  return data;
}
