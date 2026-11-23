import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useCreateRezervare } from '../../hooks/useRezervari.js';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

const HTTP_NOT_FOUND = 404;

/**
 * Mesajul unei rezervari refuzate. Pentru slotul ocupat intre timp sau sters
 * textul e al interfetei; restul refuzurilor au mesajul serverului.
 * @param {unknown} error
 * @returns {string}
 */
function getMesajRefuz(error) {
  if (error?.response?.data?.cod === 'SLOT_OCUPAT') {
    return 'Slotul tocmai a fost ocupat';
  }
  if (error?.response?.status === HTTP_NOT_FOUND) {
    return 'Slotul nu mai există';
  }
  return getErrorMessage(error);
}

/**
 * Facilitatea, ziua si intervalul slotului rezervat.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {object} props.slot
 */
function DetaliiSlot({ facilitate, slot }) {
  return (
    <dl className="mt-3 text-sm text-ink">
      <dt className="sr-only">Facilitatea</dt>
      <dd className="font-medium">{facilitate.denumire}</dd>
      <dt className="sr-only">Ziua</dt>
      <dd className="capitalize">{formatZi(slot.ora_inceput)}</dd>
      <dt className="sr-only">Intervalul</dt>
      <dd className="tabular-nums">
        {formatOra(slot.ora_inceput)} – {formatOra(slot.ora_sfarsit)}
      </dd>
    </dl>
  );
}

/**
 * Dialogul de rezervare a unui slot liber. Se inchide cu Escape, cu
 * atingerea in afara lui sau cu butonul Inchide; focusul revine apoi pe
 * elementul care l-a deschis.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {object} props.slot
 * @param {() => void} props.onInchide
 */
export default function RezervareDialog({ facilitate, slot, onInchide }) {
  const rezervare = useCreateRezervare();
  const refInchide = useRef(null);

  useEffect(() => {
    const deschizator = document.activeElement;
    refInchide.current.focus();
    const onKeyDown = (event) => event.key === 'Escape' && onInchide();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      deschizator?.focus();
    };
  }, [onInchide]);

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center p-4 sm:items-center">
      {/* Fundalul: atingerea lui inchide dialogul; tastatura are Escape. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 bg-ink/40"
        onClick={onInchide}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rezervare-titlu"
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="rezervare-titlu" className="text-lg font-semibold text-ink">
          Rezervă slotul
        </h2>
        <DetaliiSlot facilitate={facilitate} slot={slot} />
        <div className="mt-4 flex flex-col gap-3">
          {rezervare.isError && (
            <StatusMessage varianta="eroare">
              {getMesajRefuz(rezervare.error)}
            </StatusMessage>
          )}
          {rezervare.isSuccess && (
            <>
              <StatusMessage varianta="succes">
                Rezervare confirmată
              </StatusMessage>
              <Link
                to={`/rezervari/${rezervare.data.id_rezervare}`}
                className="text-sm text-usv hover:underline"
              >
                Vezi detaliile rezervării
              </Link>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={refInchide}
            type="button"
            className="btn btn-secundar"
            onClick={onInchide}
          >
            Închide
          </button>
          {!rezervare.isSuccess && (
            <button
              type="button"
              className="btn btn-primar"
              disabled={rezervare.isPending}
              onClick={() => rezervare.mutate(slot.id_slot)}
            >
              {rezervare.isPending ? 'Se rezervă…' : 'Rezervă locul'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
