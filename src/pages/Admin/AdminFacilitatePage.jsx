import { Link, useParams } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useFacilitate } from '../../hooks/useFacilitati.js';

import GenerareSloturi from './GenerareSloturi.jsx';
import ReguliAcces from './ReguliAcces.jsx';

/**
 * Legatura inapoi la lista de administrare.
 */
function LinkInapoi() {
  return (
    <Link to="/admin/facilitati" className="text-sm text-usv hover:underline">
      ← Înapoi la administrare
    </Link>
  );
}

/**
 * Pagina de administrare a unei facilitati. Tichetul de mentenanta isi adauga
 * aici sectiunea.
 */
export default function AdminFacilitatePage() {
  const { id } = useParams();
  const { data: facilitate, isPending, isError, error } = useFacilitate(id);

  if (isPending) {
    return (
      <StatusMessage varianta="info">Se încarcă facilitatea…</StatusMessage>
    );
  }
  if (isError) {
    return (
      <section className="flex flex-col items-start gap-4">
        <StatusMessage varianta="eroare">
          {getErrorMessage(error)}
        </StatusMessage>
        <LinkInapoi />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-2">
        <LinkInapoi />
        <h1 className="text-3xl font-normal text-heading">
          {facilitate.denumire}
        </h1>
        <p className="text-sm text-muted">
          {facilitate.tip} · {facilitate.locatie}
        </p>
      </header>
      {/* key: alta facilitate porneste cu formularele si rezultatele goale. */}
      <GenerareSloturi key={`generare-${id}`} idFacilitate={id} />
      <ReguliAcces key={`reguli-${id}`} idFacilitate={id} />
    </section>
  );
}
