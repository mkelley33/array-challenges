import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo } from 'react';

import { useEffectiveTheme } from '@/lib/use-theme';
import { useSettingsStore } from '@/stores/settings-store';

export interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

/** CodeMirror-based TypeScript editor wired to the user's font size, tab size, and theme settings. */
export function Editor({ onChange, value }: EditorProps): React.JSX.Element {
  const fontSize = useSettingsStore((state) => state.fontSize);
  const tabSize = useSettingsStore((state) => state.tabSize);
  const effectiveTheme = useEffectiveTheme();
  const extensions = useMemo(() => [javascript({ typescript: true })], []);

  return (
    <div className="overflow-hidden rounded-lg border" style={{ fontSize }}>
      <CodeMirror
        aria-label="Code editor"
        basicSetup={{ tabSize }}
        extensions={extensions}
        height="100%"
        minHeight="16rem"
        onChange={onChange}
        theme={effectiveTheme === 'dark' ? oneDark : 'light'}
        value={value}
      />
    </div>
  );
}
