// Sesiunea utilizatorului: cine e autentificat si cum incepe sau se incheie
// sesiunea. Valoarea vine din SesiuneProvider.
import { createContext, useContext } from 'react';

export const SesiuneContext = createContext(null);

/**
 * Sesiunea curenta.
 * @returns {{
 *   stare: 'guest' | 'se-incarca' | 'eroare' | 'autentificat',
 *   utilizator: object | undefined,
 *   incepeSesiunea: (date: {token: string, utilizator: object}) => void,
 *   incheieSesiunea: () => void,
 * }} `utilizator` exista doar in starea `autentificat`.
 */
export function useSesiune() {
  const sesiune = useContext(SesiuneContext);
  if (!sesiune) {
    throw new Error('useSesiune se foloseste doar in SesiuneProvider.');
  }
  return sesiune;
}
