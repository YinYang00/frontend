import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useRezervare } from '../../hooks/useRezervari.js';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

import { getEticheta } from './etichetaRezervare.js';

/**
 * Legatura inapoi la lista rezervarilor.
 */
function LinkInapoi() {
  return (
    <Link to="/rezervari" className="text-sm text-usv hover:underline">
      ← Înapoi la rezervări
    </Link>
  );
}

/**
 * Un rand din detaliile rezervarii: denumirea si valoarea lui.
 * @param {object} props
 * @param {string} props.termen
 * @param {import('react').ReactNode} props.children
 */
function Detaliu({ termen, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase text-muted">{termen}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

/**
 * Pagina detaliilor unei rezervari, doar pentru utilizatorii autentificati:
 * facilitatea, ziua, intervalul, eticheta si codul rezervarii.
 */
export default function RezervarePage() {
  const { id } = useParams();
  const { data: rezervare, isPending, isError, error } = useRezervare(id);
  // Ora se citeste o data, la deschiderea paginii, ca in lista rezervarilor.
  const [acum] = useState(Date.now);

  if (isPending) {
    return (
      <StatusMessage varianta="info">Se încarcă rezervarea…</StatusMessage>
    );
  }
  if (isError) {
    // Backend-ul da 404 si pentru rezervarea altui utilizator, ca sa nu se
    // afle ca exista.
    const mesaj =
      error?.response?.status === 404
        ? 'Rezervarea nu există.'
        : getErrorMessage(error);
    return (
      <section className="flex flex-col items-start gap-4">
        <StatusMessage varianta="eroare">{mesaj}</StatusMessage>
        <LinkInapoi />
      </section>
    );
  }

  const { slot, facilitate, cod_qr: cod } = rezervare;
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-2">
        <LinkInapoi />
        <h1 className="text-3xl font-normal text-heading">
          {facilitate.denumire}
        </h1>
      </header>
      <dl className="card flex flex-col gap-4 p-4">
        <Detaliu termen="Ziua">{formatZi(slot.ora_inceput)}</Detaliu>
        <Detaliu termen="Interval">
          <span className="tabular-nums">
            {formatOra(slot.ora_inceput)} – {formatOra(slot.ora_sfarsit)}
          </span>
        </Detaliu>
        <Detaliu termen="Stare">{getEticheta(rezervare, acum)}</Detaliu>
        <Detaliu termen="Codul rezervării">
          <span className="font-mono break-all">{cod}</span>
        </Detaliu>
      </dl>
    </section>
  );
}
