import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Theme } from '@/stores/settings-store';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MAX_FONT_SIZE, MIN_FONT_SIZE, useSettingsStore } from '@/stores/settings-store';

const FONT_SIZES = Array.from({ length: MAX_FONT_SIZE - MIN_FONT_SIZE + 1 }, (_, index) =>
  String(MIN_FONT_SIZE + index),
);

const settingsFormSchema = z.object({
  fontSize: z.string().refine((value) => FONT_SIZES.includes(value), 'Pick a font size between 12 and 20'),
  tabSize: z.enum(['2', '4']),
  theme: z.enum(['system', 'light', 'dark']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const SELECT_CLASSES =
  'border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none';

/** Editor and appearance settings, edited through a validated form and persisted via the settings store. */
export function SettingsDialog(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const settings = useSettingsStore();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: {
      fontSize: String(settings.fontSize),
      tabSize: String(settings.tabSize) as '2' | '4',
      theme: settings.theme,
    },
  });

  const onSubmit = (values: SettingsFormValues): void => {
    settings.setFontSize(Number(values.fontSize));
    settings.setTabSize(Number(values.tabSize) === 4 ? 4 : 2);
    settings.setTheme(values.theme as Theme);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button aria-label="Settings" size="icon" variant="ghost">
          <Settings aria-hidden className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Editor and appearance preferences. Saved locally in your browser.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font size</FormLabel>
                  <FormControl>
                    <select className={SELECT_CLASSES} {...field}>
                      {FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}px
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tabSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tab size</FormLabel>
                  <FormControl>
                    <select className={SELECT_CLASSES} {...field}>
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <select className={SELECT_CLASSES} {...field}>
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
