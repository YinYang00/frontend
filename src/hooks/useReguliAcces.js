// Hook-urile TanStack Query pentru regulile de acces ale unei facilitati.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
 * Inlocuieste regulile de acces ale unei facilitati; primeste lista completa.
 * Dupa succes, regulile citite devin cele salvate, intoarse de server.
 * @param {number | string} idFacilitate
 * @returns {import('@tanstack/react-query').UseMutationResult<object[]>}
 */
export function useUpdateReguliAcces(idFacilitate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reguli) => updateReguliAcces(idFacilitate, reguli),
    onSuccess: (salvate) =>
      queryClient.setQueryData([...REGULI_ACCES_KEY, idFacilitate], salvate),
  });
}
