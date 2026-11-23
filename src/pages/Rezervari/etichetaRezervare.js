// Etichetele rezervarilor, comune listei si paginii de detalii.

// Starile memorate, asa cum se afiseaza (GLOSSARY.md, Stare a rezervarii).
const STARI = {
  Confirmata: 'Confirmată',
  PrezentaConfirmata: 'Prezență confirmată',
  Anulata: 'Anulată',
  Neonorata: 'Neonorată',
};

const STARI_ACTIVE = ['Confirmata', 'PrezentaConfirmata'];

/**
 * Daca rezervarea e activa si slotul ei nu s-a terminat.
 * @param {object} rezervare
 * @param {number} acum Momentul de acum, in milisecunde.
 * @returns {boolean}
 */
export function isViitoare(rezervare, acum) {
  return (
    STARI_ACTIVE.includes(rezervare.stare_rezervare) &&
    acum < Date.parse(rezervare.slot.ora_sfarsit)
  );
}

/**
 * Eticheta unei rezervari. La o rezervare activa, "In desfasurare" si
 * "Finalizata" se deduc din ora slotului; nu sunt stari.
 * @param {object} rezervare
 * @param {number} acum Momentul de acum, in milisecunde.
 * @returns {string}
 */
export function getEticheta(rezervare, acum) {
  const { stare_rezervare: stare, slot } = rezervare;
  if (!STARI_ACTIVE.includes(stare)) {
    return STARI[stare];
  }
  if (!isViitoare(rezervare, acum)) {
    return 'Finalizată';
  }
  return acum >= Date.parse(slot.ora_inceput) ? 'În desfășurare' : STARI[stare];
}
