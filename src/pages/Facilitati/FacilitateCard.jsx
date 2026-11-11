import Icon from '../../components/Icon.jsx';

/**
 * Cardul unei facilitati, ca in sectiunea „Facilitati populare” din Figma:
 * zona de imagine cu tipul, denumirea, locatia, capacitatea si actiunile.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {(facilitate: object) => void} props.onEdit
 * @param {(facilitate: object) => void} props.onDelete
 */
export default function FacilitateCard({ facilitate, onEdit, onDelete }) {
  const { denumire, tip, capacitate_maxima: capacitate, locatie } = facilitate;

  return (
    <li className="card flex flex-col overflow-hidden">
      <div className="relative flex h-32 flex-col items-center justify-center gap-1 bg-placeholder text-muted">
        <span className="absolute top-3 left-3 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-ink">
          {tip}
        </span>
        <Icon nume="imagine" className="size-6" />
        <span className="text-xs">Imagine facilitate</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold text-ink">{denumire}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon nume="locatie" className="size-3.5 shrink-0" />
            {locatie}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon nume="persoane" className="size-3.5 shrink-0" />
            {capacitate} {capacitate === 1 ? 'persoană' : 'persoane'}
          </p>
        </div>
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            className="btn btn-soft flex-1"
            onClick={() => onEdit(facilitate)}
            aria-label={`Editează ${denumire}`}
          >
            <Icon nume="editare" className="size-3.5" />
            Editează
          </button>
          <button
            type="button"
            className="btn btn-secundar flex-1 text-red-700"
            onClick={() => onDelete(facilitate)}
            aria-label={`Șterge ${denumire}`}
          >
            <Icon nume="stergere" className="size-3.5" />
            Șterge
          </button>
        </div>
      </div>
    </li>
  );
}
