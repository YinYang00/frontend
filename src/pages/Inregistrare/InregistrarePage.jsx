import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useInregistrare } from '../../hooks/useAuth.js';
import { zodResolver } from '../../utils/zodResolver.js';

// Aceleasi limite ca validarea din backend (YT-41); domeniul e cerut de MVP.
const schema = z.object({
  nume: z
    .string()
    .trim()
    .min(1, 'Numele este obligatoriu.')
    .max(100, 'Numele are maximum 100 de caractere.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(150, 'E-mailul are maximum 150 de caractere.')
    .regex(
      /^[^\s@]+@(student\.)?usv\.ro$/,
      'Folosește adresa @student.usv.ro sau @usv.ro.',
    ),
  parola: z.string().min(8, 'Parola are minimum 8 caractere.'),
});

const CAMPURI = [
  { name: 'nume', label: 'Nume', autoComplete: 'name' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
  {
    name: 'parola',
    label: 'Parolă',
    type: 'password',
    autoComplete: 'new-password',
  },
];

/**
 * Pagina de creare a unui cont. Dupa succes trimite utilizatorul la
 * /autentificare, cu e-mailul in starea rutei.
 */
export default function InregistrarePage() {
  const navigate = useNavigate();
  const inregistrare = useInregistrare();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nume: '', email: '', parola: '' },
  });

  const onSubmit = (date) =>
    inregistrare.mutate(date, {
      onSuccess: () =>
        navigate('/autentificare', { state: { email: date.email } }),
    });

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Creează cont</h1>
      {inregistrare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(inregistrare.error)}
        </StatusMessage>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-label="Înregistrare"
      >
        {CAMPURI.map(({ name, label, type = 'text', autoComplete }) => (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-medium text-ink">
              {label}
            </label>
            <input
              id={name}
              type={type}
              autoComplete={autoComplete}
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
        <button
          type="submit"
          className="btn btn-primar"
          disabled={inregistrare.isPending}
        >
          {inregistrare.isPending ? 'Se creează contul…' : 'Creează cont'}
        </button>
      </form>
    </section>
  );
}
