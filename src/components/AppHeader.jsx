import { NavLink } from 'react-router';

import UsvLogo from './UsvLogo.jsx';

// Doar paginile care exista deja; restul meniului din Figma (Acasa,
// Rezervarile mele, Lista de asteptare) se adauga odata cu paginile lor.
const PAGINI = [{ to: '/facilitati', label: 'Facilități' }];

/**
 * Antetul aplicatiei: marca USV Sport si meniul principal.
 */
export default function AppHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
        <NavLink to="/" aria-label="USV Sport, pagina principală">
          <UsvLogo subtitlu="Campus Sports Booking" />
        </NavLink>
        <nav aria-label="Meniu principal">
          <ul className="flex gap-6 text-sm">
            {PAGINI.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className="block border-b-2 border-transparent py-2 text-muted hover:text-usv aria-[current=page]:border-usv aria-[current=page]:text-usv"
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
