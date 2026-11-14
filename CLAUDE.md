# CLAUDE.md – Frontend

Interfața web a aplicației **Campus Sports Booking** (USV): React 19 + Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form și Zod. Aplicația este gândită mobile-first. Datele vin doar de la [`YinYang00/backend`](https://github.com/YinYang00/backend) (`http://localhost:3000/api/v1`); nu se folosesc date mock în aplicație.

## Început de sesiune

Înainte de prima sarcină din sesiune, verifică pregătirea: skill-urile `tdd` și `code-review` (plugin-ul `mattpocock-skills`) apar în lista ta de skill-uri, uneltele Atlassian (`searchJiraIssuesUsingJql`) sunt disponibile și există `node_modules/`. Dacă lipsește oricare, citește `docs/agents/setup.md` și ghidează colegul prin pașii lipsă înainte de orice altă muncă.

Apoi află tichetul Jira la care lucrează colegul, din numele branch-ului curent (`YT-<nr>-...`) sau întrebându-l. Pe `main` se lucrează doar după ce există tichetul și branch-ul lui, conform [CONTRIBUTING.md](CONTRIBUTING.md).

## Comenzi

```bash
npm run dev            # interfata pe http://localhost:5173
npm run lint           # ESLint, fara warning-uri
npm run format:check   # Prettier
npm test               # Vitest + React Testing Library
npm run build          # build de productie
```

## Reguli

- Codul respectă [CODING_STYLE.md](CODING_STYLE.md): componente React ca funcții, denumiri de domeniu în română, `snake_case` pentru câmpurile venite din API, accesibilitate verificată de `jsx-a11y`.
- Fluxul Git este în [CONTRIBUTING.md](CONTRIBUTING.md). Pe scurt:
  - orice modificare pornește de la un tichet Jira din proiectul YT;
  - branch `YT-<nr>-<titlu-tichet>`, commit-uri `YT-<nr>: <descriere la imperativ>`;
  - nu se face niciodată push pe `main`: totul intră prin PR, completat după `.github/pull_request_template.md`.
- Un branch conține doar ce cere tichetul. Orice altceva descoperit pe parcurs devine tichet nou, pe care îl propui utilizatorului.
- Contractul API este definit în Confluence (vezi `docs/agents/domain.md`). Dacă interfața are nevoie de o rută care nu există, aceea este un tichet de backend, nu un workaround în frontend.

## Testare

Testele se scriu cu skill-ul **`/tdd`** (mattpocock-skills): un test care eșuează, apoi codul minim care îl face să treacă, câte o felie verticală pe rând. Pentru frontend, interfața publică testată este ce vede și face utilizatorul: componenta randată cu React Testing Library, căutată după rol și text, și acționată cu `user-event`. Nu se testează starea internă sau hook-urile separat de componentă. Apelurile HTTP se înlocuiesc la granița `src/api/`, nu în interiorul componentelor. Testele stau lângă fișierul testat (`<Fisier>.test.jsx`).

## Fluxul de lucru cu skill-uri

Skill-urile marcate „colegul” pornesc doar când colegul tastează comanda; când una dintre ele se potrivește, spune-i comanda exactă de tastat. Pe celelalte le folosești singur când situația o cere.

| Situația                                            | Skill                                                                  | Cine îl pornește |
| --------------------------------------------------- | ---------------------------------------------------------------------- | ---------------- |
| Colegul nu știe ce skill sau ce pas urmează         | `/ask-matt`                                                            | colegul          |
| Un tichet sau o funcționalitate nouă e încă neclară | `/grill-with-docs` (scrie și `GLOSSARY.md` și ADR-urile)               | colegul          |
| Discuția trebuie transformată în tichete Jira       | `/to-spec`, apoi `/to-tickets`                                         | colegul          |
| Implementarea unui tichet, pe branch-ul lui         | `/implement YT-<nr>` (folosește `tdd`, apoi `code-review`)             | colegul          |
| Cod nou sau bug reparat test-first                  | `tdd`                                                                  | Claude           |
| Ceva e stricat, aruncă erori sau e lent             | `diagnosing-bugs`                                                      | Claude           |
| O idee de interfață sau de logică trebuie încercată | `prototype`                                                            | Claude           |
| Înainte de PR                                       | `code-review`, față de `main`                                          | Claude           |
| Descrierea PR-ului                                  | șablonul `.github/pull_request_template.md`; `pr` doar pentru conținut | Claude           |
| Sesiunea e lungă și munca trece în altă sesiune     | `/handoff`                                                             | colegul          |

## Agent skills

### Issue tracker

Tichetele stau în Jira, proiectul YT (`yinyang.atlassian.net`), folosit prin conectorul Atlassian. See `docs/agents/issue-tracker.md`.

### Triage labels

Cele cinci etichete canonice (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), ca etichete Jira. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` și `docs/adr/` în rădăcina repository-ului, plus documentația din Confluence. See `docs/agents/domain.md`.

### Pregătirea mediului

Plugin-uri, conectori și comenzi de instalare pentru un coleg nou. See `docs/agents/setup.md`.
