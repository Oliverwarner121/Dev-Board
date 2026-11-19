import { useProjects } from '../hooks/useProjects';
import { useNow } from '../hooks/useNow';
import { useRefraction } from '../hooks/useRefraction';
import { useSystemSnapshot } from '../hooks/useSystemSnapshot';
import { useWeather } from '../hooks/useWeather';
import { greetingFor } from '../utils/calendar';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import { ProjectList } from './ProjectList';
import { Shortcuts } from './Shortcuts';
import { Vitals } from './Vitals';
import { Weather } from './Weather';

export function Dashboard() {
  const snapshot = useSystemSnapshot();
  const projects = useProjects();
  const { weather, refresh: refreshWeather } = useWeather();
  const now = useNow(60_000);
  const [markRef, markRefraction] = useRefraction<HTMLSpanElement>({
    scale: 14,
    bevel: 10,
  });
  const [refreshRef, refreshRefraction] = useRefraction<HTMLButtonElement>({
    scale: 18,
    bevel: 14,
  });

  const refresh = () => {
    snapshot.refresh();
    projects.refresh();
    refreshWeather();
  };

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span ref={markRef} className="brand-mark glass" aria-hidden="true">
            {markRefraction}›_
          </span>
          <span>DEVBOARD</span>
        </div>
        <h1 className="greeting">{greetingFor(now.getHours())}, Oliver.</h1>
        <div className="topbar-meta">
          <span className="status-dot" /> SYSTEM MONITORING ACTIVE
          <button
            ref={refreshRef}
            className="refresh glass glass-interactive"
            onClick={refresh}
            type="button"
            aria-label="Refresh dashboard"
          >
            {refreshRefraction}
            ↻ <span>Refresh</span>
          </button>
        </div>
      </header>
      {snapshot.status === 'unavailable' && (
        <div className="notice" role="alert">
          {snapshot.message}
        </div>
      )}
      <div className="layout">
        <div className="column">
          <Clock />
          <Vitals snapshot={snapshot} />
          <Calendar today={now} />
        </div>
        <div className="column">
          <Shortcuts />
          <div className="project-columns">
            <ProjectList
              title="WSL projects"
              eyebrow="UBUNTU"
              location="wsl"
              group={
                projects.status === 'ready' ? projects.data.wsl : undefined
              }
              loadError={
                projects.status === 'unavailable' ? projects.message : undefined
              }
            />
            <ProjectList
              title="Windows projects"
              eyebrow="DOCUMENTS / PROJECTS"
              location="windows"
              group={
                projects.status === 'ready' ? projects.data.windows : undefined
              }
              loadError={
                projects.status === 'unavailable' ? projects.message : undefined
              }
            />
          </div>
        </div>
      </div>
      <Weather weather={weather} />
    </main>
  );
}
