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

/**
 * Schema unui camp intreg obligatoriu intre 1 si `maxim`; acelasi mesaj pentru
 * orice valoare gresita. Se accepta doar cifre: `Number` ar citi si `1e1`.
 * @param {string} subiect Inceputul mesajului.
 * @param {number} maxim
 * @returns {z.ZodType}
 */
function schemaIntreg(subiect, maxim) {
  const mesaj = `${subiect} trebuie să fie un număr întreg între 1 și ${maxim}.`;
  return z
    .string()
    .trim()
    .regex(/^\d+$/, mesaj)
    .transform(Number)
    .pipe(z.number().min(1, mesaj).max(maxim, mesaj));
}

// Aceleasi limite ca validarea din backend; 168 sunt orele unei saptamani.
const schemaRegula = z.object({
  ore_maxim_saptamana: schemaIntreg('Orele', 168),
  zile_avans_maxim: schemaIntreg('Zilele', 30),
  prioritate: schemaIntreg('Prioritatea', 5),
});

/**
 * Daca toate campurile unui rand sunt goale.
 * @param {object} rand
 * @returns {boolean}
 */
function isRandGol(rand) {
  return COLOANE.every(({ camp }) => rand[camp].trim() === '');
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
  const randuri = Object.keys(CATEGORII).map((categorie) => {
    const regula = reguli.find(
      (alta) => alta.categorie_utilizator === categorie,
    );
    const valori = COLOANE.map(({ camp }) => [
      camp,
      String(regula?.[camp] ?? ''),
    ]);
    return [categorie, Object.fromEntries(valori)];
  });
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
 * Antetul tabelului: categoria si cate o coloana pentru fiecare limita.
 */
function AntetTabel() {
  return (
    <thead>
      <tr>
        {['Categorie', ...COLOANE.map(({ label }) => label)].map((antet) => (
          <th
            key={antet}
            scope="col"
            className="px-0.5 py-1 text-left align-bottom text-xs font-medium text-muted first:w-[30%]"
          >
            {antet}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * Celula unui camp din tabel, cu mesajul de eroare sub el. Campul e de tip
 * text: intr-unul de tip number, o valoare gresita s-ar citi ca goala si
 * randul ar parea fara regula.
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.eticheta Numele accesibil al campului.
 * @param {{message: string}} [props.eroare]
 * @param {object} props.registerProps Rezultatul lui `register`.
 */
function CelulaRegula({ id, eticheta, eroare, registerProps }) {
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
        {...registerProps}
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
 * @param {object[]} props.reguli Regulile de la deschiderea paginii.
 */
export default function ReguliAccesForm({ idFacilitate, reguli }) {
  const salvare = useUpdateReguliAcces(idFacilitate);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getRanduri(reguli),
  });

  const handleSalvare = handleSubmit((randuri) =>
    salvare.mutate(getReguli(randuri), {
      // Tabelul arata exact ce e salvat pe server.
      onSuccess: (salvate) => reset(getRanduri(salvate)),
    }),
  );

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Rezultatul trimiterii anterioare dispare la orice trimitere noua,
        // si cand formularul nu trece de validare.
        salvare.reset();
        handleSalvare(event);
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
        <table className="w-full table-fixed">
          <caption className="sr-only">Reguli de acces</caption>
          <AntetTabel />
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
                    registerProps={register(`${categorie}.${camp}`)}
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
