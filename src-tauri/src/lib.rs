use serde::Serialize;
use sysinfo::{Disks, System};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct MemorySnapshot {
    used_bytes: u64,
    total_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DiskSnapshot {
    used_bytes: u64,
    total_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemSnapshot {
    cpu_usage: f32,
    memory: MemorySnapshot,
    disk: DiskSnapshot,
    uptime_seconds: u64,
}

#[tauri::command]
fn get_system_snapshot() -> Result<SystemSnapshot, String> {
    let mut system = System::new_all();
    system.refresh_cpu_usage();
    system.refresh_memory();

    let disks = Disks::new_with_refreshed_list();
    let total_bytes = disks.iter().map(|disk| disk.total_space()).sum::<u64>();
    let available_bytes = disks.iter().map(|disk| disk.available_space()).sum::<u64>();

    Ok(SystemSnapshot {
        cpu_usage: system.global_cpu_usage(),
        memory: MemorySnapshot {
            used_bytes: system.used_memory(),
            total_bytes: system.total_memory(),
        },
        disk: DiskSnapshot {
            used_bytes: total_bytes.saturating_sub(available_bytes),
            total_bytes,
        },
        uptime_seconds: System::uptime(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_system_snapshot])
        .run(tauri::generate_context!())
        .expect("error while running DevBoard");
}
