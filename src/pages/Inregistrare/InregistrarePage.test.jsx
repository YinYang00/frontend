import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerUtilizator } from '../../api/authApi.js';

import InregistrarePage from './InregistrarePage.jsx';

vi.mock('../../api/authApi.js', () => ({ registerUtilizator: vi.fn() }));

/**
 * Inlocuieste pagina /autentificare (YT-56): arata e-mailul primit.
 */
function AutentificareStub() {
  const { state } = useLocation();
  return <p>Autentificare pentru {state?.email}</p>;
}

/**
 * Randeaza pagina pe /inregistrare, cu un QueryClient nou.
 */
function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/inregistrare']}>
        <Routes>
          <Route path="/inregistrare" element={<InregistrarePage />} />
          <Route path="/autentificare" element={<AutentificareStub />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

/**
 * Completeaza formularul si apasa butonul de trimitere.
 * @param {import('@testing-library/user-event').UserEvent} user
 * @param {{nume?: string, email?: string, parola?: string}} date
 */
async function completeaza(user, { nume, email, parola }) {
  if (nume) await user.type(screen.getByLabelText('Nume'), nume);
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (parola) await user.type(screen.getByLabelText('Parolă'), parola);
  await user.click(screen.getByRole('button', { name: 'Creează cont' }));
}

const DATE_VALIDE = {
  nume: 'Ana Pop',
  email: 'ana.pop@student.usv.ro',
  parola: 'parola123',
};

describe('InregistrarePage', () => {
  beforeEach(() => {
    vi.mocked(registerUtilizator).mockReset();
  });

  it('arata erorile langa campuri si nu trimite cererea', async () => {
    const user = renderPage();

    await completeaza(user, { email: 'ana@gmail.com', parola: 'scurta' });

    expect(
      await screen.findByText('Numele este obligatoriu.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Folosește adresa @student.usv.ro sau @usv.ro.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Parola are minimum 8 caractere.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(registerUtilizator).not.toHaveBeenCalled();
  });

  it('trimite datele si duce la /autentificare cu e-mailul completat', async () => {
    vi.mocked(registerUtilizator).mockResolvedValue({ id_utilizator: 1 });
    const user = renderPage();

    await completeaza(user, { ...DATE_VALIDE, email: ' Ana.Pop@usv.ro ' });

    expect(
      await screen.findByText('Autentificare pentru ana.pop@usv.ro'),
    ).toBeInTheDocument();
    expect(vi.mocked(registerUtilizator).mock.calls[0][0]).toEqual({
      ...DATE_VALIDE,
      email: 'ana.pop@usv.ro',
    });
  });

  it('dezactiveaza butonul cat cererea e in curs', async () => {
    vi.mocked(registerUtilizator).mockReturnValue(new Promise(() => {}));
    const user = renderPage();

    await completeaza(user, DATE_VALIDE);

    expect(
      await screen.findByRole('button', { name: 'Se creează contul…' }),
    ).toBeDisabled();
  });

  it.each([400, 409])('arata mesajul serverului la %i', async (status) => {
    vi.mocked(registerUtilizator).mockRejectedValue({
      response: {
        status,
        data: { cod: 'EROARE', mesaj: 'Exista deja un cont cu acest e-mail.' },
      },
    });
    const user = renderPage();

    await completeaza(user, DATE_VALIDE);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Exista deja un cont cu acest e-mail.',
    );
  });
});
