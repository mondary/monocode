use std::fs;
use std::path::{Component, Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::fs::expand_home;

const AGENT_INSTRUCTION_FILES: &[&str] = &[
    "AGENT.md",
    "CLAUDE.md",
    "CODEX.md",
    "GEMINI.md",
    "GLM.md",
    "OPENCODE.md",
];

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInitLink {
    pub source: String,
    pub target: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInitSettings {
    pub links: Vec<ProjectInitLink>,
    pub link_agent_instructions: bool,
    pub ensure_gitignore: bool,
    pub create_metadata_files: bool,
}

#[derive(Serialize, Debug, Default, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInitResult {
    pub created: Vec<String>,
    pub updated: Vec<String>,
    pub existing: Vec<String>,
    pub skipped: Vec<String>,
    pub missing: Vec<String>,
    pub metadata_created: Vec<String>,
    pub gitignore_updated: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum LinkState {
    Created,
    Updated,
    Existing,
    Skipped,
}

#[tauri::command(async)]
pub fn initialize_project(
    cwd: String,
    settings: ProjectInitSettings,
) -> Result<ProjectInitResult, String> {
    let root = expand_home(&cwd);
    if !root.is_dir() {
        return Err(format!("{}: Not a project directory", root.display()));
    }
    initialize_project_sync(&root, &settings)
}

pub(crate) fn initialize_project_sync(
    root: &Path,
    settings: &ProjectInitSettings,
) -> Result<ProjectInitResult, String> {
    if settings.links.len() > 24 {
        return Err("Project initialization supports at most 24 links.".into());
    }

    let configured_links = settings
        .links
        .iter()
        .map(|link| {
            let target_name = normalized_target_name(&link.target)?;
            let source = source_path(root, &link.source);
            Ok((source, target_name))
        })
        .collect::<Result<Vec<_>, String>>()?;

    let mut result = ProjectInitResult::default();
    let mut gitignore_entries = Vec::new();

    for (source, target_name) in &configured_links {
        if settings.ensure_gitignore {
            gitignore_entries.push(target_name.clone());
        }
        if !source.exists() {
            result.missing.push(target_name.clone());
            continue;
        }
        let target = root.join(target_name);
        match ensure_link(&target, source, source)? {
            LinkState::Created => result.created.push(target_name.clone()),
            LinkState::Updated => result.updated.push(target_name.clone()),
            LinkState::Existing => result.existing.push(target_name.clone()),
            LinkState::Skipped => result.skipped.push(target_name.clone()),
        }
    }

    if settings.link_agent_instructions {
        for filename in AGENT_INSTRUCTION_FILES {
            let target_name = (*filename).to_string();
            let Some((source, link_target)) = agent_instruction_source(root, filename) else {
                result.missing.push(target_name.clone());
                if settings.ensure_gitignore {
                    gitignore_entries.push(target_name);
                }
                continue;
            };
            if settings.ensure_gitignore {
                gitignore_entries.push(target_name.clone());
            }
            let target = root.join(&target_name);
            match ensure_link(&target, &source, &link_target)? {
                LinkState::Created => result.created.push(target_name),
                LinkState::Updated => result.updated.push(target_name),
                LinkState::Existing => result.existing.push(target_name),
                LinkState::Skipped => result.skipped.push(target_name),
            }
        }
    }

    if settings.ensure_gitignore {
        result.gitignore_updated = ensure_gitignore(root, &gitignore_entries)?;
    }
    if settings.create_metadata_files {
        create_metadata_files(root, &mut result)?;
    }

    Ok(result)
}

fn source_path(root: &Path, raw: &str) -> PathBuf {
    let path = expand_home(raw.trim());
    if path.is_absolute() {
        path
    } else {
        root.join(path)
    }
}

fn normalized_target_name(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Project initialization targets cannot be empty.".into());
    }
    let path = Path::new(trimmed);
    if path.is_absolute()
        || path.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        return Err(format!(
            "Invalid project initialization target `{trimmed}`: use a relative path without `..`."
        ));
    }
    Ok(trimmed.replace('\\', "/"))
}

fn agent_instruction_source(root: &Path, filename: &str) -> Option<(PathBuf, PathBuf)> {
    let candidates = [
        (
            root.join(".agent/agents").join(filename),
            PathBuf::from(format!(".agent/agents/{filename}")),
        ),
        (
            root.join(".agent/opencode").join(filename),
            PathBuf::from(format!(".agent/opencode/{filename}")),
        ),
    ];
    candidates.into_iter().find(|(source, _)| source.exists())
}

fn ensure_link(target: &Path, source: &Path, link_target: &Path) -> Result<LinkState, String> {
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("{}: {error}", parent.display()))?;
    }

    match fs::symlink_metadata(target) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            if link_points_to(target, link_target) {
                return Ok(LinkState::Existing);
            }
            fs::remove_file(target).map_err(|error| format!("{}: {error}", target.display()))?;
            create_symlink(link_target, target, source)?;
            Ok(LinkState::Updated)
        }
        Ok(_) => Ok(LinkState::Skipped),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            create_symlink(link_target, target, source)?;
            Ok(LinkState::Created)
        }
        Err(error) => Err(format!("{}: {error}", target.display())),
    }
}

fn link_points_to(target: &Path, desired: &Path) -> bool {
    let Ok(current) = fs::read_link(target) else {
        return false;
    };
    let current_absolute = if current.is_absolute() {
        current
    } else {
        target
            .parent()
            .map(|parent| parent.join(&current))
            .unwrap_or(current)
    };
    let desired_absolute = if desired.is_absolute() {
        desired.to_path_buf()
    } else {
        target
            .parent()
            .map(|parent| parent.join(desired))
            .unwrap_or_else(|| desired.to_path_buf())
    };
    if current_absolute == desired_absolute {
        return true;
    }
    match (
        fs::canonicalize(&current_absolute),
        fs::canonicalize(&desired_absolute),
    ) {
        (Ok(current), Ok(desired)) => current == desired,
        _ => false,
    }
}

#[cfg(unix)]
fn create_symlink(link_target: &Path, target: &Path, _source: &Path) -> Result<(), String> {
    std::os::unix::fs::symlink(link_target, target).map_err(|error| {
        format!(
            "Could not create {} -> {}: {error}",
            target.display(),
            link_target.display()
        )
    })
}

#[cfg(windows)]
fn create_symlink(link_target: &Path, target: &Path, source: &Path) -> Result<(), String> {
    let result = if source.is_dir() {
        std::os::windows::fs::symlink_dir(link_target, target)
    } else {
        std::os::windows::fs::symlink_file(link_target, target)
    };
    result.map_err(|error| {
        format!(
            "Could not create {} -> {}: {error}",
            target.display(),
            link_target.display()
        )
    })
}

#[cfg(not(any(unix, windows)))]
fn create_symlink(_link_target: &Path, _target: &Path, _source: &Path) -> Result<(), String> {
    Err("Project symlinks are not supported on this platform.".into())
}

fn ensure_gitignore(root: &Path, entries: &[String]) -> Result<bool, String> {
    let path = root.join(".gitignore");
    let mut content = match fs::read_to_string(&path) {
        Ok(content) => content,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => String::new(),
        Err(error) => return Err(format!("{}: {error}", path.display())),
    };
    let missing: Vec<&str> = entries
        .iter()
        .map(String::as_str)
        .filter(|entry| !gitignore_contains(&content, entry))
        .collect();
    if missing.is_empty() {
        return Ok(false);
    }
    if !content.is_empty() && !content.ends_with('\n') {
        content.push('\n');
    }
    content.push_str(&missing.join("\n"));
    content.push('\n');
    fs::write(&path, content).map_err(|error| format!("{}: {error}", path.display()))?;
    Ok(true)
}

fn gitignore_contains(content: &str, entry: &str) -> bool {
    let normalized = entry.trim_matches('/');
    content.lines().any(|line| {
        let line = line.trim();
        !line.starts_with('#') && line.trim_start_matches('/').trim_end_matches('/') == normalized
    })
}

fn create_metadata_files(root: &Path, result: &mut ProjectInitResult) -> Result<(), String> {
    let version = root.join("VERSION");
    if !version.exists() && fs::symlink_metadata(&version).is_err() {
        fs::write(&version, "0.10\n").map_err(|error| format!("{}: {error}", version.display()))?;
        result.metadata_created.push("VERSION".into());
    }

    let changelog = root.join("CHANGELOG.md");
    if !changelog.exists() && fs::symlink_metadata(&changelog).is_err() {
        fs::write(
            &changelog,
            "# Changelog\n\n## [Unreleased]\n\n### Added\n\n- Initial project setup.\n",
        )
        .map_err(|error| format!("{}: {error}", changelog.display()))?;
        result.metadata_created.push("CHANGELOG.md".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    static TMP_SEQ: AtomicU64 = AtomicU64::new(0);

    struct TempDir(PathBuf);

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn temp_dir(label: &str) -> TempDir {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let sequence = TMP_SEQ.fetch_add(1, Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!(
            "monocode-project-init-{label}-{}-{stamp}-{sequence}",
            std::process::id()
        ));
        fs::create_dir_all(&path).unwrap();
        TempDir(path)
    }

    #[test]
    fn initialization_creates_and_then_reuses_configured_links() {
        let temp = temp_dir("links");
        let project = temp.0.join("project");
        let source = temp.0.join("central-skills");
        fs::create_dir_all(&project).unwrap();
        fs::create_dir_all(&source).unwrap();
        fs::write(source.join("skill.md"), "skill\n").unwrap();
        let source_text = source.to_string_lossy().into_owned();
        let settings = ProjectInitSettings {
            links: vec![ProjectInitLink {
                source: source_text,
                target: ".agent".into(),
            }],
            link_agent_instructions: false,
            ensure_gitignore: true,
            create_metadata_files: true,
        };

        let first = initialize_project_sync(&project, &settings).unwrap();
        assert_eq!(first.created, vec![".agent"]);
        assert_eq!(first.metadata_created, vec!["VERSION", "CHANGELOG.md"]);
        assert_eq!(
            fs::read_to_string(project.join("VERSION")).unwrap(),
            "0.10\n"
        );
        assert!(project.join(".agent").is_dir());
        assert!(project.join(".agent").join("skill.md").is_file());
        assert_eq!(
            fs::read_to_string(project.join(".gitignore")).unwrap(),
            ".agent\n"
        );
        let second = initialize_project_sync(&project, &settings).unwrap();
        assert_eq!(second.existing, vec![".agent"]);
        assert!(second.created.is_empty());
    }

    #[test]
    fn initialization_keeps_existing_local_directories_and_rejects_escape_targets() {
        let temp = temp_dir("safe");
        let project = temp.0.join("project");
        let source = temp.0.join("central");
        fs::create_dir_all(&project).unwrap();
        fs::create_dir_all(&source).unwrap();
        fs::create_dir(project.join(".agent")).unwrap();
        let settings = ProjectInitSettings {
            links: vec![ProjectInitLink {
                source: source.to_string_lossy().into_owned(),
                target: ".agent".into(),
            }],
            link_agent_instructions: false,
            ensure_gitignore: false,
            create_metadata_files: false,
        };
        let result = initialize_project_sync(&project, &settings).unwrap();
        assert_eq!(result.skipped, vec![".agent"]);
        assert!(normalized_target_name("../outside").is_err());
    }
}
