import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useAutentificare } from '../../hooks/useAuth.js';
import { zodResolver } from '../../utils/zodResolver.js';

// Doar formatul adresei: daca e-mailul nu are cont, raspunsul serverului e
// acelasi ca la parola gresita.
const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'E-mailul este obligatoriu.')
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Adresa de e-mail nu are un format valid.',
    ),
  parola: z.string().min(1, 'Parola este obligatorie.'),
});

const CAMPURI = [
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
  {
    name: 'parola',
    label: 'Parolă',
    type: 'password',
    autoComplete: 'current-password',
  },
];

/**
 * Pagina de autentificare. Dupa succes intoarce utilizatorul pe pagina de la
 * care a fost trimis aici (`state.dela`), altfel pe pagina principala.
 * E-mailul vine completat dupa inregistrare (`state.email`).
 */
export default function AutentificarePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const autentificare = useAutentificare();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: state?.email ?? '', parola: '' },
  });

  const onSubmit = (date) =>
    autentificare.mutate(date, {
      onSuccess: () => navigate(state?.dela ?? '/', { replace: true }),
    });

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Autentificare</h1>
      {autentificare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(autentificare.error)}
        </StatusMessage>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-label="Autentificare"
      >
        {CAMPURI.map(({ name, label, type, autoComplete }) => (
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
          disabled={autentificare.isPending}
        >
          {autentificare.isPending ? 'Se verifică…' : 'Autentifică-te'}
        </button>
      </form>
      <p className="text-sm text-muted">
        Nu ai cont?{' '}
        <Link to="/inregistrare" className="text-usv hover:underline">
          Creează cont
        </Link>
      </p>
    </section>
  );
}
