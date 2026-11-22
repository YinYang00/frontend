// Hook-urile TanStack Query pentru rutele de autentificare.
import { useMutation } from '@tanstack/react-query';

import { loginUtilizator, registerUtilizator } from '../api/authApi.js';

import { useSesiune } from './useSesiune.js';

/**
 * Inregistreaza un utilizator nou; primeste { nume, email, parola }.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useInregistrare() {
  return useMutation({ mutationFn: registerUtilizator });
}

/**
 * Autentifica utilizatorul cu { email, parola } si ii porneste sesiunea.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useAutentificare() {
  const { incepeSesiunea } = useSesiune();
  return useMutation({
    mutationFn: loginUtilizator,
    onSuccess: incepeSesiunea,
  });
}
