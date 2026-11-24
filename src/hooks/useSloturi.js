// Hook-urile TanStack Query pentru sloturi.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ascultaEvenimentele } from '../api/evenimenteApi.js';
import { createSloturi, getSloturi } from '../api/facilitatiApi.js';
import { updateStareSlot } from '../api/sloturiApi.js';
import { getDataRomania } from '../utils/oraRomania.js';

export const SLOTURI_KEY = ['sloturi'];

/**
 * Sloturile unei facilitati dintr-o zi. Cheia incepe cu SLOTURI_KEY, ca
 * rezervarea sau mentenanta sa poata reincarca toate sloturile deodata.
 * @param {number} idFacilitate
 * @param {string} zi Data `AAAA-LL-ZZ`, in ora Romaniei.
 * @param {object} [optiuni]
 * @param {boolean} [optiuni.enabled] `false` cand cererea nu trebuie trimisa.
 * @returns {import('@tanstack/react-query').UseQueryResult<object[]>}
 */
export function useSloturi(idFacilitate, zi, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...SLOTURI_KEY, idFacilitate, zi],
    queryFn: () => getSloturi(idFacilitate, zi),
    enabled,
  });
}

/**
 * Slotul dat, asa cum arata acum in calendarul deschis: dupa reincarcarea
 * sloturilor are starea noua. Nu trimite cereri proprii.
 * @param {object} slot Slotul din momentul alegerii.
 * @returns {object} Slotul la zi sau cel dat, daca nu mai e in calendar.
 */
export function useSlotLaZi(slot) {
  const { data: sloturi = [] } = useSloturi(
    slot.id_facilitate,
    getDataRomania(slot.ora_inceput),
    { enabled: false },
  );
  return sloturi.find((altul) => altul.id_slot === slot.id_slot) ?? slot;
}

/**
 * Tine la zi sloturile afisate ale unei facilitati, cat timp componenta e pe
 * ecran: se reincarca la evenimentele facilitatii si la fiecare conectare.
 * Cheia nu contine ziua, ca schimbarea ei sa nu refaca conexiunea; se cer
 * oricum doar sloturile zilei afisate.
 * @param {number} idFacilitate
 */
export function useSloturiInTimpReal(idFacilitate) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const filtru = { queryKey: [...SLOTURI_KEY, idFacilitate] };
    // Prima incarcare a zilei, daca e in curs, s-ar termina cu sloturile de
    // dinaintea evenimentului; invalidarea singura nu o reia.
    const reincarca = async () => {
      await queryClient.cancelQueries(filtru);
      await queryClient.invalidateQueries(filtru);
    };
    return ascultaEvenimentele({
      onConectare: reincarca,
      onSlotActualizat: (eveniment) => {
        if (eveniment.id_facilitate === idFacilitate) {
          reincarca();
        }
      },
    });
  }, [queryClient, idFacilitate]);
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

/**
 * Schimba starea unui slot (`Mentenanta` sau `Liber`); primeste
 * `{ idSlot, stare }`. Sloturile se reincarca oricum s-a terminat cererea.
 * @returns {import('@tanstack/react-query').UseMutationResult<object>}
 */
export function useUpdateStareSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idSlot, stare }) => updateStareSlot(idSlot, stare),
    onSettled: () => queryClient.invalidateQueries({ queryKey: SLOTURI_KEY }),
  });
}
