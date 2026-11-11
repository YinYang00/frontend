# Coding style – Frontend

Acest document definește convențiile de scriere a codului pentru frontend-ul aplicației **Campus Sports Booking** (React + Vite + Tailwind CSS, cu React Router, Axios, TanStack Query, React Hook Form și Zod). Regulile sunt obligatorii pentru tot codul din acest repository și sunt verificate automat (vezi [secțiunea 8](#8-cum-sunt-impuse-regulile)).

## 1. Ghidurile de bază

- **[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)**, pentru JavaScript în general, la fel ca în backend.
- **[Rules of React](https://react.dev/reference/rules)** și **[Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)** din documentația oficială React, pentru componente și hook-uri.
- **[WAI-ARIA / jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)**, pentru accesibilitatea interfeței.

Unde ghidurile și acest document diferă, are prioritate acest document. Diferențele față de Google JS Style Guide sunt aceleași ca în backend: doar ES modules, câmpuri `snake_case` pentru datele primite de la API (`id_facilitate`) și JSDoc obligatoriu doar pentru ce este exportat.

## 2. Formatare

Formatarea este făcută **automat de Prettier** ([`.prettierrc.json`](.prettierrc.json)), cu aceleași valori ca în backend:

| Regulă                   | Valoare                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| Indentare                | 2 spații, fără tab-uri                                                       |
| Lungimea maximă a liniei | 80 de caractere                                                              |
| Ghilimele                | simple în JavaScript (`'text'`), duble în atributele JSX (`className="..."`) |
| Punct și virgulă         | obligatoriu                                                                  |
| Virgulă finală           | da, în liste, obiecte și parametri pe mai multe rânduri                      |
| JSX pe mai multe rânduri | între paranteze, câte un atribut pe rând când nu încap pe o linie            |
| Sfârșit de linie         | LF; fișierul se termină cu o linie goală                                     |

```jsx
// Corect
return (
  <button type="button" className="btn-secundar" onClick={onCancel}>
    Renunta
  </button>
);

// Gresit
return (
  <button type="button" className={'btn-secundar'} onClick={onCancel}>
    Renunta
  </button>
);
```

## 3. Reguli de cod

### 3.1 Declarații și variabile

- `const` implicit, `let` doar când variabila se reatribuie. `var` este interzis.
- O singură variabilă per declarație. Variabilele și importurile nefolosite sunt interzise.
- Ordinea importurilor: pachete npm, apoi fișiere locale, apoi stiluri.

### 3.2 Denumiri

| Element                         | Convenție                                                    | Exemplu                                       |
| ------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Componente și fișierele lor     | `PascalCase.jsx`                                             | `FacilitateForm.jsx`, `FacilitatiPage.jsx`    |
| Foldere de pagini               | `PascalCase`, ca în structura din Confluence                 | `pages/Facilitati/`                           |
| Hook-uri                        | `use` + `PascalCase`, fișier `camelCase.js`                  | `useFacilitati()` în `hooks/useFacilitati.js` |
| Funcții și variabile            | `camelCase`                                                  | `getFacilitati`, `facilitateEditata`          |
| Fișiere care nu sunt componente | `camelCase.js`                                               | `facilitatiApi.js`, `httpClient.js`           |
| Constante globale               | `UPPER_SNAKE_CASE`                                           | `API_BASE_URL`, `QUERY_KEYS`                  |
| Props booleene                  | prefix `is`, `has`, `can`, `show`                            | `isOpen`, `isSaving`                          |
| Handler-e de eveniment          | `handle` + eveniment în componentă, `on` + eveniment ca prop | `handleSubmit`, `onSubmit`                    |
| Câmpuri primite de la API       | `snake_case`, exact ca în API                                | `facilitate.capacitate_maxima`                |

**Limba:** termenii din domeniu și textele afișate utilizatorului sunt în **română**. În cod (identificatori, comentarii) se scriu **fără diacritice**, iar textele din interfață se scriu **cu diacritice**. Verbele și termenii tehnici sunt în engleză (`get`, `create`, `handle`, `use`, `Page`, `Form`). Exemplu: `useCreateFacilitate`, `FacilitateForm`.

### 3.3 Expresii și control

- Comparații doar cu `===` și `!==`. Acoladele sunt obligatorii la `if`, `else`, `for` și `while`.
- Ieșire timpurie în loc de `else` după `return`. Ternarii nu se imbrică; în JSX, condițiile complexe se mută într-o variabilă sau într-o componentă separată.
- Șirurile compuse se scriu cu template literal, iar proprietățile prescurtat (`{ denumire }`).
- Codul asincron se scrie cu `async`/`await`.

### 3.4 Componente React

- **Doar componente funcție.** Componentele cu nume se declară cu `function NumeComponenta()`, nu cu `const NumeComponenta = () =>`.
- O componentă exportată per fișier. Fișierul unei componente exportă doar componente (regula `react-refresh/only-export-components`).
- Hook-urile se apelează doar la începutul componentei sau al altui hook, niciodată în condiții sau bucle (`react-hooks/rules-of-hooks`). Dependențele din `useEffect`, `useMemo` și `useCallback` sunt complete (`react-hooks/exhaustive-deps`).
- **Datele de la server** se citesc și se modifică doar prin hook-urile TanStack Query din `src/hooks/`. Componentele nu apelează direct Axios și nu folosesc `useEffect` + `fetch`.
- **Formularele** folosesc React Hook Form, iar regulile de validare sunt o schemă Zod definită lângă formular. Schema respectă aceleași limite ca backend-ul (de exemplu `denumire` are maximum 100 de caractere).
- Listele au `key` stabil, de obicei id-ul din baza de date. Indexul din listă nu se folosește ca `key`.
- Fragmentele inutile (`<></>` cu un singur copil) și atributele `={true}` sunt interzise. Componentele fără copii se închid singure (`<Spinner />`).
- **Stilizarea** se face cu clase Tailwind direct în JSX. Combinațiile de clase repetate (de exemplu butoanele) se definesc o singură dată în `src/styles/index.css` cu `@layer components`. Stilurile inline (`style={{...}}`) nu se folosesc.
- **Accesibilitate:** fiecare câmp de formular are `<label>` asociat, butoanele au `type` explicit, imaginile au `alt`, iar elementele clicabile sunt `<button>` sau `<a>`, nu `<div onClick>`.

### 3.5 Gestionarea erorilor

- Orice cerere către server are trei stări vizibile în interfață: **se încarcă**, **eroare** și **succes**. O eroare nu este niciodată ascunsă utilizatorului.
- Mesajul de eroare afișat este câmpul `mesaj` din răspunsul backend-ului (`{ cod, mesaj }`). Când serverul nu răspunde, se afișează un mesaj generic („Serverul nu răspunde..."). Conversia se face într-un singur loc, funcția `getErrorMessage` din `src/api/httpClient.js`.
- Acțiunile distructive (ștergerea) cer confirmare înainte de trimiterea cererii.
- Blocurile `catch` goale sunt interzise. `console.log` este interzis; se permit doar `console.warn` și `console.error`.
- Se aruncă doar obiecte `Error`.

### 3.6 Dimensiunea codului

| Limită                                                               | Valoare maximă |
| -------------------------------------------------------------------- | -------------- |
| Linii într-un fișier                                                 | 250            |
| Linii într-o funcție sau componentă (fără linii goale și comentarii) | 80             |
| Niveluri de imbricare                                                | 3              |
| Parametri ai unei funcții                                            | 4              |
| Complexitate ciclomatică                                             | 10             |

O componentă care depășește limitele se împarte în componente mai mici (de exemplu `FacilitatiTable` și `FacilitateRow`).

### 3.7 Comentarii

- Tot ce este exportat (componente, hook-uri, funcții) are un comentariu **JSDoc**. La componente se documentează props-urile:

  ```jsx
  /**
   * Formularul de adaugare si editare a unei facilitati.
   * @param {object} props
   * @param {object} [props.facilitate] Facilitatea editata; lipseste la adaugare.
   * @param {Function} props.onSubmit Primeste datele validate.
   */
  export default function FacilitateForm({ facilitate, onSubmit }) {
  ```

- Comentariile explică **de ce**, nu ce face codul. Codul comentat nu se commite. `TODO` se scrie cu cheia tichetului: `// TODO(YT-40): adauga paginare`.
- Comentariile sunt în română, fără diacritice.

## 4. Structura proiectului

Structura urmează pagina „Tehnologii frontend" din Confluence:

```
src/
  api/           clientul Axios (httpClient.js) si functiile pentru fiecare ruta din API
  components/    componente reutilizabile: butoane, dialoguri, mesaje
  hooks/         hook-uri TanStack Query (useFacilitati, useCreateFacilitate...)
  pages/
    Facilitati/  FacilitatiPage.jsx si componentele folosite doar de pagina
  styles/        index.css cu Tailwind si clasele comune
  test/          configurarea testelor
  App.jsx        rutele aplicatiei
  main.jsx       punctul de pornire
```

- Componentele din `pages/` pot folosi `components/` și `hooks/`. Componentele din `components/` nu cunosc paginile și nu apelează API-ul.
- Adresa backend-ului vine din variabila de mediu `VITE_API_URL` (`.env.local`, vezi `.env.example`), niciodată scrisă direct în componente.
- Nu se folosesc date mock în aplicație: toate datele vin de la backend-ul care rulează local.

## 5. Teste

- Testele stau lângă fișierul testat, cu numele `<Fisier>.test.jsx`, și folosesc Vitest și React Testing Library.
- Testele caută elementele așa cum le vede utilizatorul (`getByRole`, `getByLabelText`), nu după clase CSS.
- Formularele au teste pentru validare și trimitere.

## 6. Git și GitHub

Aceleași reguli ca în backend; detaliile sunt în [CONTRIBUTING.md](CONTRIBUTING.md): tichet Jira, branch `YT-<nr>-<titlu-tichet>`, commit `YT-<nr>: <descriere>`, PR cu o aprobare de la alt membru al echipei, Squash and Merge sau Rebase and Merge. Branch-ul conține doar codul tichetului.

## 7. Ce verifică fiecare unealtă

| Unealtă                                         | Configurație                                       | Reguli                                                                     |
| ----------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| Prettier                                        | [`.prettierrc.json`](.prettierrc.json)             | Toată secțiunea 2                                                          |
| ESLint – reguli de bază                         | [`eslint.config.js`](eslint.config.js)             | Secțiunile 3.1, 3.2, 3.3, 3.5, 3.6                                         |
| eslint-plugin-react, react-hooks, react-refresh | [`eslint.config.js`](eslint.config.js)             | Secțiunea 3.4: forma componentelor, regulile hook-urilor, `key`, fragmente |
| eslint-plugin-jsx-a11y                          | [`eslint.config.js`](eslint.config.js)             | Secțiunea 3.4: accesibilitate                                              |
| eslint-plugin-jsdoc                             | [`eslint.config.js`](eslint.config.js)             | Secțiunea 3.7                                                              |
| Code review                                     | [Șablonul de PR](.github/pull_request_template.md) | Structura (secțiunea 4), mesajele de eroare, PR-ul conține doar tichetul   |

## 8. Cum sunt impuse regulile

| Nivel        | Mecanism                                                                          | Ce verifică                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Editor       | `.editorconfig`, Prettier, ESLint                                                 | Erorile afișate direct în VS Code                                                                                                   |
| Commit local | Husky `pre-commit` → lint-staged                                                  | ESLint și Prettier pe fișierele modificate                                                                                          |
| Commit local | Husky `commit-msg` → [`scripts/check-commit-msg.js`](scripts/check-commit-msg.js) | Formatul `YT-<nr>: <descriere>`                                                                                                     |
| Push local   | Husky `pre-push` → [`scripts/check-branch-name.js`](scripts/check-branch-name.js) | Numele branch-ului, refuzul push-ului direct pe `main`, lint, format                                                                |
| GitHub       | Workflow-ul [`CI`](.github/workflows/ci.yml)                                      | `branch-name`, `pr-title`, `lint`, `test`, `build`, rulate la fiecare PR                                                            |
| GitHub       | Ruleset-ul [`protect-main.json`](.github/rulesets/protect-main.json)              | PR obligatoriu, o aprobare de la alt membru, conversații rezolvate, verificările CI trecute, doar Squash și Rebase, fără force-push |
| Echipă       | Șablonul de PR și code review                                                     | Regulile care nu pot fi verificate automat                                                                                          |

```bash
npm run lint          # ESLint, 0 avertismente permise
npm run format:check  # verifica formatarea
npm test              # testele Vitest
npm run build         # build-ul de productie
```
