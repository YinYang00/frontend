import UsvLogo from './UsvLogo.jsx';

/**
 * Subsolul aplicatiei, ca in prototipul Figma.
 */
export default function AppFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <UsvLogo />
          <span className="text-sm text-muted">
            Universitatea Ștefan cel Mare din Suceava
          </span>
        </div>
        <p className="border-t border-line pt-4 text-xs text-muted">
          © 2026 USV Sport. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
