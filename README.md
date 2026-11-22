# Campus Sports Booking - Frontend

Interfața web a aplicației Campus Sports Booking (React + Vite + Tailwind CSS, cu React Router, Axios, TanStack Query, React Hook Form și Zod).

## Instalare

Cerințe: Node.js 20+ și [backend-ul](https://github.com/YinYang00/backend) pornit pe `http://localhost:3000`, după secțiunea „Instalare” din README-ul lui (Docker Desktop, `docker compose up -d`, `npm run setup`, `npm run dev`). Aplicația nu folosește date mock; toate datele vin de la backend.

```bash
git clone https://github.com/YinYang00/frontend.git
cd frontend
npm install   # dependentele si hook-urile git
npm run dev   # interfata pe http://localhost:5173
```

Deschide `http://localhost:5173`: pagina **Facilități** afișează facilitățile de demo din backend. Pentru build-ul de producție:

```bash
npm run build     # build de productie in dist/
npm run preview   # serveste dist/ pe http://localhost:5173
```

Backend-ul acceptă cereri doar de la `http://localhost:5173` (`CORS_ORIGIN` din `.env`-ul lui), de aceea atât `dev`, cât și `preview` pornesc pe acest port. Deschide aplicația la `localhost`, nu la `127.0.0.1`: pentru CORS sunt origini diferite. Dacă portul e ocupat (de exemplu `dev` și `preview` pornite în același timp), comanda se oprește cu eroare în loc să treacă pe alt port. Dacă backend-ul rulează pe altă adresă, copiază `.env.example` în `.env.local` și schimbă `VITE_API_URL`, apoi repornește `npm run dev` sau refă `npm run build`.

Utilizatorii de demo creați de `npm run setup` în backend:

| Utilizator    | E-mail                        | Parolă            |
| ------------- | ----------------------------- | ----------------- |
| Administrator | `admin.demo@usv.ro`           | `AdminDemo2026`   |
| Student       | `student.demo@student.usv.ro` | `StudentDemo2026` |

Utilizatorii de demo intră din butonul **Autentificare** din antet (`/autentificare`). Un utilizator nou se înregistrează din pagina **Înregistrare** (`/inregistrare`).

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
