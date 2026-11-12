import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useFacilitati } from '../../hooks/useFacilitati.js';

import FacilitateCard from './FacilitateCard.jsx';

/**
 * Lista facilitatilor citita de la backend, cu starile de incarcare, eroare
 * si lista goala.
 * @param {object} props
 * @param {(facilitate: object) => void} props.onEdit
 * @param {(facilitate: object) => void} props.onDelete
 */
export default function FacilitatiList({ onEdit, onDelete }) {
  const {
    data: facilitati,
    isPending,
    isError,
    error,
    refetch,
  } = useFacilitati();

  if (isPending) {
    return (
      <StatusMessage varianta="info">Se încarcă facilitățile…</StatusMessage>
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
  if (facilitati.length === 0) {
    return (
      <StatusMessage varianta="info">
        Nu există încă nicio facilitate. Adaugă prima facilitate.
      </StatusMessage>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {facilitati.map((facilitate) => (
        <FacilitateCard
          key={facilitate.id_facilitate}
          facilitate={facilitate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
