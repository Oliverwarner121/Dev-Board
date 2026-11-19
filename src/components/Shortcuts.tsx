import { useState } from 'react';
import { launchShortcut } from '../services/launcher';
import { Panel } from './Panel';

interface Shortcut {
  id: string;
  label: string;
  glyph: string;
}

const GROUPS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: 'Apps',
    shortcuts: [
      { id: 'terminal', label: 'Terminal', glyph: '›_' },
      { id: 'vscode', label: 'VS Code', glyph: '</>' },
      { id: 'vscode-agents', label: 'VS Code Agents', glyph: '✦' },
      { id: 'visual-studio', label: 'Visual Studio 2026', glyph: 'VS' },
      { id: 'outlook', label: 'Outlook', glyph: 'Ol' },
      { id: 'notepad', label: 'Notepad', glyph: 'Np' },
      { id: 'settings', label: 'Settings', glyph: '⚙' },
      { id: 'postman', label: 'Postman', glyph: 'Pm' },
      { id: 'http-toolkit', label: 'HTTP Toolkit', glyph: 'Ht' },
    ],
  },
  {
    title: 'Web',
    shortcuts: [
      { id: 'chrome', label: 'Chrome', glyph: 'Ch' },
      { id: 'edge', label: 'Edge', glyph: 'Ed' },
      { id: 'firefox', label: 'Firefox', glyph: 'Ff' },
      { id: 'copilot', label: 'Copilot', glyph: 'Co' },
      { id: 'vercel', label: 'Vercel', glyph: '▲' },
            { id: 'contentstack', label: 'Contentstack', glyph: 'Cs' },    ],
  },
];

export function Shortcuts() {
  const [error, setError] = useState<string>();

  const open = (shortcut: Shortcut) => {
    setError(undefined);
    launchShortcut(shortcut.id).catch((reason: unknown) =>
      setError(
        reason instanceof Error
          ? reason.message
          : `Could not open ${shortcut.label}`,
      ),
    );
  };

  return (
    <Panel title="Shortcuts" eyebrow="LAUNCH">
      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      {GROUPS.map((group) => (
        <div key={group.title} className="shortcut-group">
          <h3>{group.title}</h3>
          <div className="shortcut-grid">
            {group.shortcuts.map((shortcut) => (
              <button
                key={shortcut.id}
                type="button"
                className="shortcut glass-lite glass-interactive"
                onClick={() => open(shortcut)}
              >
                <span className="shortcut-glyph" aria-hidden="true">
                  {shortcut.glyph}
                </span>
                <span>{shortcut.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}
