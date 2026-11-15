// Hook-urile TanStack Query pentru rutele de autentificare.
import { useMutation } from '@tanstack/react-query';

import { registerUtilizator } from '../api/authApi.js';

/**
 * Inregistreaza un utilizator nou; primeste { nume, email, parola }.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useInregistrare() {
  return useMutation({ mutationFn: registerUtilizator });
}
