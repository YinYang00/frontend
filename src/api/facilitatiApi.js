// Functiile pentru rutele /facilitati din documentul API.
import { httpClient } from './httpClient.js';

const RESOURCE = '/facilitati';

/**
 * GET /facilitati
 * @returns {Promise<object[]>}
 */
export async function getFacilitati() {
  const { data } = await httpClient.get(RESOURCE);
  return data;
}

/**
 * POST /facilitati
 * @param {object} facilitate
 * @returns {Promise<object>}
 */
export async function createFacilitate(facilitate) {
  const { data } = await httpClient.post(RESOURCE, facilitate);
  return data;
}

/**
 * PUT /facilitati/:id_facilitate
 * @param {number} id
 * @param {object} facilitate
 * @returns {Promise<object>}
 */
export async function updateFacilitate(id, facilitate) {
  const { data } = await httpClient.put(`${RESOURCE}/${id}`, facilitate);
  return data;
}

/**
 * DELETE /facilitati/:id_facilitate
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteFacilitate(id) {
  await httpClient.delete(`${RESOURCE}/${id}`);
}
