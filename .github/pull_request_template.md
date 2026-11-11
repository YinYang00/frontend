## Tichet Jira

YT-<numar>: <titlul tichetului>
https://yinyang.atlassian.net/browse/YT-<numar>

## Ce s-a modificat

-

## Cum se testeaza

1.

## Checklist autor

- [ ] Branch-ul se numeste `YT-<numar>-<titlu-tichet>` si porneste din `main` actualizat.
- [ ] PR-ul contine **doar** codul necesar acestui tichet. Orice alta modificare are tichet separat.
- [ ] Codul respecta [CODING_STYLE.md](../CODING_STYLE.md); `npm run lint` si `npm run format:check` trec local.
- [ ] Am adaugat sau actualizat testele; `npm test` si `npm run build` trec.
- [ ] Am verificat in browser, cu backend-ul pornit local (fara date mock).
- [ ] Am actualizat documentatia (README) daca s-a schimbat comportamentul.

## Checklist reviewer

- [ ] Modificarile corespund descrierii tichetului si nimic in plus.
- [ ] Denumirile, comentariile si tratarea erorilor respecta CODING_STYLE.md.
