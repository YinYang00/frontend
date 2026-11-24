/**
 * Dialog de confirmare pentru actiunile distructive (CODING_STYLE 3.5).
 * @param {object} props
 * @param {string} props.titlu
 * @param {string} props.mesaj
 * @param {boolean} props.isPending True cat timp cererea este in curs.
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 * @param {string} [props.textConfirmare] Textul butonului de confirmare.
 * @param {string} [props.textInCurs] Textul lui cat timp cererea e in curs.
 */
export default function ConfirmDialog({
  titlu,
  mesaj,
  isPending,
  onConfirm,
  onCancel,
  textConfirmare = 'Șterge',
  textInCurs = 'Se șterge…',
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titlu"
        aria-describedby="confirm-mesaj"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-titlu" className="text-lg font-semibold text-ink">
          {titlu}
        </h2>
        <p id="confirm-mesaj" className="mt-2 text-sm text-muted">
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
            {isPending ? textInCurs : textConfirmare}
          </button>
        </div>
      </div>
    </div>
  );
}
