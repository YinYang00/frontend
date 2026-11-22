import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import { useSesiune } from '../hooks/useSesiune.js';

import Icon from './Icon.jsx';
import UsvLogo from './UsvLogo.jsx';

// Categoriile din API, asa cum se afiseaza (vezi GLOSSARY.md, Categorie).
const CATEGORII = {
  Student: 'Student',
  CadruDidactic: 'Cadru didactic',
  PersonalAdministrativ: 'Personal administrativ',
};

// Rolul folosit in meniu pentru o persoana neautentificata (GLOSSARY.md, Guest).
const GUEST = 'Guest';

// Meniul principal si rolurile care vad fiecare element.
const PAGINI = [
  {
    to: '/facilitati',
    label: 'Facilități',
    roluri: [GUEST, 'Utilizator', 'Administrator'],
  },
  {
    to: '/rezervari',
    label: 'Rezervările mele',
    roluri: ['Utilizator', 'Administrator'],
  },
  { to: '/admin/facilitati', label: 'Administrare', roluri: ['Administrator'] },
];

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
 * Paginile din meniu pe care le vede rolul dat.
 * @param {object} props
 * @param {string} props.rol `Guest`, `Utilizator` sau `Administrator`.
 */
function ListaPagini({ rol }) {
  return (
    <ul className="flex flex-col text-sm md:flex-row md:gap-6">
      {PAGINI.filter(({ roluri }) => roluri.includes(rol)).map(
        ({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className="block border-l-2 border-transparent px-3 py-3 text-muted hover:text-usv aria-[current=page]:border-usv aria-[current=page]:text-usv md:border-b-2 md:border-l-0 md:px-0 md:py-2"
            >
              {label}
            </NavLink>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * Starea meniului strans pe telefon. Meniul ramane deschis doar pe intrarea
 * din istoric pe care a fost deschis, deci se inchide singur la navigare;
 * Escape il inchide si muta focusul inapoi pe buton.
 * @returns {{isDeschis: boolean, comuta: () => void, butonRef: object}}
 */
function useMeniuMobil() {
  const { key } = useLocation();
  const [deschisPe, setDeschisPe] = useState(null);
  const butonRef = useRef(null);
  const isDeschis = deschisPe === key;

  useEffect(() => {
    if (!isDeschis) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDeschisPe(null);
        butonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDeschis]);

  const comuta = () => setDeschisPe(isDeschis ? null : key);
  return { isDeschis, comuta, butonRef };
}

/**
 * Antetul aplicatiei: marca USV Sport si meniul principal dupa rol. Pe un
 * ecran ingust meniul se strange intr-un buton.
 */
export default function AppHeader() {
  const { utilizator } = useSesiune();
  const rol = utilizator?.rol ?? GUEST;
  const { isDeschis, comuta, butonRef } = useMeniuMobil();
  const idMeniu = useId();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 md:gap-x-8 py-3 sm:px-6">
        <NavLink to="/" aria-label="USV Sport, pagina principală">
          <UsvLogo subtitlu="Campus Sports Booking" />
        </NavLink>
        <button
          ref={butonRef}
          type="button"
          className="btn btn-secundar md:hidden"
          aria-expanded={isDeschis}
          aria-controls={idMeniu}
          onClick={comuta}
        >
          <Icon nume={isDeschis ? 'inchidere' : 'meniu'} />
          Meniu
        </button>
        <nav
          id={idMeniu}
          aria-label="Meniu principal"
          className={`${isDeschis ? 'flex' : 'hidden'} w-full flex-col gap-4 border-t border-line pt-3 pb-1 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-between md:border-t-0 md:p-0`}
        >
          <ListaPagini rol={rol} />
          <ZonaUtilizator />
        </nav>
      </div>
    </header>
  );
}
