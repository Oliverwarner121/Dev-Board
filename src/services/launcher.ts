import { invoke } from '@tauri-apps/api/core';
import type { ProjectLists, ProjectLocation } from '../types/launcher';

const browserProjects: ProjectLists = {
  windows: { projects: ['Dev-Board', 'Portfolio'], error: null },
  wsl: { projects: ['Dev-Board', 'GetActive'], error: null },
};

export async function listProjects(): Promise<ProjectLists> {
  try {
    return await invoke<ProjectLists>('list_projects');
  } catch (error) {
    if (import.meta.env.DEV) return browserProjects;
    throw new Error(`Projects unavailable: ${String(error)}`);
  }
}

export async function launchShortcut(id: string): Promise<void> {
  await invoke('launch_shortcut', { id });
}

export async function openProject(
  kind: ProjectLocation,
  name: string,
): Promise<void> {
  await invoke('open_project', { kind, name });
}
