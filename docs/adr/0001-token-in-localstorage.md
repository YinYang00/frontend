# Tokenul de autentificare se păstrează în `localStorage`

Tokenul JWT primit la autentificare (`POST /auth/login`) se păstrează în `localStorage`, iar clientul HTTP comun îl pune în antetul `Authorization: Bearer <token>` la fiecare cerere. Majoritatea utilizatorilor rezervă de pe telefon, chiar de la facilitate, deci trebuie să rămână autentificați când redeschid aplicația, în limita celor 24 de ore ale tokenului. Nu există refresh token: după expirare, primul `401` șterge tokenul și trimite utilizatorul la `/autentificare`, cu pagina de întoarcere. La deconectare se șterg tokenul și cache-ul TanStack Query.

## Considered Options

- **Cookie `httpOnly` setat de server**: tokenul nu ar putea fi citit din JavaScript, dar backend-ul ar avea nevoie de cookie-uri, CORS cu `credentials` și protecție CSRF, care nu sunt în contractul API al MVP-ului.
- **Tokenul doar în memorie (starea React)**: se pierde la fiecare reîncărcare a paginii sau redeschidere a aplicației, deci utilizatorul și-ar scrie parola la fiecare rezervare.
- **`sessionStorage`**: se pierde la închiderea tab-ului, ceea ce pe telefon înseamnă aproape la fiecare folosire.

## Consequences

Un script străin rulat în pagină (XSS) ar putea citi tokenul. Riscul se ține mic: interfața nu folosește `dangerouslySetInnerHTML`, React escapează textul afișat, iar tokenul expiră după 24 de ore. Dacă apare un refresh token sau un cookie `httpOnly` în backend, decizia se revizuiește într-un ADR nou.
