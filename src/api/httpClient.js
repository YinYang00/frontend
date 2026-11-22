// Clientul HTTP comun. Toate cererile catre backend trec pe aici.
import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

// Tokenul JWT sta in localStorage, ca sesiunea sa ramana dupa redeschiderea
// aplicatiei pe telefon (ADR 0001).
const CHEIE_TOKEN = 'token';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Pastreaza tokenul primit la autentificare.
 * @param {string} token
 */
export function salveazaToken(token) {
  localStorage.setItem(CHEIE_TOKEN, token);
}

/**
 * Sterge tokenul: la deconectare sau cand serverul nu il mai accepta.
 */
export function stergeToken() {
  localStorage.removeItem(CHEIE_TOKEN);
}

/**
 * @returns {boolean} Daca exista un token salvat.
 */
export function areToken() {
  return localStorage.getItem(CHEIE_TOKEN) !== null;
}

const ascultatoriExpirare = new Set();

/**
 * Inregistreaza o functie apelata cand serverul respinge tokenul (401).
 * @param {() => void} ascultator
 * @returns {() => void} Functia care anuleaza inregistrarea.
 */
export function onSesiuneExpirata(ascultator) {
  ascultatoriExpirare.add(ascultator);
  return () => ascultatoriExpirare.delete(ascultator);
}

/**
 * @returns {string | undefined} Antetul Authorization pentru tokenul salvat.
 */
function antetAutorizare() {
  const token = localStorage.getItem(CHEIE_TOKEN);
  return token ? `Bearer ${token}` : undefined;
}

// Rutele /auth nu primesc tokenul: un login gresit facut cu o sesiune veche
// in localStorage nu trebuie sa inchida sesiunea.
httpClient.interceptors.request.use((config) => {
  const antet = antetAutorizare();
  if (antet && !config.url?.startsWith('/auth/')) {
    config.headers.Authorization = antet;
  }
  return config;
});

// Sesiunea se inchide doar daca serverul a respins chiar tokenul salvat acum:
// un 401 la o cerere fara token (login gresit) sau trimisa cu un token vechi,
// inlocuit intre timp de un login nou, o lasa neatinsa.
httpClient.interceptors.response.use(undefined, (error) => {
  const antetCerere = error.config?.headers?.Authorization;
  const tokenRespins = antetCerere && antetCerere === antetAutorizare();
  if (error.response?.status === 401 && tokenRespins) {
    stergeToken();
    ascultatoriExpirare.forEach((ascultator) => ascultator());
  }
  return Promise.reject(error);
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
