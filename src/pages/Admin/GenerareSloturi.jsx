import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useCreateSloturi } from '../../hooks/useSloturi.js';
import { getAziRomania } from '../../utils/oraRomania.js';
import { zodResolver } from '../../utils/zodResolver.js';

const MESAJ_ORA = 'Alege o oră.';
const MESAJ_DURATA = 'Durata trebuie să fie un număr întreg pozitiv de minute.';

// Aceleasi reguli ca validarea din backend; ziua din trecut si durata mai
// mare decat programul le verifica serverul. Orele `HH:MM` se compara corect
// ca siruri.
const schema = z
  .object({
    data: z.string().min(1, 'Alege o zi.'),
    ora_inceput: z.string().min(1, MESAJ_ORA),
    ora_sfarsit: z.string().min(1, MESAJ_ORA),
    durata_minute: z.coerce
      .number({ error: 'Durata trebuie să fie un număr.' })
      .int(MESAJ_DURATA)
      .min(1, MESAJ_DURATA),
  })
  .refine((program) => program.ora_sfarsit > program.ora_inceput, {
    path: ['ora_sfarsit'],
    message: 'Ora de sfârșit trebuie să fie după ora de început.',
  });

const CAMPURI = [
  { name: 'data', label: 'Data', type: 'date' },
  { name: 'ora_inceput', label: 'Ora de început', type: 'time' },
  { name: 'ora_sfarsit', label: 'Ora de sfârșit', type: 'time' },
  { name: 'durata_minute', label: 'Durata unui slot (minute)', type: 'number' },
];

/**
 * Sectiunea de generare a sloturilor unei zile, pe pagina de administrare a
 * facilitatii.
 * @param {object} props
 * @param {number | string} props.idFacilitate
 */
export default function GenerareSloturi({ idFacilitate }) {
  const generare = useCreateSloturi(idFacilitate);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      data: getAziRomania(),
      ora_inceput: '08:00',
      ora_sfarsit: '20:00',
      durata_minute: '60',
    },
  });

  return (
    <section
      aria-labelledby="generare-sloturi"
      className="flex flex-col gap-4 card p-5"
    >
      <h2 id="generare-sloturi" className="text-lg font-semibold text-ink">
        Generare sloturi
      </h2>
      {generare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(generare.error)}
        </StatusMessage>
      )}
      {generare.isSuccess && (
        <StatusMessage varianta="succes">
          {generare.data.length} sloturi create
        </StatusMessage>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          // Rezultatul trimiterii anterioare dispare la orice trimitere noua,
          // si cand formularul nu trece de validare.
          generare.reset();
          handleSubmit((program) => generare.mutate(program))(event);
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {CAMPURI.map(({ name, label, type }) => (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-medium text-ink">
              {label}
            </label>
            <input
              id={name}
              type={type}
              min={type === 'number' ? 1 : undefined}
              className="camp"
              aria-invalid={errors[name] ? 'true' : 'false'}
              aria-describedby={errors[name] ? `${name}-eroare` : undefined}
              {...register(name)}
            />
            {errors[name] && (
              <span id={`${name}-eroare`} className="text-sm text-red-700">
                {errors[name].message}
              </span>
            )}
          </div>
        ))}
        <div className="flex justify-end sm:col-span-2">
          <button
            type="submit"
            className="btn btn-primar"
            disabled={generare.isPending}
          >
            {generare.isPending ? 'Se generează…' : 'Generează sloturi'}
          </button>
        </div>
      </form>
    </section>
  );
}
