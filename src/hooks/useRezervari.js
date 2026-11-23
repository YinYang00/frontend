// Hook-urile TanStack Query pentru rezervari.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createRezervare,
  getRezervare,
  getRezervari,
} from '../api/rezervariApi.js';

import { SLOTURI_KEY } from './useSloturi.js';

export const REZERVARI_KEY = ['rezervari'];

/**
 * Rezervarile utilizatorului autentificat.
 * @returns {import('@tanstack/react-query').UseQueryResult<object[]>}
 */
export function useRezervari() {
  return useQuery({ queryKey: REZERVARI_KEY, queryFn: getRezervari });
}

/**
 * O rezervare a utilizatorului autentificat, cu codul ei.
 * @param {number | string} idRezervare
 * @param {object} [optiuni]
 * @param {boolean} [optiuni.enabled] `false` cand cererea nu trebuie trimisa.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useRezervare(idRezervare, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...REZERVARI_KEY, idRezervare],
    queryFn: () => getRezervare(idRezervare),
    enabled,
  });
}

/**
 * Rezerva un loc intr-un slot; primeste `id_slot`. Sloturile se reincarca
 * si dupa succes, si dupa refuz: oricum s-a terminat cererea, locurile
 * libere afisate s-ar putea sa nu mai fie cele reale.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useCreateRezervare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRezervare,
    onSettled: () => queryClient.invalidateQueries({ queryKey: SLOTURI_KEY }),
  });
}
