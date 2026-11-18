use serde::Serialize;
use std::{
    fs,
    path::PathBuf,
    process::{Command, Stdio},
};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

enum Target {
    /// Resolved by `cmd /C start`, which handles App Paths, URLs and URI schemes.
    Start(&'static [&'static str]),
    /// Spawned directly so batch-file launchers don't flash a console window.
    Direct(&'static str, &'static [&'static str]),
    /// A GUI executable located under an environment-variable directory.
    Exe(&'static str, &'static str),
}

const SHORTCUTS: &[(&str, Target)] = &[
    ("terminal", Target::Start(&["wt"])),
    ("vscode", Target::Direct("code.cmd", &[])),
    ("vscode-agents", Target::Direct("code.cmd", &["--agents"])),
    (
        "visual-studio",
        Target::Exe(
            "ProgramFiles",
            r"Microsoft Visual Studio\18\Community\Common7\IDE\devenv.exe",
        ),
    ),
    ("outlook", Target::Start(&["outlook"])),
    ("notepad", Target::Start(&["notepad"])),
    ("settings", Target::Start(&["ms-settings:"])),
    (
        "postman",
        Target::Exe("LOCALAPPDATA", r"Postman\Postman.exe"),
    ),
    (
        "http-toolkit",
        Target::Exe("LOCALAPPDATA", r"Programs\httptoolkit\HTTP Toolkit.exe"),
    ),
    ("chrome", Target::Start(&["chrome"])),
    ("edge", Target::Start(&["msedge"])),
    ("firefox", Target::Start(&["firefox"])),
    (
        "copilot",
        Target::Start(&["https://copilot.cloud.microsoft/chat"]),
    ),
    ("vercel", Target::Start(&["https://vercel.com/"])),
];

#[derive(Debug, Default, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProjectGroup {
    pub projects: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectLists {
    pub windows: ProjectGroup,
    pub wsl: ProjectGroup,
}

#[derive(Debug, PartialEq)]
struct WslListing {
    distro: String,
    home: String,
    projects: Vec<String>,
}

fn command(program: &str) -> Command {
    let mut command = Command::new(program);
    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);
    command
}

fn detach(mut command: Command, label: &str) -> Result<(), String> {
    command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map(drop)
        .map_err(|error| format!("Could not open {label}: {error}"))
}

pub fn launch_shortcut(id: &str) -> Result<(), String> {
    let target = SHORTCUTS
        .iter()
        .find(|(name, _)| *name == id)
        .map(|(_, target)| target)
        .ok_or_else(|| format!("Unknown shortcut: {id}"))?;

    let process = match target {
        Target::Start(args) => {
            let mut process = command("cmd");
            process.args(["/C", "start", ""]).args(*args);
            process
        }
        Target::Direct(program, args) => {
            let mut process = command(program);
            process.args(*args);
            process
        }
        Target::Exe(variable, relative) => {
            let base =
                std::env::var_os(variable).ok_or_else(|| format!("{variable} is not set"))?;
            let path = PathBuf::from(base).join(relative);
            if !path.is_file() {
                return Err(format!("{} is not installed", path.display()));
            }
            command(&path.to_string_lossy())
        }
    };
    detach(process, id)
}

fn sorted(mut names: Vec<String>) -> Vec<String> {
    names.sort_by_key(|name| name.to_lowercase());
    names
}

fn windows_projects_dir() -> Result<PathBuf, String> {
    std::env::var_os("USERPROFILE")
        .map(|profile| PathBuf::from(profile).join("Documents").join("Projects"))
        .ok_or_else(|| "USERPROFILE is not set".to_string())
}

fn list_windows_projects() -> Result<Vec<String>, String> {
    let dir = windows_projects_dir()?;
    let entries =
        fs::read_dir(&dir).map_err(|error| format!("Cannot read {}: {error}", dir.display()))?;
    let names = entries
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_dir())
        .filter_map(|entry| entry.file_name().into_string().ok())
        .filter(|name| !name.starts_with('.'))
        .collect();
    Ok(sorted(names))
}

const WSL_SCRIPT: &str = r#"echo "$WSL_DISTRO_NAME"; echo "$HOME"; for d in "$HOME"/Projects/*/; do [ -d "$d" ] && basename "$d"; done"#;

fn parse_wsl_listing(output: &str) -> Result<WslListing, String> {
    let mut lines = output.lines().map(str::trim);
    let distro = lines.next().unwrap_or_default();
    let home = lines.next().unwrap_or_default();
    if distro.is_empty() || !home.starts_with('/') {
        return Err("WSL returned an unexpected response".to_string());
    }
    let projects = lines
        .filter(|line| !line.is_empty())
        .map(str::to_string)
        .collect();
    Ok(WslListing {
        distro: distro.to_string(),
        home: home.to_string(),
        projects: sorted(projects),
    })
}

fn read_wsl_projects() -> Result<WslListing, String> {
    let output = command("wsl.exe")
        .args(["-e", "sh", "-c", WSL_SCRIPT])
        .stdin(Stdio::null())
        .output()
        .map_err(|error| format!("WSL is unavailable: {error}"))?;
    if output.stdout.is_empty() {
        return Err("WSL returned no data. Is a distribution installed?".to_string());
    }
    parse_wsl_listing(&String::from_utf8_lossy(&output.stdout))
}

fn group<T>(result: Result<T, String>, into: impl FnOnce(T) -> Vec<String>) -> ProjectGroup {
    match result {
        Ok(value) => ProjectGroup {
            projects: into(value),
            error: None,
        },
        Err(error) => ProjectGroup {
            projects: Vec::new(),
            error: Some(error),
        },
    }
}

pub fn list_projects() -> ProjectLists {
    ProjectLists {
        windows: group(list_windows_projects(), |names| names),
        wsl: group(read_wsl_projects(), |listing| listing.projects),
    }
}

/// Only names that appear in a fresh listing are opened, so the frontend can't
/// request arbitrary paths. Opens a terminal in the project and runs the
/// equivalent of `code .` there.
pub fn open_project(kind: &str, name: &str) -> Result<(), String> {
    // Windows Terminal treats `;` as a command separator.
    if name.contains(';') {
        return Err(format!("Unsupported project name: {name}"));
    }
    let mut terminal = command("wt.exe");
    let mut editor = command("code.cmd");
    match kind {
        "windows" => {
            if !list_windows_projects()?
                .iter()
                .any(|project| project == name)
            {
                return Err(format!("Unknown project: {name}"));
            }
            let dir = windows_projects_dir()?.join(name);
            terminal.arg("-d").arg(&dir);
            editor.current_dir(&dir).arg(".");
        }
        "wsl" => {
            let listing = read_wsl_projects()?;
            if !listing.projects.iter().any(|project| project == name) {
                return Err(format!("Unknown project: {name}"));
            }
            let dir = format!("{}/Projects/{name}", listing.home);
            terminal
                .args(["wsl.exe", "-d", &listing.distro, "--cd"])
                .arg(&dir);
            editor
                .arg("--remote")
                .arg(format!("wsl+{}", listing.distro))
                .arg(&dir);
        }
        _ => return Err(format!("Unknown project location: {kind}")),
    }
    detach(terminal, "terminal")?;
    detach(editor, "VS Code")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_wsl_listing_and_sorts_projects() {
        let listing = parse_wsl_listing("Ubuntu\n/home/dev\nzeta\nAlpha\n\nbeta\n").unwrap();
        assert_eq!(listing.distro, "Ubuntu");
        assert_eq!(listing.home, "/home/dev");
        assert_eq!(listing.projects, ["Alpha", "beta", "zeta"]);
    }

    #[test]
    fn rejects_malformed_wsl_listing() {
        assert!(parse_wsl_listing("").is_err());
        assert!(parse_wsl_listing("Ubuntu\nnot-a-path\n").is_err());
    }

    #[test]
    fn rejects_unknown_shortcuts_and_locations() {
        assert!(launch_shortcut("rm-rf").is_err());
        assert!(open_project("elsewhere", "x").is_err());
    }
}
