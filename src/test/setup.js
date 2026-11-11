// Adauga matcher-ele jest-dom (toBeInTheDocument etc.) si curata DOM-ul
// dupa fiecare test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
