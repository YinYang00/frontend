// Hook-urile TanStack Query pentru facilitati. Dupa fiecare modificare lista
// este reincarcata de la server, deci interfata arata mereu datele reale.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createFacilitate,
  deleteFacilitate,
  getFacilitati,
  updateFacilitate,
} from '../api/facilitatiApi.js';

export const FACILITATI_KEY = ['facilitati'];

/**
 * Lista facilitatilor de la server.
 * @returns {import('@tanstack/react-query').UseQueryResult<object[]>}
 */
export function useFacilitati() {
  return useQuery({ queryKey: FACILITATI_KEY, queryFn: getFacilitati });
}

/**
 * Creeaza o mutatie care reincarca lista dupa succes.
 * @param {(variabile: unknown) => Promise<unknown>} mutationFn
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useFacilitateMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FACILITATI_KEY }),
  });
}

/**
 * Adauga o facilitate.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useCreateFacilitate() {
  return useFacilitateMutation(createFacilitate);
}

/**
 * Modifica o facilitate; primeste { id, date }.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateFacilitate() {
  return useFacilitateMutation(({ id, date }) => updateFacilitate(id, date));
}

/**
 * Sterge o facilitate; primeste id-ul.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useDeleteFacilitate() {
  return useFacilitateMutation(deleteFacilitate);
}
