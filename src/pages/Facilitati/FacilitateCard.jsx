/**
 * Cardul unei facilitati din lista, cu actiunile de editare si stergere.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {(facilitate: object) => void} props.onEdit
 * @param {(facilitate: object) => void} props.onDelete
 */
export default function FacilitateCard({ facilitate, onEdit, onDelete }) {
  const { denumire, tip, capacitate_maxima: capacitate, locatie } = facilitate;

  return (
    <li className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{denumire}</h3>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {tip}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-500">Capacitate</dt>
          <dd className="text-slate-800">
            {capacitate} {capacitate === 1 ? 'persoană' : 'persoane'}
          </dd>
          <dt className="text-slate-500">Locație</dt>
          <dd className="text-slate-800">{locatie}</dd>
        </dl>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secundar flex-1"
          onClick={() => onEdit(facilitate)}
          aria-label={`Editează ${denumire}`}
        >
          Editează
        </button>
        <button
          type="button"
          className="btn btn-secundar flex-1 text-red-700"
          onClick={() => onDelete(facilitate)}
          aria-label={`Șterge ${denumire}`}
        >
          Șterge
        </button>
      </div>
    </li>
  );
}
