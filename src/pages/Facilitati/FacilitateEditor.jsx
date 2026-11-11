import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';

import FacilitateForm from './FacilitateForm.jsx';

/**
 * Panoul cu formularul de adaugare sau editare si eroarea trimisa de server.
 * @param {object} props
 * @param {object} [props.facilitate] Facilitatea editata; lipseste la adaugare.
 * @param {import('@tanstack/react-query').UseMutationResult} props.salvare
 *   Mutatia folosita pentru salvare (creare sau modificare).
 * @param {(date: object) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function FacilitateEditor({
  facilitate,
  salvare,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {facilitate ? `Editează ${facilitate.denumire}` : 'Facilitate nouă'}
      </h2>
      {salvare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(salvare.error)}
        </StatusMessage>
      )}
      <FacilitateForm
        key={facilitate?.id_facilitate ?? 'nou'}
        facilitate={facilitate}
        isSaving={salvare.isPending}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
