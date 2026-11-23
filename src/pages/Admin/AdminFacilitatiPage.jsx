import { useState } from 'react';

import { getErrorMessage } from '../../api/httpClient.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import {
  useCreateFacilitate,
  useDeleteFacilitate,
  useUpdateFacilitate,
} from '../../hooks/useFacilitati.js';

import FacilitateEditor from '../Facilitati/FacilitateEditor.jsx';
import FacilitatiList from '../Facilitati/FacilitatiList.jsx';

const FORMULAR_NOU = 'nou';

/**
 * Titlul paginii de administrare, cu butonul de adaugare.
 * @param {object} props
 * @param {() => void} props.onAdauga
 */
function AntetAdministrare({ onAdauga }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-normal text-heading">
          Administrarea facilităților
        </h1>
        <p className="text-sm text-muted">
          Adaugă, modifică sau șterge facilitățile.
        </p>
      </div>
      <button type="button" className="btn btn-primar" onClick={onAdauga}>
        <Icon nume="plus" />
        Adaugă facilitate
      </button>
    </header>
  );
}

/**
 * Butoanele de editare si stergere de pe cardul unei facilitati.
 * @param {object} props
 * @param {object} props.facilitate
 * @param {(facilitate: object) => void} props.onEdit
 * @param {(facilitate: object) => void} props.onDelete
 */
function ActiuniFacilitate({ facilitate, onEdit, onDelete }) {
  return (
    <>
      <button
        type="button"
        className="btn btn-soft flex-1"
        onClick={() => onEdit(facilitate)}
        aria-label={`Editează ${facilitate.denumire}`}
      >
        <Icon nume="editare" className="size-3.5" />
        Editează
      </button>
      <button
        type="button"
        className="btn btn-secundar flex-1 text-red-700"
        onClick={() => onDelete(facilitate)}
        aria-label={`Șterge ${facilitate.denumire}`}
      >
        <Icon nume="stergere" className="size-3.5" />
        Șterge
      </button>
    </>
  );
}

/**
 * Pagina de administrare a facilitatilor: listare, adaugare, editare si
 * stergere, cu datele reale de la backend. Fiecare facilitate duce la
 * pagina ei de administrare.
 */
export default function AdminFacilitatiPage() {
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
      <AntetAdministrare onAdauga={() => openFormular(FORMULAR_NOU)} />

      {mesaj && <StatusMessage varianta="succes">{mesaj}</StatusMessage>}

      {formular && (
        <FacilitateEditor
          facilitate={editata}
          salvare={editata ? modificare : creare}
          onSubmit={handleSubmit}
          onCancel={() => setFormular(null)}
        />
      )}

      <FacilitatiList
        mesajGol="Nu există încă nicio facilitate. Adaugă prima facilitate."
        getAdresa={(facilitate) =>
          `/admin/facilitati/${facilitate.id_facilitate}`
        }
        renderActiuni={(facilitate) => (
          <ActiuniFacilitate
            facilitate={facilitate}
            onEdit={openFormular}
            onDelete={openStergere}
          />
        )}
      />

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
