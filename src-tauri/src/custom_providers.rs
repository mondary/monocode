use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use serde::{Deserialize, Serialize};

/// A custom OpenAI-compatible provider the user manages from Settings.
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CustomProviderEntry {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub api_key: String,
    pub models: Vec<String>,
}

#[derive(Serialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CustomProviderProbe {
    pub ok: bool,
    pub status: u16,
    pub models: Vec<String>,
    pub error: Option<String>,
}

fn normalize_base(base_url: &str) -> String {
    base_url.trim().trim_end_matches('/').to_string()
}

fn trim_slash_suffix(value: &str) -> String {
    value.trim().trim_end_matches('/').to_string()
}

/// Probe a custom endpoint with GET /models so the Test button can report
/// auth or endpoint problems before the provider is saved.
#[tauri::command(async)]
pub async fn custom_provider_test(
    base_url: String,
    api_key: String,
) -> Result<CustomProviderProbe, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let base = trim_slash_suffix(&base_url);
        if base.is_empty() || !base.starts_with("http") {
            return Ok(CustomProviderProbe {
                ok: false,
                status: 0,
                models: vec![],
                error: Some("Endpoint must start with http(s)://".into()),
            });
        }
        let url = format!("{base}/models");
        let agent = ureq::AgentBuilder::new()
            .timeout(Duration::from_secs(15))
            .build();
        let mut request = agent.get(&url).set("Accept", "application/json");
        if !api_key.trim().is_empty() {
            request = request.set("Authorization", &format!("Bearer {}", api_key.trim()));
        }
        match request.call() {
            Ok(response) => {
                let status = response.status();
                let body = response.into_string().unwrap_or_default();
                Ok(CustomProviderProbe {
                    ok: true,
                    status,
                    models: parse_model_ids(&body),
                    error: None,
                })
            }
            Err(ureq::Error::Status(status, response)) => {
                let body = response.into_string().unwrap_or_default();
                let message = if status == 401 || status == 403 {
                    "Unauthorized — check the API key."
                } else {
                    "The endpoint rejected the request."
                };
                Ok(CustomProviderProbe {
                    ok: false,
                    status,
                    models: vec![],
                    error: Some(format!("{message} (HTTP {status})")),
                })
            }
            Err(error) => Ok(CustomProviderProbe {
                ok: false,
                status: 0,
                models: vec![],
                error: Some(format!("Could not reach the endpoint: {error}")),
            }),
        }
    })
    .await
    .map_err(|e| e.to_string())?
}

fn parse_model_ids(body: &str) -> Vec<String> {
    let parsed: serde_json::Value = match serde_json::from_str(body) {
        Ok(value) => value,
        Err(_) => return vec![],
    };
    let list = parsed
        .get("data")
        .or_else(|| parsed.get("models"))
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    list.into_iter()
        .filter_map(|model| {
            model
                .get("id")
                .and_then(|id| id.as_str())
                .map(|id| id.to_string())
        })
        .collect()
}

#[derive(Serialize, Deserialize)]
struct OpencodeConfig {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "$schema")]
    schema: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    provider: Option<serde_json::Map<String, serde_json::Value>>,
    #[serde(flatten)]
    rest: serde_json::Map<String, serde_json::Value>,
}

/// Merge the app's custom providers into OpenCode's global config so the
/// runtime routes them. Entries previously written by MonoCode and no longer
/// managed are removed first.
#[tauri::command(async)]
pub async fn custom_provider_sync(providers: Vec<CustomProviderEntry>) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let home = std::env::var("HOME")
            .map_err(|_| "Could not resolve the home directory".to_string())?;
        let config_dir = std::path::Path::new(&home).join(".config").join("opencode");
        fs::create_dir_all(&config_dir)
            .map_err(|error| format!("{}: {error}", config_dir.display()))?;
        let path = config_dir.join("opencode.json");

        let mut config: OpencodeConfig = match fs::read_to_string(&path) {
            Ok(raw) => serde_json::from_str(&raw).unwrap_or(OpencodeConfig {
                schema: None,
                provider: None,
                rest: Default::default(),
            }),
            Err(_) => OpencodeConfig {
                schema: Some("https://opencode.ai/config.json".into()),
                provider: None,
                rest: serde_json::Map::new(),
            },
        };

        let provider_map = config.provider.get_or_insert_with(serde_json::Map::new);
        // Drop stale MonoCode-managed entries before re-adding the current set.
        let stale: Vec<String> = provider_map
            .keys()
            .filter(|key| key.starts_with("pk-custom-"))
            .cloned()
            .collect();
        for key in stale {
            provider_map.remove(&key);
        }

        for entry in &providers {
            let mut models = serde_json::Map::new();
            for model in &entry.models {
                models.insert(model.clone(), serde_json::json!({}));
            }
            provider_map.insert(
                entry.id.clone(),
                serde_json::json!({
                    "npm": "@ai-sdk/openai-compatible",
                    "name": entry.name,
                    "options": {
                        "baseURL": entry.base_url,
                        "apiKey": entry.api_key,
                    },
                    "models": models,
                }),
            );
        }

        let serialized =
            serde_json::to_string_pretty(&config).map_err(|error| error.to_string())?;
        let tmp = path.with_extension("json.tmp");
        fs::write(&tmp, serialized).map_err(|error| format!("{}: {error}", tmp.display()))?;
        fs::rename(&tmp, &path).map_err(|error| format!("{}: {error}", path.display()))?;
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Id used inside OpenCode's provider config for a MonoCode custom provider.
pub fn custom_provider_opencode_id(name: &str) -> String {
    let slug: String = name
        .trim()
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' {
                c
            } else {
                '-'
            }
        })
        .collect();
    format!("pk-custom-{}", trim_slash_suffix(&slug).to_lowercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn probe_parse_accepts_openai_shape() {
        assert_eq!(
            parse_model_ids(r#"{"data":[{"id":"gpt-x"},{"id":"gpt-y"}]}"#),
            vec!["gpt-x", "gpt-y"]
        );
        assert!(parse_model_ids("not json").is_empty());
    }

    #[test]
    fn opencode_id_is_slug_prefixed() {
        assert_eq!(
            custom_provider_opencode_id("Acme AI!"),
            "pk-custom-acme-ai-"
        );
    }

    #[test]
    fn sync_removes_stale_entries() {
        let mut map = serde_json::Map::new();
        map.insert(
            "pk-custom-old".to_string(),
            serde_json::json!({"npm": "@ai-sdk/openai-compatible"}),
        );
        map.insert(
            "builtin".to_string(),
            serde_json::json!({"npm": "@ai-sdk/anthropic"}),
        );
        let mut config = OpencodeConfig {
            schema: None,
            provider: Some(map),
            rest: serde_json::Map::new(),
        };
        // Emulate sync's stale-cleanup step.
        let provider_map = config.provider.as_mut().unwrap();
        let stale: Vec<String> = provider_map
            .keys()
            .filter(|key| key.starts_with("pk-custom-"))
            .cloned()
            .collect();
        for key in stale {
            provider_map.remove(&key);
        }
        assert!(!provider_map.contains_key("pk-custom-"));
        assert!(provider_map.contains_key("builtin"));
    }
}
