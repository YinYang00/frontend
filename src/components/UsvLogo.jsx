/**
 * Marca „USV Sport” din antetul si subsolul prototipului Figma.
 * @param {object} props
 * @param {string} [props.subtitlu] Textul mic de sub „USV Sport”.
 */
export default function UsvLogo({ subtitlu }) {
  return (
    <span className="flex items-center gap-3">
      <span className="border-b-2 border-usv/30 pb-0.5 text-2xl leading-none font-bold tracking-tight text-usv">
        USV
      </span>
      <span className="h-8 w-px bg-line" aria-hidden="true" />
      <span className="flex flex-col">
        <span className="text-base leading-tight font-semibold text-ink">
          USV Sport
        </span>
        {subtitlu && (
          <span className="text-[10px] font-medium tracking-wider text-muted uppercase">
            {subtitlu}
          </span>
        )}
      </span>
    </span>
  );
}
