import { Link } from 'react-router';

import Icon from '../../components/Icon.jsx';

/**
 * Cardul unei facilitati, ca in sectiunea „Facilitati populare” din Figma:
 * zona de imagine cu tipul, denumirea ca link, locatia, capacitatea si,
 * optional, actiunile.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {string} props.adresa Pagina deschisa de denumirea facilitatii.
 * @param {import('react').ReactNode} [props.children] Actiunile cardului.
 */
export default function FacilitateCard({ facilitate, adresa, children }) {
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
          <h3 className="text-base font-semibold text-ink">
            <Link to={adresa} className="hover:text-usv hover:underline">
              {denumire}
            </Link>
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon nume="locatie" className="size-3.5 shrink-0" />
            {locatie}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon nume="persoane" className="size-3.5 shrink-0" />
            {capacitate} {capacitate === 1 ? 'persoană' : 'persoane'}
          </p>
        </div>
        {children && <div className="mt-auto flex gap-2">{children}</div>}
      </div>
    </li>
  );
}
