import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  areToken,
  onSesiuneExpirata,
  salveazaToken,
  stergeToken,
} from '../api/httpClient.js';
import { PROFIL_KEY, useProfil } from '../hooks/useProfil.js';
import { SesiuneContext } from '../hooks/useSesiune.js';

/**
 * Starea sesiunii, din token si din cererea profilului.
 * @param {boolean} isAutentificat
 * @param {import('@tanstack/react-query').UseQueryResult} profil
 * @returns {'guest' | 'se-incarca' | 'eroare' | 'autentificat'}
 */
function stareSesiune(isAutentificat, profil) {
  if (!isAutentificat) {
    return 'guest';
  }
  if (profil.data) {
    return 'autentificat';
  }
  return profil.isError ? 'eroare' : 'se-incarca';
}

/**
 * Tine sesiunea utilizatorului: tokenul salvat si profilul cerut de la
 * server, ca dupa reincarcarea paginii utilizatorul sa ramana autentificat.
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export default function SesiuneProvider({ children }) {
  const queryClient = useQueryClient();
  const [isAutentificat, setIsAutentificat] = useState(areToken);
  const profil = useProfil(isAutentificat);

  const incepeSesiunea = useCallback(
    ({ token, utilizator }) => {
      salveazaToken(token);
      queryClient.setQueryData(PROFIL_KEY, utilizator);
      setIsAutentificat(true);
    },
    [queryClient],
  );

  const incheieSesiunea = useCallback(() => {
    stergeToken();
    setIsAutentificat(false);
    queryClient.clear();
  }, [queryClient]);

  // Serverul a respins tokenul: sesiunea se incheie, iar dupa autentificare
  // utilizatorul revine pe pagina pe care era.
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  useEffect(
    () =>
      onSesiuneExpirata(() => {
        incheieSesiunea();
        navigate('/autentificare', { state: { dela: pathname + search } });
      }),
    [incheieSesiunea, navigate, pathname, search],
  );

  const stare = stareSesiune(isAutentificat, profil);
  const sesiune = useMemo(
    () => ({
      stare,
      utilizator: stare === 'autentificat' ? profil.data : undefined,
      eroare: stare === 'eroare' ? profil.error : undefined,
      incepeSesiunea,
      incheieSesiunea,
    }),
    [stare, profil.data, profil.error, incepeSesiunea, incheieSesiunea],
  );

  return (
    <SesiuneContext.Provider value={sesiune}>
      {children}
    </SesiuneContext.Provider>
  );
}
