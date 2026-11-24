import { useState } from 'react';

import { getErrorMessage } from '../../api/httpClient.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useUpdateStareSlot } from '../../hooks/useSloturi.js';
import { formatOra } from '../../utils/oraRomania.js';
import CalendarSloturi from '../Facilitati/CalendarSloturi.jsx';

/**
 * Sectiunea de mentenanta, pe pagina de administrare a facilitatii:
 * calendarul cu „Blochează” sau „Deblochează” pe fiecare slot.
 * @param {object} props
 * @param {object} props.facilitate
 */
export default function MentenantaSloturi({ facilitate }) {
  const schimbare = useUpdateStareSlot();
  const [slotDeBlocat, setSlotDeBlocat] = useState(null);

  const handleSchimbaStarea = (slot, stare) => {
    schimbare.mutate(
      { idSlot: slot.id_slot, stare },
      { onSettled: () => setSlotDeBlocat(null) },
    );
  };

  // Deblocarea nu anuleaza nimic, deci nu cere confirmare.
  const handleActiune = (slot) => {
    schimbare.reset();
    if (slot.stare === 'Mentenanta') {
      handleSchimbaStarea(slot, 'Liber');
    } else {
      setSlotDeBlocat(slot);
    }
  };

  const renderActiune = (slot) => {
    const interval = `${formatOra(slot.ora_inceput)} – ${formatOra(slot.ora_sfarsit)}`;
    const actiune = slot.stare === 'Mentenanta' ? 'Deblochează' : 'Blochează';
    return (
      <button
        type="button"
        className="btn btn-secundar"
        aria-label={`${actiune} ${interval}`}
        disabled={schimbare.isPending}
        onClick={() => handleActiune(slot)}
      >
        {actiune}
      </button>
    );
  };

  return (
    <section
      aria-labelledby="mentenanta-sloturi"
      className="flex flex-col gap-4 card p-5"
    >
      <h2 id="mentenanta-sloturi" className="text-lg font-semibold text-ink">
        Mentenanță
      </h2>
      {schimbare.isError && (
        <StatusMessage varianta="eroare">
          {getErrorMessage(schimbare.error)}
        </StatusMessage>
      )}
      <CalendarSloturi facilitate={facilitate} renderActiune={renderActiune} />
      {slotDeBlocat && (
        <ConfirmDialog
          titlu="Blochezi slotul?"
          mesaj="Rezervările active ale slotului vor fi anulate."
          isPending={schimbare.isPending}
          textConfirmare="Blochează"
          textInCurs="Se blochează…"
          onConfirm={() => handleSchimbaStarea(slotDeBlocat, 'Mentenanta')}
          onCancel={() => setSlotDeBlocat(null)}
        />
      )}
    </section>
  );
}
