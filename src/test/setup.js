// Adauga matcher-ele jest-dom (toBeInTheDocument etc.), pune EventSource-ul
// fals si curata DOM-ul dupa fiecare test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { EventSourceFals, reseteazaConexiunile } from './eventSourceFals.js';

globalThis.EventSource = EventSourceFals;

afterEach(() => {
  cleanup();
  reseteazaConexiunile();
});
