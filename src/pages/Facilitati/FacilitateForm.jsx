import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Leaga o schema Zod de React Hook Form: intoarce datele validate sau prima
 * eroare pentru fiecare camp. Inlocuieste pachetul `@hookform/resolvers`, ale
 * carui dependente optionale fac package-lock.json invalid pentru npm ci.
 * @param {z.ZodType} zodSchema
 * @returns {import('react-hook-form').Resolver}
 */
function zodResolver(zodSchema) {
  return (values) => {
    const result = zodSchema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors = {};
    for (const issue of result.error.issues) {
      const [camp] = issue.path;
      errors[camp] ??= { type: issue.code, message: issue.message };
    }
    return { values: {}, errors };
  };
}

// Aceleasi limite ca tabela facilitate si validarea din backend.
const schema = z.object({
  denumire: z
    .string()
    .trim()
    .min(1, 'Denumirea este obligatorie.')
    .max(100, 'Denumirea are maximum 100 de caractere.'),
  tip: z
    .string()
    .trim()
    .min(1, 'Tipul este obligatoriu.')
    .max(50, 'Tipul are maximum 50 de caractere.'),
  capacitate_maxima: z.coerce
    .number({ error: 'Capacitatea trebuie să fie un număr.' })
    .int('Capacitatea trebuie să fie un număr întreg.')
    .min(1, 'Capacitatea trebuie să fie cel puțin 1.'),
  locatie: z
    .string()
    .trim()
    .min(1, 'Locația este obligatorie.')
    .max(150, 'Locația are maximum 150 de caractere.'),
});

const CAMPURI = [
  { name: 'denumire', label: 'Denumire', placeholder: 'Teren tenis' },
  { name: 'tip', label: 'Tip', placeholder: 'Tenis' },
  { name: 'capacitate_maxima', label: 'Capacitate maximă', type: 'number' },
  { name: 'locatie', label: 'Locație', placeholder: 'Complex sportiv' },
];

const VALORI_GOALE = {
  denumire: '',
  tip: '',
  capacitate_maxima: '',
  locatie: '',
};

/**
 * Formularul de adaugare si editare a unei facilitati.
 * @param {object} props
 * @param {object} [props.facilitate] Facilitatea editata; lipseste la adaugare.
 * @param {boolean} props.isSaving True cat timp cererea este in curs.
 * @param {(date: object) => void} props.onSubmit Primeste datele validate.
 * @param {() => void} props.onCancel
 */
export default function FacilitateForm({
  facilitate,
  isSaving,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: facilitate ?? VALORI_GOALE,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2"
      aria-label={facilitate ? 'Editează facilitatea' : 'Adaugă facilitate'}
    >
      {CAMPURI.map(({ name, label, type = 'text', placeholder }) => (
        <div key={name} className="flex flex-col gap-1">
          <label htmlFor={name} className="text-sm font-medium text-ink">
            {label}
          </label>
          <input
            id={name}
            type={type}
            min={type === 'number' ? 1 : undefined}
            placeholder={placeholder}
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
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn btn-secundar" onClick={onCancel}>
          Renunță
        </button>
        <button type="submit" className="btn btn-primar" disabled={isSaving}>
          {isSaving ? 'Se salvează…' : 'Salvează'}
        </button>
      </div>
    </form>
  );
}
