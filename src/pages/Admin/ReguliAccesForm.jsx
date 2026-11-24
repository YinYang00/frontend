import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useUpdateReguliAcces } from '../../hooks/useReguliAcces.js';
import { CATEGORII } from '../../utils/categorii.js';
import { zodResolver } from '../../utils/zodResolver.js';

const COLOANE = [
  { camp: 'ore_maxim_saptamana', label: 'Ore maxime pe săptămână' },
  { camp: 'zile_avans_maxim', label: 'Zile maxime în avans' },
  { camp: 'prioritate', label: 'Prioritate' },
];

const ANTET =
  'px-0.5 py-1 text-left align-bottom text-xs font-medium text-muted';

const RAND_GOL = {
  ore_maxim_saptamana: '',
  zile_avans_maxim: '',
  prioritate: '',
};

/**
 * Un camp intreg obligatoriu intre 1 si `maxim`; acelasi mesaj pentru orice
 * valoare gresita.
 * @param {string} subiect Inceputul mesajului.
 * @param {number} maxim
 * @returns {z.ZodType}
 */
function intreg(subiect, maxim) {
  const mesaj = `${subiect} trebuie să fie un număr întreg între 1 și ${maxim}.`;
  return z.coerce
    .number({ error: mesaj })
    .int(mesaj)
    .min(1, mesaj)
    .max(maxim, mesaj);
}

// Aceleasi limite ca validarea din backend; 168 sunt orele unei saptamani.
const schemaRegula = z.object({
  ore_maxim_saptamana: intreg('Orele', 168),
  zile_avans_maxim: intreg('Zilele', 30),
  prioritate: intreg('Prioritatea', 5),
});

/**
 * Daca toate campurile unui rand sunt goale.
 * @param {object} rand
 * @returns {boolean}
 */
function isRandGol(rand) {
  return COLOANE.every(({ camp }) => String(rand[camp]).trim() === '');
}

// Un rand gol inseamna „fara regula”, deci devine `null` si nu se valideaza.
const schemaRand = z.preprocess(
  (valori) => (isRandGol(valori) ? null : valori),
  schemaRegula.nullable(),
);

const schema = z.object(
  Object.fromEntries(
    Object.keys(CATEGORII).map((categorie) => [categorie, schemaRand]),
  ),
);

/**
 * Valorile formularului pentru regulile primite de la API: cate un rand pe
 * categorie, gol cand categoria nu are regula.
 * @param {object[]} reguli
 * @returns {object}
 */
function getRanduri(reguli) {
  const randuri = Object.keys(CATEGORII).map((categorie) => [
    categorie,
    reguli.find((regula) => regula.categorie_utilizator === categorie) ??
      RAND_GOL,
  ]);
  return Object.fromEntries(randuri);
}

/**
 * Lista de reguli trimisa la API, din randurile validate.
 * @param {object} randuri
 * @returns {object[]}
 */
function getReguli(randuri) {
  return Object.entries(randuri)
    .filter(([, valori]) => valori !== null)
    .map(([categorie, valori]) => ({
      categorie_utilizator: categorie,
      ...valori,
    }));
}

/**
 * Celula unui camp din tabel, cu mesajul de eroare sub el. Campul e de tip
 * text: intr-unul de tip number, o valoare gresita s-ar citi ca goala si
 * randul ar parea fara regula.
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.eticheta Numele accesibil al campului.
 * @param {{message: string}} [props.eroare]
 * @param {object} props.inregistrare Rezultatul lui `register`.
 */
function CelulaRegula({ id, eticheta, eroare, inregistrare }) {
  return (
    <td className="px-0.5 py-1 align-top">
      <label htmlFor={id} className="sr-only">
        {eticheta}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className="camp"
        aria-invalid={eroare ? 'true' : 'false'}
        aria-describedby={eroare ? `${id}-eroare` : undefined}
        {...inregistrare}
      />
      {eroare && (
        <span id={`${id}-eroare`} className="block pt-1 text-xs text-red-700">
          {eroare.message}
        </span>
      )}
    </td>
  );
}

/**
 * Tabelul cu regulile de acces ale unei facilitati, cate un rand pe categorie.
 * @param {object} props
 * @param {number | string} props.idFacilitate
 * @param {object[]} props.reguli Regulile salvate pe server.
 */
export default function ReguliAccesForm({ idFacilitate, reguli }) {
  const salvare = useUpdateReguliAcces(idFacilitate);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    // Dupa salvare, tabelul arata regulile intoarse de server.
    values: getRanduri(reguli),
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Rezultatul trimiterii anterioare dispare la orice trimitere noua,
        // si cand formularul nu trece de validare.
        salvare.reset();
        handleSubmit((randuri) => salvare.mutate(getReguli(randuri)))(event);
      }}
      className="flex flex-col gap-4"
    >
      {salvare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(salvare.error)}
        </StatusMessage>
      )}
      {salvare.isSuccess && (
        <StatusMessage varianta="succes">
          Regulile au fost salvate.
        </StatusMessage>
      )}
      <fieldset disabled={salvare.isPending} className="flex flex-col gap-4">
        <table aria-labelledby="reguli-acces" className="w-full table-fixed">
          <thead>
            <tr>
              <th scope="col" className={`${ANTET} w-[30%]`}>
                Categorie
              </th>
              {COLOANE.map(({ camp, label }) => (
                <th key={camp} scope="col" className={ANTET}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(CATEGORII).map(([categorie, denumire]) => (
              <tr key={categorie}>
                <th
                  scope="row"
                  className="px-0.5 pt-3 text-left align-top text-xs font-medium text-ink sm:text-sm"
                >
                  {denumire}
                </th>
                {COLOANE.map(({ camp, label }) => (
                  <CelulaRegula
                    key={camp}
                    id={`${categorie}-${camp}`}
                    eticheta={`${denumire}: ${label}`}
                    eroare={errors[categorie]?.[camp]}
                    inregistrare={register(`${categorie}.${camp}`)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primar">
            {salvare.isPending ? 'Se salvează…' : 'Salvează regulile'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
