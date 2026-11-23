import { formatOra } from '../../utils/oraRomania.js';

// Starea se vede si in culoare, si in text, ca sa nu depinda doar de culoare.
const STARI = {
  Liber: { text: 'Liber', clase: 'bg-success-soft text-success' },
  Ocupat: { text: 'Ocupat', clase: 'bg-red-50 text-red-800' },
  Mentenanta: { text: 'Mentenanță', clase: 'bg-placeholder text-muted' },
};

/**
 * Textul cu locurile libere ale unui slot.
 * @param {number} locuri
 * @returns {string}
 */
function formatLocuri(locuri) {
  return locuri === 1 ? '1 loc liber' : `${locuri} locuri libere`;
}

/**
 * Un slot: intervalul, starea si, la un slot liber al unei facilitati cu mai
 * multe locuri, cate locuri mai sunt.
 * @param {object} props
 * @param {object} props.slot
 * @param {boolean} props.showLocuri Daca facilitatea are mai mult de un loc.
 * @param {import('react').ReactNode} [props.children] Actiunea pe slot.
 */
function SlotItem({ slot, showLocuri, children }) {
  const stare = STARI[slot.stare];

  return (
    <li className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink tabular-nums">
          {formatOra(slot.ora_inceput)} – {formatOra(slot.ora_sfarsit)}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${stare.clase}`}
        >
          {stare.text}
        </span>
        {showLocuri && slot.stare === 'Liber' && (
          <span className="text-sm text-muted">
            {formatLocuri(slot.locuri_libere)}
          </span>
        )}
      </div>
      {children}
    </li>
  );
}

/**
 * Sloturile unei zile, ordonate dupa ora de inceput.
 * @param {object} props
 * @param {object[]} props.sloturi
 * @param {number} props.capacitate Capacitatea facilitatii; la capacitatea 1
 *   locurile libere nu se mai afiseaza, starea spune deja tot.
 * @param {(slot: object) => import('react').ReactNode} [props.renderActiune]
 *   Actiunea de pe fiecare slot, data de pagina care foloseste calendarul.
 */
export default function SloturiList({ sloturi, capacitate, renderActiune }) {
  const ordonate = [...sloturi].sort(
    (primul, alDoilea) =>
      Date.parse(primul.ora_inceput) - Date.parse(alDoilea.ora_inceput),
  );

  return (
    <ul aria-label="Sloturile zilei" className="flex flex-col gap-3">
      {ordonate.map((slot) => (
        <SlotItem key={slot.id_slot} slot={slot} showLocuri={capacitate > 1}>
          {renderActiune?.(slot)}
        </SlotItem>
      ))}
    </ul>
  );
}
