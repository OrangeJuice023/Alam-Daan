// components/shared/PageShell.tsx
import { Header } from './Header';

// One consistent layout shell for every static (non-map) page.
// Centers content in a constrained column with even gutters, so
// individual pages never re-invent (and break) their own centering.
export function PageShell({
  children,
  width = 'wide',
}: {
  children: React.ReactNode;
  width?: 'narrow' | 'wide';
}) {
  const max = width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl';
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
        <div className={`${max} w-full px-6 py-12 md:px-10 md:py-16`}>
          {children}
        </div>
      </main>
    </>
  );
}
