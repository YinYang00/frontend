// Datele si orele se afiseaza mereu in ora Romaniei, oricare ar fi fusul orar
// al telefonului, ca in API (orele vin ca ISO 8601 cu offset).
const FUS_ORAR = 'Europe/Bucharest';
const LIMBA = 'ro-RO';
const ZILE_IN_BANDA = 14;

// Data de azi se citeste pe bucati (formatToParts), nu din textul formatat:
// ordinea si separatorii datei depind de datele de localizare ale browserului.
const FORMATTER_ZI_ROMANIA = new Intl.DateTimeFormat(LIMBA, {
  timeZone: FUS_ORAR,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Zilele din banda se socotesc ca date calendaristice, in UTC, unde nu exista
// schimbarea orei; doar ziua de pornire vine din ora Romaniei.
const FORMATTER_ZI_SAPTAMANII = new Intl.DateTimeFormat(LIMBA, {
  timeZone: 'UTC',
  weekday: 'short',
});
const FORMATTER_ZI_LUNA = new Intl.DateTimeFormat(LIMBA, {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

const FORMATTER_ORA = new Intl.DateTimeFormat(LIMBA, {
  timeZone: FUS_ORAR,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const FORMATTER_ZI_LUNGA = new Intl.DateTimeFormat(LIMBA, {
  timeZone: FUS_ORAR,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/**
 * Ziua unui moment din API, in ora Romaniei.
 * @param {string} moment ISO 8601.
 * @returns {string} De exemplu `marți, 24 noiembrie`.
 */
export function formatZi(moment) {
  return FORMATTER_ZI_LUNGA.format(new Date(moment));
}

/**
 * Ora unui moment din API, in ora Romaniei.
 * @param {string} moment ISO 8601, de exemplu `2026-11-20T08:00:00+02:00`.
 * @returns {string} De exemplu `08:00`.
 */
export function formatOra(moment) {
  return FORMATTER_ORA.format(new Date(moment));
}

/**
 * Ziua de azi si urmatoarele 13, in ora Romaniei.
 * @returns {{data: string, ziSaptamana: string, ziLuna: string}[]} `data`
 *   este `AAAA-LL-ZZ`; celelalte sunt textele afisate, de exemplu „dum.” si
 *   „25 oct.”.
 */
export function getZileBanda() {
  const parti = Object.fromEntries(
    FORMATTER_ZI_ROMANIA.formatToParts(new Date()).map(({ type, value }) => [
      type,
      Number(value),
    ]),
  );
  const { year: an, month: luna, day: zi } = parti;
  return Array.from({ length: ZILE_IN_BANDA }, (_, index) => {
    const moment = new Date(Date.UTC(an, luna - 1, zi + index));
    return {
      data: moment.toISOString().slice(0, 10),
      ziSaptamana: FORMATTER_ZI_SAPTAMANII.format(moment),
      ziLuna: FORMATTER_ZI_LUNA.format(moment),
    };
  });
}
