// Hook-urile TanStack Query pentru sloturi.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSloturi, getSloturi } from '../api/facilitatiApi.js';

export const SLOTURI_KEY = ['sloturi'];

/**
 * Sloturile unei facilitati dintr-o zi. Cheia incepe cu SLOTURI_KEY, ca
 * rezervarea sau mentenanta sa poata reincarca toate sloturile deodata.
 * @param {number} idFacilitate
 * @param {string} zi Data `AAAA-LL-ZZ`, in ora Romaniei.
 * @returns {import('@tanstack/react-query').UseQueryResult<object[]>}
 */
export function useSloturi(idFacilitate, zi) {
  return useQuery({
    queryKey: [...SLOTURI_KEY, idFacilitate, zi],
    queryFn: () => getSloturi(idFacilitate, zi),
  });
}

/**
 * Genereaza sloturile unei zile pentru o facilitate; primeste programul
 * zilei. Dupa succes, sloturile afisate se reincarca.
 * @param {number | string} idFacilitate
 * @returns {import('@tanstack/react-query').UseMutationResult<object[]>}
 */
export function useCreateSloturi(idFacilitate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (program) => createSloturi(idFacilitate, program),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SLOTURI_KEY }),
  });
}
