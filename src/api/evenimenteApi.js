// Conexiunea la ruta /evenimente (Server-Sent Events) din documentul API.
import { API_BASE_URL } from './httpClient.js';

/**
 * GET /evenimente. Ruta e publica, deci conexiunea nu are nevoie de token.
 * Dupa o intrerupere, browserul reface singur conexiunea.
 * @param {object} ascultatori
 * @param {() => void} ascultatori.onConectare Apelata la fiecare stabilire a
 *   conexiunii: evenimentele de dinainte nu se mai primesc.
 * @param {(eveniment: object) => void} ascultatori.onSlotActualizat Primeste
 *   `id_slot`, `id_facilitate`, `stare` si `locuri_libere`.
 * @returns {() => void} Functia care inchide conexiunea.
 */
export function ascultaEvenimentele({ onConectare, onSlotActualizat }) {
  const conexiune = new EventSource(`${API_BASE_URL}/evenimente`);
  conexiune.addEventListener('open', onConectare);
  conexiune.addEventListener('slot-actualizat', (event) =>
    onSlotActualizat(JSON.parse(event.data)),
  );
  return () => conexiune.close();
}
