import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useSloturi } from '../../hooks/useSloturi.js';
import { getZileBanda } from '../../utils/oraRomania.js';

import SloturiList from './SloturiList.jsx';

/**
 * Banda cu ziua de azi si urmatoarele 13, derulabila orizontal pe telefon.
 * @param {object} props
 * @param {{data: string, ziSaptamana: string, ziLuna: string}[]} props.zile
 * @param {string} props.ziAleasa Data `AAAA-LL-ZZ` a zilei alese.
 * @param {(data: string) => void} props.onAlege
 */
function BandaZile({ zile, ziAleasa, onAlege }) {
  return (
    <div
      role="group"
      aria-label="Alege ziua"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
    >
      {zile.map(({ data, ziSaptamana, ziLuna }) => {
        const isAleasa = data === ziAleasa;
        return (
          <button
            key={data}
            type="button"
            aria-pressed={isAleasa}
            onClick={() => onAlege(data)}
            className={`flex min-w-16 shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-sm ${
              isAleasa
                ? 'border-usv bg-usv text-white'
                : 'border-line bg-white text-ink hover:bg-usv-soft'
            }`}
          >
            <span className="text-xs capitalize">{ziSaptamana}</span>
            <span className="font-semibold">{ziLuna}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Calendarul unei facilitati: banda de 14 zile si sloturile zilei alese.
 * Actiunea pe slot vine din afara: rezervare la utilizator, blocare la
 * administrator.
 * @param {object} props
 * @param {object} props.facilitate Facilitatea din API, cu `id_facilitate`
 *   si `capacitate_maxima`.
 * @param {(slot: object) => import('react').ReactNode} [props.renderActiune]
 */
export default function CalendarSloturi({ facilitate, renderActiune }) {
  const [zile] = useState(getZileBanda);
  // Ziua aleasa sta in adresa (`?zi=`), ca revenirea de la autentificare sa
  // deschida aceeasi zi; o zi din afara benzii inseamna azi.
  const [parametri, setParametri] = useSearchParams();
  const ziDinAdresa = parametri.get('zi');
  const ziAleasa = zile.some(({ data }) => data === ziDinAdresa)
    ? ziDinAdresa
    : zile[0].data;
  const handleAlege = (zi) => setParametri({ zi }, { replace: true });

  return (
    <section aria-label="Calendarul sloturilor" className="flex flex-col gap-4">
      <BandaZile zile={zile} ziAleasa={ziAleasa} onAlege={handleAlege} />
      <SloturiZilei
        facilitate={facilitate}
        zi={ziAleasa}
        renderActiune={renderActiune}
      />
    </section>
  );
}

/**
 * Sloturile zilei alese, cu starile de incarcare, eroare si zi goala.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {string} props.zi Data `AAAA-LL-ZZ` a zilei alese.
 * @param {(slot: object) => import('react').ReactNode} [props.renderActiune]
 */
function SloturiZilei({ facilitate, zi, renderActiune }) {
  const {
    data: sloturi,
    isPending,
    isError,
    error,
    refetch,
  } = useSloturi(facilitate.id_facilitate, zi);

  if (isPending) {
    return <StatusMessage varianta="info">Se încarcă sloturile…</StatusMessage>;
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
  if (sloturi.length === 0) {
    return (
      <StatusMessage varianta="info">
        Nu există sloturi în această zi.
      </StatusMessage>
    );
  }
  return (
    <SloturiList
      sloturi={sloturi}
      capacitate={facilitate.capacitate_maxima}
      renderActiune={renderActiune}
    />
  );
}
