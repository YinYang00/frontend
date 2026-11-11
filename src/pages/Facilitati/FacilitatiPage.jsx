import { useState } from 'react';

import { getErrorMessage } from '../../api/httpClient.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import {
  useCreateFacilitate,
  useDeleteFacilitate,
  useUpdateFacilitate,
} from '../../hooks/useFacilitati.js';

import FacilitateEditor from './FacilitateEditor.jsx';
import FacilitatiList from './FacilitatiList.jsx';

const FORMULAR_NOU = 'nou';

/**
 * Pagina de administrare a facilitatilor: listare, adaugare, editare si
 * stergere, cu datele reale de la backend.
 */
export default function FacilitatiPage() {
  // null = formular inchis, FORMULAR_NOU = adaugare, obiect = editare.
  const [formular, setFormular] = useState(null);
  const [deSters, setDeSters] = useState(null);
  const [mesaj, setMesaj] = useState(null);

  const creare = useCreateFacilitate();
  const modificare = useUpdateFacilitate();
  const stergere = useDeleteFacilitate();
  const editata = formular === FORMULAR_NOU ? undefined : formular;

  const openFormular = (valoare) => {
    creare.reset();
    modificare.reset();
    setMesaj(null);
    setFormular(valoare);
  };

  const openStergere = (facilitate) => {
    stergere.reset();
    setDeSters(facilitate);
  };

  // Erorile nu se prind aici: raman in starea mutatiei si sunt afisate
  // deasupra formularului, respectiv in dialogul de confirmare.
  const handleSubmit = (date) => {
    const onSuccess = (salvata) => {
      setFormular(null);
      setMesaj(`Facilitatea „${salvata.denumire}" a fost salvată.`);
    };
    if (editata) {
      modificare.mutate({ id: editata.id_facilitate, date }, { onSuccess });
      return;
    }
    creare.mutate(date, { onSuccess });
  };

  const handleDelete = () => {
    stergere.mutate(deSters.id_facilitate, {
      onSuccess: () => {
        setMesaj(`Facilitatea „${deSters.denumire}" a fost ștearsă.`);
        setDeSters(null);
      },
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facilități</h1>
          <p className="text-sm text-slate-600">
            Terenurile și sălile care pot fi rezervate de studenți.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primar"
          onClick={() => openFormular(FORMULAR_NOU)}
        >
          Adaugă facilitate
        </button>
      </header>

      {mesaj && <StatusMessage varianta="succes">{mesaj}</StatusMessage>}

      {formular && (
        <FacilitateEditor
          facilitate={editata}
          salvare={editata ? modificare : creare}
          onSubmit={handleSubmit}
          onCancel={() => setFormular(null)}
        />
      )}

      <FacilitatiList onEdit={openFormular} onDelete={openStergere} />

      {deSters && (
        <ConfirmDialog
          titlu="Ștergi facilitatea?"
          mesaj={getConfirmMessage(deSters, stergere)}
          isPending={stergere.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeSters(null)}
        />
      )}
    </section>
  );
}

/**
 * Textul dialogului de stergere: avertismentul sau eroarea de la server.
 * @param {object} facilitate
 * @param {import('@tanstack/react-query').UseMutationResult} stergere
 * @returns {string}
 */
function getConfirmMessage(facilitate, stergere) {
  if (stergere.isError) {
    return getErrorMessage(stergere.error);
  }
  return `„${facilitate.denumire}" va fi ștearsă definitiv, împreună cu sloturile și regulile ei.`;
}
