import { NavLink, useLocation } from 'react-router';

import { useSesiune } from '../hooks/useSesiune.js';

import UsvLogo from './UsvLogo.jsx';

// Categoriile din API, asa cum se afiseaza (vezi GLOSSARY.md, Categorie).
const CATEGORII = {
  Student: 'Student',
  CadruDidactic: 'Cadru didactic',
  PersonalAdministrativ: 'Personal administrativ',
};

// Doar paginile care exista deja; restul meniului din Figma (Acasa,
// Rezervarile mele, Lista de asteptare) se adauga odata cu paginile lor.
const PAGINI = [{ to: '/facilitati', label: 'Facilități' }];

/**
 * Legatura spre autentificare pentru Guest. Dupa login, utilizatorul revine
 * pe pagina pe care era.
 */
function LinkAutentificare() {
  const { pathname, search } = useLocation();
  return (
    <NavLink
      to="/autentificare"
      state={{ dela: pathname + search }}
      className="btn btn-primar text-sm"
    >
      Autentificare
    </NavLink>
  );
}

/**
 * Starea profilului cerut dupa reincarcare: se incarca sau a esuat.
 * @param {object} props
 * @param {boolean} props.isEroare
 */
function StareProfil({ isEroare }) {
  if (isEroare) {
    return (
      <span role="alert" className="text-red-700">
        Profilul nu s-a putut încărca.
      </span>
    );
  }
  return (
    <span role="status" aria-label="Se încarcă profilul" className="text-muted">
      Se încarcă…
    </span>
  );
}

/**
 * Numele si categoria utilizatorului autentificat, cu butonul de deconectare;
 * pentru Guest, legatura spre autentificare.
 */
function ZonaUtilizator() {
  const { stare, utilizator, incheieSesiunea } = useSesiune();
  if (stare === 'guest') {
    return <LinkAutentificare />;
  }
  return (
    <div className="flex items-center gap-4 text-sm">
      {utilizator ? (
        <div className="flex flex-col text-right">
          <span className="font-medium text-ink">{utilizator.nume}</span>
          <span className="text-muted">{CATEGORII[utilizator.categorie]}</span>
        </div>
      ) : (
        <StareProfil isEroare={stare === 'eroare'} />
      )}
      <button
        type="button"
        className="btn btn-secundar"
        onClick={incheieSesiunea}
      >
        Deconectare
      </button>
    </div>
  );
}

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
        <ZonaUtilizator />
      </div>
    </header>
  );
}
