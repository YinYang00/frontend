import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { formatOra, formatZi } from '../../utils/oraRomania.js';

/**
 * Confirmarea anularii unei rezervari, comuna listei si paginii de detalii.
 * Dialogul se inchide oricum s-a terminat cererea; eroarea o arata pagina.
 * @param {object} props
 * @param {object} props.rezervare
 * @param {import('@tanstack/react-query').UseMutationResult} props.anulare
 *   Rezultatul lui useAnulareRezervare.
 * @param {() => void} props.onInchide
 */
export default function AnulareDialog({ rezervare, anulare, onInchide }) {
  const { facilitate, slot } = rezervare;
  return (
    <ConfirmDialog
      titlu="Anulezi rezervarea?"
      mesaj={`${facilitate.denumire}, ${formatZi(slot.ora_inceput)}, ${formatOra(slot.ora_inceput)}. Locul se eliberează pentru alți utilizatori.`}
      isPending={anulare.isPending}
      textConfirmare="Anulează"
      textInCurs="Se anulează…"
      onConfirm={() =>
        anulare.mutate(rezervare.id_rezervare, { onSettled: onInchide })
      }
      onCancel={onInchide}
    />
  );
}
