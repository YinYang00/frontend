import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FacilitateForm from './FacilitateForm.jsx';

/**
 * Randeaza formularul cu un onSubmit spionat.
 * @param {object} [facilitate]
 */
function renderForm(facilitate) {
  const onSubmit = vi.fn();
  render(
    <FacilitateForm
      facilitate={facilitate}
      isSaving={false}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe('FacilitateForm', () => {
  it('arata erorile de validare si nu trimite un formular gol', async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(
      await screen.findByText('Denumirea este obligatorie.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Denumire')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trimite datele validate, cu capacitatea ca numar', async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText('Denumire'), '  Teren tenis ');
    await user.type(screen.getByLabelText('Tip'), 'Tenis');
    await user.type(screen.getByLabelText('Capacitate maximă'), '2');
    await user.type(screen.getByLabelText('Locație'), 'Complex sportiv');
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      denumire: 'Teren tenis',
      tip: 'Tenis',
      capacitate_maxima: 2,
      locatie: 'Complex sportiv',
    });
  });

  it('respinge o capacitate mai mica decat 1', async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText('Capacitate maximă'), '0');
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(
      await screen.findByText('Capacitatea trebuie să fie cel puțin 1.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('completeaza campurile la editare', () => {
    renderForm({
      id_facilitate: 3,
      denumire: 'Sala fitness',
      tip: 'Fitness',
      capacitate_maxima: 20,
      locatie: 'Camin 3',
    });

    expect(screen.getByLabelText('Denumire')).toHaveValue('Sala fitness');
    expect(screen.getByLabelText('Capacitate maximă')).toHaveValue(20);
  });
});
