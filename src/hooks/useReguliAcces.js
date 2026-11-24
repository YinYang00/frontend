// Hook-urile TanStack Query pentru regulile de acces ale unei facilitati.
import { useMutation, useQuery } from '@tanstack/react-query';

import { getReguliAcces, updateReguliAcces } from '../api/reguliAccesApi.js';

const REGULI_ACCES_KEY = ['reguli-acces'];

/**
 * Regulile de acces ale unei facilitati. Ele umplu un formular, deci se cer o
 * singura data la fiecare deschidere a paginii: nici reluarea in fundal, care
 * ar sterge ce se completeaza, nici datele ramase de la deschiderea trecuta.
 * @param {number | string} idFacilitate
 * @returns {import('@tanstack/react-query').UseQueryResult<object[]>}
 */
export function useReguliAcces(idFacilitate) {
  return useQuery({
    queryKey: [...REGULI_ACCES_KEY, idFacilitate],
    queryFn: () => getReguliAcces(idFacilitate),
    staleTime: Infinity,
    gcTime: 0,
  });
}

/**
 * Inlocuieste regulile de acces ale unei facilitati; primeste lista completa
 * si intoarce regulile salvate. Nu le pune in cache: daca pagina s-a inchis
 * intre timp, ar ramane acolo si la redeschidere nu s-ar mai cere regulile.
 * @param {number | string} idFacilitate
 * @returns {import('@tanstack/react-query').UseMutationResult<object[]>}
 */
export function useUpdateReguliAcces(idFacilitate) {
  return useMutation({
    mutationFn: (reguli) => updateReguliAcces(idFacilitate, reguli),
  });
}
