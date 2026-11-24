import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useReguliAcces } from '../../hooks/useReguliAcces.js';

import ReguliAccesForm from './ReguliAccesForm.jsx';

/**
 * Sectiunea cu regulile de acces, pe pagina de administrare a facilitatii.
 * Formularul apare doar cu regulile citite: salvat fara ele, le-ar sterge.
 * @param {object} props
 * @param {number | string} props.idFacilitate
 */
export default function ReguliAcces({ idFacilitate }) {
  const {
    data: reguli,
    isPending,
    isError,
    isSuccess,
    error,
    refetch,
  } = useReguliAcces(idFacilitate);

  return (
    <section
      aria-labelledby="reguli-acces"
      className="flex flex-col gap-4 card p-5"
    >
      <h2 id="reguli-acces" className="text-lg font-semibold text-ink">
        Reguli de acces
      </h2>
      <p className="text-sm text-muted">
        Un rând gol înseamnă că acea categorie nu are limite.
      </p>
      {isPending && (
        <StatusMessage varianta="info">Se încarcă regulile…</StatusMessage>
      )}
      {isError && (
        <div className="flex flex-col items-start gap-3">
          <StatusMessage varianta="eroare">
            {getErrorMessage(error)}
          </StatusMessage>
          <button
            type="button"
            className="btn btn-secundar"
            onClick={() => refetch()}
          >
            Încearcă din nou
          </button>
        </div>
      )}
      {isSuccess && (
        <ReguliAccesForm idFacilitate={idFacilitate} reguli={reguli} />
      )}
    </section>
  );
}
