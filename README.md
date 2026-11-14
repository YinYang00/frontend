# Campus Sports Booking - Frontend

Interfața web a aplicației Campus Sports Booking (React + Vite + Tailwind CSS, cu React Router, Axios, TanStack Query, React Hook Form și Zod).

## Pornire locală

Cerințe: Node.js 20+ și [backend-ul](../backend) pornit local pe `http://localhost:3000`. Aplicația nu folosește date mock; toate datele vin de la backend.

```bash
npm install   # instaleaza dependentele si activeaza hook-urile git
npm run dev   # porneste interfata pe http://localhost:5173
```

Dacă backend-ul rulează pe altă adresă, copiază `.env.example` în `.env.local` și schimbă `VITE_API_URL`.

## Ce conține

Pagina **Facilități** (`/facilitati`) are toate operațiile CRUD pentru entitatea `facilitate`:

- **Listare** – cardurile facilităților, citite cu `GET /api/v1/facilitati`.
- **Adăugare** – formularul „Adaugă facilitate", trimis cu `POST /api/v1/facilitati`.
- **Editare** – butonul „Editează" de pe card, trimis cu `PUT /api/v1/facilitati/:id_facilitate`.
- **Ștergere** – butonul „Șterge", cu confirmare, trimis cu `DELETE /api/v1/facilitati/:id_facilitate`.

După fiecare operație lista se reîncarcă de la server și apare un mesaj de confirmare. Erorile trimise de backend (de exemplu o denumire duplicată) sunt afișate în interfață.

## Comenzi

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Vitest + React Testing Library
npm run build         # build de productie in dist/
```

## Convenții

- [CODING_STYLE.md](CODING_STYLE.md) – coding style-ul frontend-ului și cum este impus.
- [CONTRIBUTING.md](CONTRIBUTING.md) – branch-uri, commit-uri, pull request-uri.
- [CLAUDE.md](CLAUDE.md) și [docs/agents/setup.md](docs/agents/setup.md) – lucrul cu Claude Code: plugin-ul `mattpocock-skills`, conectorul Atlassian și ce skill se folosește la fiecare pas. La prima sesiune, Claude verifică singur ce lipsește.
