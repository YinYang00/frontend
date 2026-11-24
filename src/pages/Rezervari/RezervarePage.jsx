import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useAnulareRezervare, useRezervare } from '../../hooks/useRezervari.js';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

import AnulareDialog from './AnulareDialog.jsx';
import { getEticheta, isAnulabila } from './etichetaRezervare.js';

const HTTP_NOT_FOUND = 404;

const MESAJ_NEGASITA = 'Rezervarea nu există.';

// Id-ul unei rezervari e un numar intreg pozitiv; altfel backend-ul ar da 400.
const FORMAT_ID_REZERVARE = /^[1-9]\d*$/;

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
 * Mesajul de eroare al paginii, cu legatura inapoi la lista rezervarilor.
 * @param {object} props
 * @param {string} props.mesaj
 */
function EroareRezervare({ mesaj }) {
  return (
    <section className="flex flex-col items-start gap-4">
      <StatusMessage varianta="eroare">{mesaj}</StatusMessage>
      <LinkInapoi />
    </section>
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
 * facilitatea, ziua, intervalul, eticheta si codul rezervarii, plus
 * "Anuleaza" cat timp rezervarea e activa si slotul nu a inceput.
 */
export default function RezervarePage() {
  const { id } = useParams();
  const idValid = FORMAT_ID_REZERVARE.test(id);
  const {
    data: rezervare,
    isPending,
    isError,
    error,
  } = useRezervare(id, {
    enabled: idValid,
  });
  // Ora se citeste o data, la deschiderea paginii, ca in lista rezervarilor.
  const [acum] = useState(Date.now);
  const anulare = useAnulareRezervare();
  const [confirmare, setConfirmare] = useState(false);

  if (!idValid) {
    return <EroareRezervare mesaj={MESAJ_NEGASITA} />;
  }
  if (isPending) {
    return (
      <StatusMessage varianta="info">Se încarcă rezervarea…</StatusMessage>
    );
  }
  if (isError) {
    // Backend-ul da 404 si pentru rezervarea altui utilizator, ca sa nu se
    // afle ca exista.
    const mesaj =
      error?.response?.status === HTTP_NOT_FOUND
        ? MESAJ_NEGASITA
        : getErrorMessage(error);
    return <EroareRezervare mesaj={mesaj} />;
  }

  const { slot, facilitate } = rezervare;
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
          <span className="font-mono break-all">{rezervare.cod_qr}</span>
        </Detaliu>
      </dl>
      {anulare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(anulare.error)}
        </StatusMessage>
      )}
      {isAnulabila(rezervare, acum) && (
        <button
          type="button"
          className="btn btn-secundar self-start"
          disabled={anulare.isPending}
          onClick={() => {
            anulare.reset();
            setConfirmare(true);
          }}
        >
          Anulează
        </button>
      )}
      {confirmare && (
        <AnulareDialog
          rezervare={rezervare}
          anulare={anulare}
          onInchide={() => setConfirmare(false)}
        />
      )}
    </section>
  );
}
