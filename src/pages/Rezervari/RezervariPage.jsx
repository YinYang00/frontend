import { useId, useState } from 'react';
import { Link } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useCancelRezervare, useRezervari } from '../../hooks/useRezervari.js';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

import AnulareDialog from './AnulareDialog.jsx';
import { getEticheta, isAnulabila, isViitoare } from './etichetaRezervare.js';

/**
 * O rezervare din lista: facilitatea, ziua, intervalul, eticheta si,
 * daca se mai poate anula, butonul "Anuleaza".
 * @param {object} props
 * @param {object} props.rezervare
 * @param {string} props.eticheta
 * @param {(() => void) | null} props.onAnuleaza Lipseste cand nu se poate anula.
 * @param {boolean} props.isPending True cat timp o anulare e in curs.
 */
function RezervareItem({ rezervare, eticheta, onAnuleaza, isPending }) {
  const { id_rezervare: id, slot, facilitate } = rezervare;
  return (
    <li className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex flex-col gap-1">
        <Link
          to={`/rezervari/${id}`}
          className="font-semibold text-ink hover:text-usv"
        >
          {facilitate.denumire}
        </Link>
        <span className="text-sm text-muted">
          {formatZi(slot.ora_inceput)},{' '}
          <span className="tabular-nums">
            {formatOra(slot.ora_inceput)} – {formatOra(slot.ora_sfarsit)}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-placeholder px-2 py-0.5 text-xs font-medium text-muted">
          {eticheta}
        </span>
        {onAnuleaza && (
          <button
            type="button"
            className="btn btn-secundar"
            aria-label={`Anulează ${facilitate.denumire}, ${formatZi(slot.ora_inceput)}, ${formatOra(slot.ora_inceput)}`}
            disabled={isPending}
            onClick={onAnuleaza}
          >
            Anulează
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * O sectiune a paginii, cu titlul ei; lipseste cand nu are rezervari.
 * @param {object} props
 * @param {string} props.titlu
 * @param {object[]} props.rezervari
 * @param {number} props.acum
 * @param {(rezervare: object) => void} props.onAnuleaza
 * @param {boolean} props.isPending
 */
function SectiuneRezervari({ titlu, rezervari, acum, onAnuleaza, isPending }) {
  const idTitlu = useId();
  if (rezervari.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby={idTitlu} className="flex flex-col gap-3">
      <h2 id={idTitlu} className="text-xl font-normal text-heading">
        {titlu}
      </h2>
      <ul className="flex flex-col gap-3">
        {rezervari.map((rezervare) => (
          <RezervareItem
            key={rezervare.id_rezervare}
            rezervare={rezervare}
            eticheta={getEticheta(rezervare, acum)}
            onAnuleaza={
              isAnulabila(rezervare, acum) ? () => onAnuleaza(rezervare) : null
            }
            isPending={isPending}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * Lista rezervarilor, cu starile de incarcare, eroare si lista goala.
 * Viitoare: rezervarile active al caror slot nu s-a terminat, cea mai
 * apropiata prima. Istoric: restul, cea mai recenta prima.
 */
function ListaRezervari() {
  const {
    data: rezervari,
    isPending,
    isError,
    error,
    refetch,
  } = useRezervari();
  // shortcut: ora se citeste la deschiderea paginii si dupa fiecare anulare; o
  // pagina lasata deschisa nu muta singura rezervarile in Istoric (s-ar putea
  // cu un interval).
  const [acum, setAcum] = useState(Date.now);
  const anulare = useCancelRezervare();
  const [deAnulat, setDeAnulat] = useState(null);

  if (isPending) {
    return (
      <StatusMessage varianta="info">Se încarcă rezervările…</StatusMessage>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <StatusMessage varianta="eroare">
          {getErrorMessage(error)}
        </StatusMessage>
        <button type="button" className="btn btn-secundar" onClick={refetch}>
          Încearcă din nou
        </button>
      </div>
    );
  }
  if (rezervari.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <StatusMessage varianta="info">
          Nu ai încă nicio rezervare.
        </StatusMessage>
        <Link to="/facilitati" className="btn btn-primar">
          Vezi facilitățile
        </Link>
      </div>
    );
  }

  const inceput = (rezervare) => Date.parse(rezervare.slot.ora_inceput);
  const viitoare = rezervari
    .filter((rezervare) => isViitoare(rezervare, acum))
    .sort((prima, aDoua) => inceput(prima) - inceput(aDoua));
  const istoric = rezervari
    .filter((rezervare) => !isViitoare(rezervare, acum))
    .sort((prima, aDoua) => inceput(aDoua) - inceput(prima));

  const sectiune = {
    acum,
    onAnuleaza: setDeAnulat,
    isPending: anulare.isPending,
  };
  return (
    <>
      {anulare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(anulare.error)}
        </StatusMessage>
      )}
      <SectiuneRezervari titlu="Viitoare" rezervari={viitoare} {...sectiune} />
      <SectiuneRezervari titlu="Istoric" rezervari={istoric} {...sectiune} />
      {deAnulat && (
        <AnulareDialog
          rezervare={deAnulat}
          anulare={anulare}
          onInchide={() => {
            setDeAnulat(null);
            setAcum(Date.now());
          }}
        />
      )}
    </>
  );
}

/**
 * Pagina "Rezervarile mele", doar pentru utilizatorii autentificati.
 */
export default function RezervariPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-normal text-heading">Rezervările mele</h1>
        <p className="text-sm text-muted">
          Rezervările tale viitoare și cele trecute.
        </p>
      </header>
      <ListaRezervari />
    </section>
  );
}
