import { useState } from 'react';
import { openProject } from '../services/launcher';
import type { ProjectGroup, ProjectLocation } from '../types/launcher';
import { Panel } from './Panel';

interface ProjectListProps {
  title: string;
  eyebrow: string;
  location: ProjectLocation;
  group?: ProjectGroup;
  loadError?: string;
}

export function ProjectList({
  title,
  eyebrow,
  location,
  group,
  loadError,
}: ProjectListProps) {
  const [openError, setOpenError] = useState<string>();
  const error = openError ?? loadError ?? group?.error ?? undefined;

  const open = (name: string) => {
    setOpenError(undefined);
    openProject(location, name).catch((reason: unknown) =>
      setOpenError(
        reason instanceof Error ? reason.message : `Could not open ${name}`,
      ),
    );
  };

  return (
    <Panel title={title} eyebrow={eyebrow} className="project-panel">
      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      {!group && !loadError && <p className="empty">Loading projects…</p>}
      {group && !group.error && group.projects.length === 0 && (
        <p className="empty">No projects found.</p>
      )}
      <ul className="projects">
        {group?.projects.map((name) => (
          <li key={name}>
            <button
              type="button"
              className="glass-lite glass-interactive"
              title="Open in Terminal and VS Code"
              onClick={() => open(name)}
            >
              <span className="project-name">{name}</span>
              <span className="project-hint" aria-hidden="true">
                Open ↗
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
