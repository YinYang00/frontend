// Clientul TanStack Query al aplicatiei, cu politica de reincercare a
// cererilor.
import { QueryClient } from '@tanstack/react-query';

const REINCERCARI = 1;

/**
 * O cerere se reincearca o data cand serverul nu raspunde sau da 5xx. Un
 * raspuns 4xx (de exemplu 404) nu se schimba la a doua cerere, deci nu se
 * reincearca.
 * @param {number} numarEsecuri
 * @param {unknown} error
 * @returns {boolean}
 */
function seReincearca(numarEsecuri, error) {
  const status = error?.response?.status;
  if (status >= 400 && status < 500) {
    return false;
  }
  return numarEsecuri < REINCERCARI;
}

/**
 * Creeaza clientul TanStack Query al aplicatiei.
 * @param {object} [optiuniCereri] Optiuni care le inlocuiesc pe cele
 *   implicite ale cererilor; testele dau `retryDelay: 0`.
 * @returns {QueryClient}
 */
export function creeazaQueryClient(optiuniCereri = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: seReincearca,
        refetchOnWindowFocus: false,
        ...optiuniCereri,
      },
    },
  });
}
