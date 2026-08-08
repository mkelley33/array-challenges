// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsDialog } from '@/components/settings-dialog';
import { useSettingsStore } from '@/stores/settings-store';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState(useSettingsStore.getInitialState());
});

describe('SettingsDialog', () => {
  it('shows the current settings when opened', async () => {
    const user = userEvent.setup();
    render(<SettingsDialog />);
    await user.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByLabelText(/font size/i)).toHaveValue('14');
    expect(screen.getByLabelText(/tab size/i)).toHaveValue('2');
    expect(screen.getByLabelText(/theme/i)).toHaveValue('system');
  });

  it('saves the chosen settings to the store', async () => {
    const user = userEvent.setup();
    render(<SettingsDialog />);
    await user.click(screen.getByRole('button', { name: /settings/i }));
    await user.selectOptions(screen.getByLabelText(/font size/i), '18');
    await user.selectOptions(screen.getByLabelText(/tab size/i), '4');
    await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(useSettingsStore.getState().fontSize).toBe(18);
    });
    expect(useSettingsStore.getState().tabSize).toBe(4);
    expect(useSettingsStore.getState().theme).toBe('dark');
  });
});
