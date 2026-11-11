// Clientul HTTP comun. Toate cererile catre backend trec pe aici.
import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Transforma o eroare Axios in mesajul afisat utilizatorului: mesajul trimis
 * de backend ({ cod, mesaj }) sau un mesaj generic daca serverul nu raspunde.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  const mesaj = error?.response?.data?.mesaj;
  if (mesaj) {
    return mesaj;
  }
  if (error?.request && !error?.response) {
    return `Serverul nu răspunde (${API_BASE_URL}). Verifică dacă backend-ul este pornit.`;
  }
  return 'A apărut o eroare neașteptată. Încearcă din nou.';
}
