// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from '@/stores/settings-store';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState(useSettingsStore.getInitialState());
});

describe('useSettingsStore', () => {
  it('starts with the documented defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.fontSize).toBe(14);
    expect(state.tabSize).toBe(2);
    expect(state.theme).toBe('system');
  });

  it('updates settings through setters', () => {
    useSettingsStore.getState().setFontSize(18);
    useSettingsStore.getState().setTabSize(4);
    useSettingsStore.getState().setTheme('dark');
    const state = useSettingsStore.getState();
    expect(state.fontSize).toBe(18);
    expect(state.tabSize).toBe(4);
    expect(state.theme).toBe('dark');
  });

  it('clamps font size to the 12-20 range', () => {
    useSettingsStore.getState().setFontSize(8);
    expect(useSettingsStore.getState().fontSize).toBe(12);
    useSettingsStore.getState().setFontSize(48);
    expect(useSettingsStore.getState().fontSize).toBe(20);
  });

  it('persists settings to localStorage', () => {
    useSettingsStore.getState().setFontSize(16);
    const raw = localStorage.getItem('array-challenges-settings');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}')).toMatchObject({ state: { fontSize: 16 } });
  });
});
