import type { ReactNode } from 'react';

import { Brackets, Menu } from 'lucide-react';
import { useState } from 'react';

import { useCategories } from '@/api/hooks';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

export interface AppShellProps {
  children: ReactNode;
}

function CategoryNav({ onNavigate }: { onNavigate?: () => void }): React.JSX.Element {
  const categoriesQuery = useCategories();
  const categoryFilter = useUiStore((state) => state.categoryFilter);
  const setCategoryFilter = useUiStore((state) => state.setCategoryFilter);
  const showDashboard = useUiStore((state) => state.showDashboard);

  const goTo = (categoryId: null | string): void => {
    setCategoryFilter(categoryId);
    showDashboard();
    onNavigate?.();
  };

  return (
    <nav aria-label="Categories" className="flex flex-col gap-1">
      <Button
        className={cn('justify-start', categoryFilter === null && 'bg-accent')}
        onClick={() => goTo(null)}
        size="sm"
        variant="ghost"
      >
        All challenges
      </Button>
      {(categoriesQuery.data ?? []).map((category) => (
        <Button
          className={cn('justify-start', categoryFilter === category.id && 'bg-accent')}
          key={category.id}
          onClick={() => goTo(category.id)}
          size="sm"
          variant="ghost"
        >
          {category.title}
        </Button>
      ))}
    </nav>
  );
}

/** Responsive layout frame: fixed sidebar on desktop, sheet-based drawer on mobile. */
export function AppShell({ children }: AppShellProps): React.JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false);
  const showDashboard = useUiStore((state) => state.showDashboard);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside className="bg-sidebar sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r p-4 md:flex">
        <button className="flex items-center gap-2 text-left font-semibold" onClick={showDashboard} type="button">
          <Brackets aria-hidden className="size-5" />
          The Array Methods Challenge
        </button>
        <CategoryNav />
        <div className="mt-auto">
          <SettingsDialog />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/95 sticky top-0 z-10 flex items-center gap-2 border-b p-3 backdrop-blur md:hidden">
          <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
            <SheetTrigger asChild>
              <Button aria-label="Open navigation" size="icon" variant="ghost">
                <Menu aria-hidden className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-72 p-4" side="left">
              <SheetHeader className="p-0">
                <SheetTitle className="flex items-center gap-2">
                  <Brackets aria-hidden className="size-5" />
                  The Array Methods Challenge
                </SheetTitle>
              </SheetHeader>
              <CategoryNav onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <button className="flex-1 text-left font-semibold" onClick={showDashboard} type="button">
            The Array Methods Challenge
          </button>
          <SettingsDialog />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
