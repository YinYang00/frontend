import { Link, Navigate, Outlet, useLocation } from 'react-router';

import { useSesiune } from '../hooks/useSesiune.js';

import StatusMessage from './StatusMessage.jsx';

/**
 * Mesajul pentru un utilizator autentificat fara rolul cerut de pagina.
 */
function NuAiAcces() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="text-2xl font-semibold text-ink">
        Nu ai acces la această pagină
      </h1>
      <p className="text-sm text-muted">
        Pagina este disponibilă doar administratorilor.
      </p>
      <Link to="/facilitati" className="text-sm text-usv hover:underline">
        Înapoi la facilități
      </Link>
    </section>
  );
}

/**
 * Ruta parinte pentru paginile care cer cont. Un Guest ajunge la
 * autentificare, de unde revine pe pagina ceruta (`state.dela`); un
 * utilizator fara rolul cerut vede „Nu ai acces la această pagină”.
 * @param {object} props
 * @param {'Administrator'} [props.rol] Rolul cerut; lipseste cand ajunge
 *   orice utilizator autentificat.
 */
export default function RutaProtejata({ rol }) {
  const { stare, utilizator } = useSesiune();
  const { pathname, search } = useLocation();

  if (stare === 'guest') {
    return (
      <Navigate
        to="/autentificare"
        replace
        state={{ dela: pathname + search }}
      />
    );
  }
  // Fara profil rolul nu se cunoaste inca: pagina nu se arata si nici nu se
  // refuza.
  if (stare === 'se-incarca') {
    return (
      <p role="status" aria-label="Se încarcă pagina" className="text-muted">
        Se încarcă…
      </p>
    );
  }
  if (stare === 'eroare') {
    return (
      <StatusMessage varianta="eroare">
        Pagina nu se poate afișa: profilul nu s-a putut încărca.
      </StatusMessage>
    );
  }
  if (rol && utilizator.rol !== rol) {
    return <NuAiAcces />;
  }
  return <Outlet />;
}
