import FacilitatiList from './FacilitatiList.jsx';

/**
 * Lista publica a facilitatilor, doar pentru citire, deschisa si pentru Guest.
 * Fiecare facilitate duce la pagina ei de detalii.
 */
export default function FacilitatiPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-normal text-heading">Facilități</h1>
        <p className="text-sm text-muted">
          Terenurile și sălile care pot fi rezervate de studenți.
        </p>
      </header>
      <FacilitatiList
        mesajGol="Nu există încă nicio facilitate."
        getAdresa={(facilitate) => `/facilitati/${facilitate.id_facilitate}`}
      />
    </section>
  );
}
