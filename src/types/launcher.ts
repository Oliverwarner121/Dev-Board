export type ProjectLocation = 'windows' | 'wsl';

export interface ProjectGroup {
  projects: string[];
  error: string | null;
}

export interface ProjectLists {
  windows: ProjectGroup;
  wsl: ProjectGroup;
}

export type ProjectsState =
  | { status: 'loading' }
  | { status: 'ready'; data: ProjectLists }
  | { status: 'unavailable'; message: string };
