// Functiile pentru ruta /facilitati/:id_facilitate/reguli-acces din documentul
// API.
import { httpClient } from './httpClient.js';

/**
 * GET /facilitati/:id_facilitate/reguli-acces
 * @param {number | string} idFacilitate
 * @returns {Promise<object[]>} Cel mult o regula pe categorie.
 */
export async function getReguliAcces(idFacilitate) {
  const { data } = await httpClient.get(
    `/facilitati/${idFacilitate}/reguli-acces`,
  );
  return data;
}

/**
 * PUT /facilitati/:id_facilitate/reguli-acces
 * @param {number | string} idFacilitate
 * @param {object[]} reguli Lista completa; inlocuieste regulile vechi.
 * @returns {Promise<object[]>} Regulile salvate.
 */
export async function updateReguliAcces(idFacilitate, reguli) {
  const { data } = await httpClient.put(
    `/facilitati/${idFacilitate}/reguli-acces`,
    reguli,
  );
  return data;
}
