/**
 * Dialog de confirmare pentru actiunile distructive (CODING_STYLE 3.5).
 * @param {object} props
 * @param {string} props.titlu
 * @param {string} props.mesaj
 * @param {boolean} props.isPending True cat timp cererea este in curs.
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function ConfirmDialog({
  titlu,
  mesaj,
  isPending,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titlu"
        aria-describedby="confirm-mesaj"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-titlu" className="text-lg font-semibold text-slate-900">
          {titlu}
        </h2>
        <p id="confirm-mesaj" className="mt-2 text-sm text-slate-600">
          {mesaj}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-secundar" onClick={onCancel}>
            Renunță
          </button>
          <button
            type="button"
            className="btn btn-pericol"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Se șterge…' : 'Șterge'}
          </button>
        </div>
      </div>
    </div>
  );
}
