const VARIANTE = {
  eroare: 'border-red-200 bg-red-50 text-red-800',
  succes: 'border-success/20 bg-success-soft text-success',
  info: 'border-line bg-white text-muted',
};

/**
 * Mesaj de stare afisat utilizatorului. Erorile sunt anuntate imediat de
 * cititoarele de ecran (role="alert"), restul politicos (role="status").
 * @param {object} props
 * @param {'eroare'|'succes'|'info'} props.varianta
 * @param {import('react').ReactNode} props.children
 */
export default function StatusMessage({ varianta, children }) {
  return (
    <p
      role={varianta === 'eroare' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANTE[varianta]}`}
    >
      {children}
    </p>
  );
}
