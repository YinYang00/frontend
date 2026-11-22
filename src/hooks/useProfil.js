// Hook-ul TanStack Query pentru profilul utilizatorului autentificat.
import { useQuery } from '@tanstack/react-query';

import { getProfil } from '../api/utilizatoriApi.js';

export const PROFIL_KEY = ['profil'];

/**
 * Profilul de la server (`GET /utilizatori/me`). Nu se schimba in timpul
 * sesiunii, deci se cere o singura data.
 * @param {boolean} isAutentificat Profilul se cere doar daca exista un token.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useProfil(isAutentificat) {
  return useQuery({
    queryKey: PROFIL_KEY,
    queryFn: getProfil,
    enabled: isAutentificat,
    staleTime: Infinity,
  });
}
