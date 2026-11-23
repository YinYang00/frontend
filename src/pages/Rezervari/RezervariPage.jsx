import { useState } from 'react';
import { Link } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useRezervari } from '../../hooks/useRezervari.js';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

// Starile memorate, asa cum se afiseaza (GLOSSARY.md, Stare a rezervarii).
const STARI = {
  Confirmata: 'Confirmată',
  PrezentaConfirmata: 'Prezență confirmată',
  Anulata: 'Anulată',
  Neonorata: 'Neonorată',
};

const STARI_ACTIVE = ['Confirmata', 'PrezentaConfirmata'];

/**
 * Eticheta unei rezervari. La o rezervare activa, „În desfășurare” si
 * „Finalizată” se deduc din ora slotului; nu sunt stari.
 * @param {object} rezervare
 * @param {number} acum Momentul de acum, in milisecunde.
 * @returns {string}
 */
function getEticheta(rezervare, acum) {
  const { stare_rezervare: stare, slot } = rezervare;
  if (STARI_ACTIVE.includes(stare)) {
    if (acum >= Date.parse(slot.ora_sfarsit)) {
      return 'Finalizată';
    }
    if (acum >= Date.parse(slot.ora_inceput)) {
      return 'În desfășurare';
    }
  }
  return STARI[stare];
}

/**
 * O rezervare din lista: facilitatea, ziua, intervalul si eticheta.
 * @param {object} props
 * @param {object} props.rezervare
 * @param {string} props.eticheta
 */
function RezervareItem({ rezervare, eticheta }) {
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
      <span className="rounded-md bg-placeholder px-2 py-0.5 text-xs font-medium text-muted">
        {eticheta}
      </span>
    </li>
  );
}

/**
 * O sectiune a paginii, cu titlul ei; lipseste cand nu are rezervari.
 * @param {object} props
 * @param {string} props.titlu
 * @param {object[]} props.rezervari
 * @param {number} props.acum
 */
function SectiuneRezervari({ titlu, rezervari, acum }) {
  if (rezervari.length === 0) {
    return null;
  }
  const idTitlu = `rezervari-${titlu.toLowerCase()}`;
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
  // shortcut: ora se citeste o data, la deschiderea paginii; o pagina lasata
  // deschisa nu muta singura rezervarile in Istoric (s-ar putea cu un interval).
  const [acum] = useState(Date.now);

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
  const isViitoare = (rezervare) =>
    STARI_ACTIVE.includes(rezervare.stare_rezervare) &&
    acum < Date.parse(rezervare.slot.ora_sfarsit);
  const viitoare = rezervari
    .filter(isViitoare)
    .sort((prima, aDoua) => inceput(prima) - inceput(aDoua));
  const istoric = rezervari
    .filter((rezervare) => !isViitoare(rezervare))
    .sort((prima, aDoua) => inceput(aDoua) - inceput(prima));

  return (
    <>
      <SectiuneRezervari titlu="Viitoare" rezervari={viitoare} acum={acum} />
      <SectiuneRezervari titlu="Istoric" rezervari={istoric} acum={acum} />
    </>
  );
}

/**
 * Pagina „Rezervările mele”, doar pentru utilizatorii autentificati.
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
