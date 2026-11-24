// EventSource fals pentru teste: jsdom nu are unul. Testul emite prin el
// evenimentele pe care le-ar trimite serverul la GET /evenimente.

let conexiuni = [];

/**
 * Inlocuitorul lui EventSource, pus global din setup.js.
 */
export class EventSourceFals extends EventTarget {
  /**
   * @param {string} url
   */
  constructor(url) {
    super();
    this.url = url;
    conexiuni.push(this);
  }

  /**
   * Inchide conexiunea; nu mai primeste evenimente.
   */
  close() {
    conexiuni = conexiuni.filter((conexiune) => conexiune !== this);
  }
}

/**
 * @returns {string[]} Adresele conexiunilor deschise acum.
 */
export function getConexiuniDeschise() {
  return conexiuni.map(({ url }) => url);
}

/**
 * Trimite `slot-actualizat` pe toate conexiunile deschise, ca serverul.
 * @param {object} date `id_slot`, `id_facilitate`, `stare`, `locuri_libere`.
 */
export function emiteSlotActualizat(date) {
  conexiuni.forEach((conexiune) =>
    conexiune.dispatchEvent(
      new MessageEvent('slot-actualizat', { data: JSON.stringify(date) }),
    ),
  );
}

/**
 * Anunta ca browserul a stabilit (sau a refacut) conexiunea.
 */
export function stabilesteConexiunea() {
  conexiuni.forEach((conexiune) => conexiune.dispatchEvent(new Event('open')));
}

/**
 * Uita conexiunile ramase deschise dupa un test.
 */
export function reseteazaConexiunile() {
  conexiuni = [];
}
