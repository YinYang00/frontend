import { Link, useParams } from 'react-router';

import { getErrorMessage } from '../../api/httpClient.js';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useFacilitate } from '../../hooks/useFacilitati.js';

import CalendarSloturi from './CalendarSloturi.jsx';

/**
 * Legatura inapoi la lista publica.
 */
function LinkInapoi() {
  return (
    <Link to="/facilitati" className="text-sm text-usv hover:underline">
      ← Înapoi la facilități
    </Link>
  );
}

/**
 * Pagina publica a unei facilitati: detaliile ei si calendarul sloturilor.
 */
export default function FacilitatePage() {
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
      <CalendarSloturi facilitate={facilitate} />
    </section>
  );
}
