// Hook-ul TanStack Query pentru sloturile unei zile.
import { useQuery } from '@tanstack/react-query';

import { getSloturi } from '../api/facilitatiApi.js';

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
