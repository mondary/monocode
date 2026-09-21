use std::collections::HashMap;
use tauri::{AppHandle, Manager};

/// Single source of truth for default bindings, shared with the webview
/// (`src/lib/keybindings.ts` imports the same file).
const DEFAULTS_JSON: &str = include_str!("../../keybindings.defaults.json");

#[derive(serde::Deserialize)]
struct BindingDef {
    #[serde(default)]
    #[allow(dead_code)]
    label: String,
    binding: String,
}

fn defaults() -> HashMap<String, BindingDef> {
    serde_json::from_str(DEFAULTS_JSON).unwrap_or_default()
}

fn overrides_path(app: &AppHandle) -> std::path::PathBuf {
    let dir = app
        .path()
        .app_config_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."));
    let _ = std::fs::create_dir_all(&dir);
    dir.join("keybindings.json")
}

fn read_overrides(app: &AppHandle) -> HashMap<String, String> {
    let Ok(raw) = std::fs::read_to_string(overrides_path(app)) else {
        return HashMap::new();
    };
    serde_json::from_str(&raw).unwrap_or_default()
}

fn is_plausible(value: &str) -> bool {
    !value.is_empty() && value.len() <= 64 && !value.contains(char::is_whitespace)
}

/// Override utilisateur > défaut JSON > litéral d'origine dans menu.rs.
pub fn accel_or(app: &AppHandle, id: &str, fallback: &str) -> String {
    let overrides = read_overrides(app);
    if let Some(hit) = overrides.get(id) {
        if is_plausible(hit) {
            return hit.clone();
        }
    }
    defaults()
        .get(id)
        .map(|def| def.binding.clone())
        .unwrap_or_else(|| fallback.to_string())
}

#[tauri::command]
pub fn get_keybindings(app: AppHandle) -> HashMap<String, String> {
    read_overrides(&app)
}

#[tauri::command]
pub fn save_keybindings(
    app: AppHandle,
    map: HashMap<String, String>,
) -> Result<(), String> {
    let known = defaults();
    let filtered: HashMap<String, String> = map
        .into_iter()
        .filter(|(id, value)| known.contains_key(id) && is_plausible(value))
        .collect();
    let json = serde_json::to_string_pretty(&filtered).map_err(|e| e.to_string())?;
    std::fs::write(overrides_path(&app), json).map_err(|e| e.to_string())?;
    crate::menu::install(&app).map_err(|e| e.to_string())
}
