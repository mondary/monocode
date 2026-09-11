import { openUrl } from "@tauri-apps/plugin-opener";
import {
  ArrowDownCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader,
  RefreshCw,
  RotateCcw,
  Search,
} from "../chrome/icons";
import { invoke } from "@tauri-apps/api/core";
import {
  customProviderTestLabel,
  deleteCustomProvider,
  loadCustomProviders,
  slugCustomProviderId,
  upsertCustomProvider,
  type CustomProvider,
  type CustomProviderProbe,
} from "../lib/customProviders";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { HarnessIcon } from "../chrome/HarnessIcon";
import { Popover } from "../chrome/Popover";
import { InboxProviderMark } from "../chrome/InboxProviderMark";
import { RemoveProjectDialog } from "../chrome/RemoveProjectDialog";
import { WindowControls } from "../chrome/WindowControls";
import { useLockOverscroll } from "../hooks/useLockOverscroll";
import { useColorScheme } from "../hooks/useColorScheme";
import {
  applyChatBackground,
  applyChatBackgroundOpacity,
  applyChatBackgroundScope,
  applyBackgroundPanels,
  applyBodyGlass,
  applyThemePreference,
  applyThemePreset,
  applySidebarBlur,
  applySidebarOpacity,
  applyThemeTint,
  BODY_GLASS_DEFAULT,
  CHAT_BACKGROUND_OPACITY_DEFAULT,
  CHAT_BACKGROUND_OPACITY_MAX,
  CHAT_BACKGROUND_OPACITY_MIN,
  CHAT_BACKGROUND_SCOPE_DEFAULT,
  THEME_PREFERENCE_DEFAULT,
  chatBackgroundSrc,
  loadBodyGlass,
  loadChatBackgroundOpacity,
  loadChatBackgroundPath,
  loadChatBackgroundScope,
  loadBackgroundPanels,
  type BackgroundPanel,
  loadThemePreference,
  loadThemePreset,
  loadSidebarBlur,
  loadSidebarOpacity,
  loadThemeHue,
  loadThemeSaturation,
  loadTranscriptLayout,
  loadTranscriptAnchor,
  saveBodyGlass,
  saveChatBackgroundOpacity,
  saveChatBackgroundPath,
  saveChatBackgroundScope,
  saveBackgroundPanels,
  saveThemePreference,
  saveThemePreset,
  saveSidebarBlur,
  saveSidebarOpacity,
  saveThemeHue,
  saveThemeSaturation,
  saveTranscriptLayout,
  saveTranscriptAnchor,
  TRANSCRIPT_ANCHOR_CHANGE_EVENT,
  SIDEBAR_BLUR_DEFAULT,
  SIDEBAR_BLUR_MAX,
  SIDEBAR_BLUR_MIN,
  SIDEBAR_OPACITY_DEFAULT,
  SIDEBAR_OPACITY_MAX,
  SIDEBAR_OPACITY_MIN,
  THEME_HUE_DEFAULT,
  THEME_HUE_MAX,
  THEME_HUE_MIN,
  THEME_SATURATION_DEFAULT,
  THEME_SATURATION_MAX,
  THEME_SATURATION_MIN,
  type ThemePreference,
  type ThemePreset,
  type ChatBackgroundScope,
  type TranscriptLayout,
} from "../lib/appearance";
import {
  pickAndSaveChatBackground,
  removeChatBackground,
} from "../lib/chatBackground";
import {
  applyUiScale,
  loadUiScale,
  saveUiScale,
  subscribeUiScale,
  UI_SCALE_DEFAULT,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
} from "../lib/uiScale";
import {
  getHarnessAvailabilitySnapshot,
  harnessUnavailableHint,
  isHarnessAvailable,
  probeHarnessAvailability,
  subscribeHarnessAvailability,
} from "../lib/harness/availability";
import { refreshHarnessCatalogs } from "../lib/harness/registry";
import { ensureOpenCodeProviderRegistered } from "../lib/harness/opencodeAdapter";
import {
  defaultModelId,
  getModelSnapshot,
  isPickerProviderVisible,
  loadDefaultModels,
  loadLastModelChoice,
  modelsFor,
  resolveModel,
  saveDefaultModel,
  saveLastModelChoice,
  savePickerProviderVisible,
  subscribeModels,
} from "../lib/models";
import { prettyCwd, projectKey, projectName } from "../lib/paths";
import { IS_MAC } from "../lib/platform";
import {
  captureAccelerator,
  findBindingOwner,
  isOverridden,
  setKeybindingOverride,
  subscribeKeybindings,
} from "../lib/keybindings";
import {
  loadDefaultTerminalPlacement,
  saveDefaultTerminalPlacement,
  type TerminalPlacement,
} from "../lib/projectTerminal";
import {
  loadHiddenUsageProviders,
  loadUsageDisplayMode,
  loadUsageScope,
  loadUsageWindowVisibility,
  saveHiddenUsageProviders,
  saveUsageDisplayMode,
  saveUsageScope,
  saveUsageWindowVisibility,
  loadUsageProviderOrder,
  saveUsageProviderOrder,
  USAGE_PROVIDER_IDS,
  normalizeUsageProviderId,
  type UsageDisplayMode,
  type UsageScope,
  type UsageWindowVisibility,
} from "../lib/rateLimits";
import {
  loadArchivedProjects,
  looksLikeProject,
  subscribeArchivedProjects,
  type ArchivedProject,
} from "../lib/recents";
import {
  HARNESSES,
  sessionDisplayTitle,
  type HarnessId,
  harnessTitle,
} from "../lib/session";
import {
  loadSessionSidebarFilters,
  saveSessionSidebarFilters,
} from "../lib/sessionFilters";
import type { SessionSummary } from "../lib/sessionStore";
import {
  clearInboxCache,
  githubStatus,
  type GithubStatus,
} from "../lib/githubTasks";
import {
  disconnectGitlab,
  gitlabConnected,
  saveGitlabConfig,
} from "../lib/gitlab";
import {
  disconnectLinear,
  LINEAR_CHANGE_EVENT,
  linearConnected,
  listLinearTeams,
  loadHiddenLinearTeamIds,
  notifyLinearChange,
  saveHiddenLinearTeamIds,
  saveLinearToken,
  type LinearTeam,
} from "../lib/linear";
import { loadTabGroupLabels, resolveTabGroupLabel } from "../lib/tabGroups";
import {
  buildKeybindingRows,
  filterKeybindings,
  loadClaudeHooks,
  loadComposerRunner,
  loadDiffViewer,
  loadFollowUpBehavior,
  loadGridArcadeEnabled,
  loadLiveAgentsEnabled,
  loadNotesEnabled,
  saveClaudeHooks,
  saveComposerRunner,
  saveDiffViewer,
  saveFollowUpBehavior,
  saveGridArcadeEnabled,
  saveLiveAgentsEnabled,
  saveNotesEnabled,
  settingsSectionDescription,
  settingsSectionLabel,
  type DiffViewer,
  type FollowUpBehavior,
  type SettingsSectionId,
} from "../lib/settings";
import { loadSoundsEnabled, playCue, saveSoundsEnabled } from "../lib/sounds";
import {
  BUSY_GLOW_PRESETS,
  loadBusyGlowColor,
  saveBusyGlowColor,
} from "../lib/busyGlowSettings";
import {
  loadExplorerHighlightActions,
  loadExplorerShowChanges,
  saveExplorerHighlightActions,
  saveExplorerShowChanges,
} from "../lib/explorerSettings";
import {
  cachedNotificationPermission,
  loadNotificationsEnabled,
  openNotificationSettings,
  probeNotificationPermission,
  requestNotificationPermission,
  saveNotificationsEnabled,
  type NotificationPermission,
} from "../lib/notifications";
import {
  installPendingUpdate,
  readAppVersion,
  runUpdateFlow,
  type UpdaterSnapshot,
} from "../lib/updater";

import { SkillsPage } from "./SkillsPage";
import { PK_VERSION } from "../lib/pkVersion";
import { usePkVariant } from "../lib/pkVariant";

export type SettingsAnchor = "github" | "gitlab" | "linear";

const ANCHOR_IDS: Record<SettingsAnchor, string> = {
  github: "settings-github",
  gitlab: "settings-gitlab",
  linear: "settings-linear",
};

type Props = {
  section: SettingsSectionId;
  /** Card to scroll to; the General page is too long to land at the top. */
  anchor?: SettingsAnchor | null;
  cwd: string;
  projectCwd?: string;
  sessions: SessionSummary[];
  besideRail?: boolean;
  onClose: () => void;
  onOpenSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string, archived: boolean) => void;
  onDeleteSession: (sessionId: string) => void;
  onRestoreProject?: (path: string) => void;
  onDeleteProject?: (path: string) => void;
  onOpenWhatsNew: () => void;
};

export function SettingsView({
  section,
  anchor = null,
  cwd,
  projectCwd,
  sessions,
  besideRail = false,
  onClose,
  onOpenSession,
  onArchiveSession,
  onDeleteSession,
  onRestoreProject,
  onDeleteProject,
  onOpenWhatsNew,
}: Props) {
  const lockOverscroll = useLockOverscroll<HTMLDivElement>();
  useEffect(() => {
    if (!anchor) return;
    document.getElementById(ANCHOR_IDS[anchor])?.scrollIntoView({
      block: "start",
    });
  }, [anchor]);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const appearance = useAppearanceSettings();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div
      role="region"
      aria-label="Settings"
      data-app-settings
      className="flex min-h-0 min-w-0 flex-1 flex-col text-content"
    >
      <div
        className="flex h-10 shrink-0 select-none items-center border-b border-content/10"
        data-tauri-drag-region="deep"
      >
        {IS_MAC && !besideRail ? <div className="w-[78px] shrink-0" /> : null}
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 text-[13px]">
          <span className="shrink-0 text-content/45">Settings</span>
          <span aria-hidden className="shrink-0 text-content/25">
            /
          </span>
          <span className="min-w-0 truncate text-content">
            {settingsSectionLabel(section)}
          </span>
        </div>
        {section === "appearance" ? (
          <button
            type="button"
            data-tauri-drag-region="false"
            onClick={appearance.restoreDefaults}
            className="mr-2 flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-content/50 hover:bg-content/10 hover:text-content"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
            Restore defaults
          </button>
        ) : null}
        {IS_MAC ? null : <WindowControls />}
      </div>

      <div
        ref={lockOverscroll}
        className="settings-body min-h-0 flex-1 overflow-y-auto overscroll-none"
      >
        <div className="mx-auto w-full max-w-5xl px-8 py-8">
          <PageHeader
            title={
              section === "keybindings" ? (
                <span className="flex items-center gap-2">
                  {settingsSectionLabel(section)}
                  <PkBadge />
                </span>
              ) : (
                settingsSectionLabel(section)
              )
            }
            description={settingsSectionDescription(section)}
          />
          {section === "general" ? (
            <GeneralPage onOpenWhatsNew={onOpenWhatsNew} />
          ) : null}
          {section === "appearance" ? (
            <AppearancePage appearance={appearance} />
          ) : null}
          {section === "keybindings" ? <KeybindingsPage /> : null}
          {section === "providers" ? <ProvidersPage /> : null}
          {section === "inbox" ? <InboxPage /> : null}
          {section === "skills" ? (
            <SkillsPage key={projectCwd ?? cwd} cwd={projectCwd ?? cwd} />
          ) : null}
          {section === "archive" ? (
            <ArchivePage
              cwd={cwd}
              sessions={sessions}
              onOpenSession={onOpenSession}
              onArchiveSession={onArchiveSession}
              onDeleteSession={onDeleteSession}
              onRestoreProject={onRestoreProject}
              onDeleteProject={onDeleteProject}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GeneralPage({ onOpenWhatsNew }: { onOpenWhatsNew: () => void }) {
  const [transcriptLayout, setTranscriptLayout] =
    useState<TranscriptLayout>(loadTranscriptLayout);
  const [transcriptAnchor, setTranscriptAnchor] =
    useState(loadTranscriptAnchor);
  const [diffViewer, setDiffViewer] = useState<DiffViewer>(loadDiffViewer);
  const [followUpBehavior, setFollowUpBehavior] =
    useState<FollowUpBehavior>(loadFollowUpBehavior);
  const [composerRunner, setComposerRunner] = useState(loadComposerRunner);
  const [gridArcadeEnabled, setGridArcadeEnabled] = useState(
    loadGridArcadeEnabled,
  );
  const [dockSide, setDockSide] = useState<TerminalPlacement>(
    loadDefaultTerminalPlacement,
  );
  const [usageDisplayMode, setUsageDisplayMode] =
    useState<UsageDisplayMode>(loadUsageDisplayMode);
  const [usageScope, setUsageScope] = useState<UsageScope>(loadUsageScope);
  const [usageWindowVisibility, setUsageWindowVisibility] =
    useState<UsageWindowVisibility>(loadUsageWindowVisibility);
  const [usageProviderOrder, setUsageProviderOrder] = useState(loadUsageProviderOrder);
  const [hiddenUsageProviders, setHiddenUsageProviders] = useState<string[]>(
    loadHiddenUsageProviders,
  );
  const [usageProviderList, setUsageProviderList] = useState<string[] | null>(
    null,
  );
  const [notesEnabled, setNotesEnabled] = useState(loadNotesEnabled);
  const [liveAgentsEnabled, setLiveAgentsEnabled] = useState(
    loadLiveAgentsEnabled,
  );
  const [soundsEnabled, setSoundsEnabled] = useState(loadSoundsEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    loadNotificationsEnabled,
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(cachedNotificationPermission);
  const [claudeHooks, setClaudeHooks] = useState(loadClaudeHooks);

  const [explorerShowChanges, setExplorerShowChanges] = useState(
    loadExplorerShowChanges,
  );
  const [explorerHighlightActions, setExplorerHighlightActions] = useState(
    loadExplorerHighlightActions,
  );
  const [busyGlowColor, setBusyGlowColor] = useState(loadBusyGlowColor);
  // The user may flip the switch in System Settings and come back: re-read
  // the OS state whenever the window regains focus while the toggle is on.
  useEffect(() => {
    if (!notificationsEnabled) return;
    const refresh = () => {
      void probeNotificationPermission().then(setNotificationPermission);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [notificationsEnabled]);

  useEffect(() => {
    const onAnchor = (event: Event) => {
      setTranscriptAnchor((event as CustomEvent<boolean>).detail === true);
    };
    window.addEventListener(TRANSCRIPT_ANCHOR_CHANGE_EVENT, onAnchor);
    return () => {
      window.removeEventListener(TRANSCRIPT_ANCHOR_CHANGE_EVENT, onAnchor);
    };
  }, []);

  const onTranscriptLayout = (next: TranscriptLayout) => {
    saveTranscriptLayout(next);
    setTranscriptLayout(next);
  };

  const onTranscriptAnchor = (next: boolean) => {
    saveTranscriptAnchor(next);
    setTranscriptAnchor(next);
  };

  const onDiffViewer = (next: DiffViewer) => {
    saveDiffViewer(next);
    setDiffViewer(next);
  };

  const onFollowUpBehavior = (next: FollowUpBehavior) => {
    saveFollowUpBehavior(next);
    setFollowUpBehavior(next);
  };

  const onComposerRunner = (next: boolean) => {
    saveComposerRunner(next);
    setComposerRunner(next);
  };

  const onGridArcadeEnabled = (next: boolean) => {
    saveGridArcadeEnabled(next);
    setGridArcadeEnabled(next);
  };

  const onNotesEnabled = (next: boolean) => {
    saveNotesEnabled(next);
    setNotesEnabled(next);
  };

  const onLiveAgentsEnabled = (next: boolean) => {
    saveLiveAgentsEnabled(next);
    setLiveAgentsEnabled(next);
  };

  const onSoundsEnabled = (next: boolean) => {
    saveSoundsEnabled(next);
    setSoundsEnabled(next);
  };

  const onNotificationsEnabled = (next: boolean) => {
    saveNotificationsEnabled(next);
    setNotificationsEnabled(next);
    if (!next) return;
    void requestNotificationPermission().then(setNotificationPermission);
  };

  const onClaudeHooks = (next: boolean) => {
    saveClaudeHooks(next);
    setClaudeHooks(next);
  };

  const onExplorerShowChanges = (next: boolean) => {
    saveExplorerShowChanges(next);
    setExplorerShowChanges(next);
  };

  const onExplorerHighlightActions = (next: boolean) => {
    saveExplorerHighlightActions(next);
    setExplorerHighlightActions(next);
  };

  const onBusyGlowColor = (next: string) => {
    saveBusyGlowColor(next);
    setBusyGlowColor(next);
  };

  const onDefaultDockSide = (next: TerminalPlacement) => {
    saveDefaultTerminalPlacement(next);
    setDockSide(next);
  };

  const onUsageDisplayMode = (next: UsageDisplayMode) => {
    saveUsageDisplayMode(next);
    setUsageDisplayMode(next);
  };

  const onUsageScope = (next: UsageScope) => {
    saveUsageScope(next);
    setUsageScope(next);
  };

  const onUsageWindowVisibility = (next: UsageWindowVisibility) => {
    saveUsageWindowVisibility(next);
    setUsageWindowVisibility(next);
  };

  const toggleUsageProvider = (id: string) => {
    const canonical = normalizeUsageProviderId(id);
    const next = hiddenUsageProviders.includes(canonical)
      ? hiddenUsageProviders.filter((entry) => entry !== canonical)
      : [...hiddenUsageProviders, canonical];
    saveHiddenUsageProviders(next);
    setHiddenUsageProviders(next);
  };

  const moveUsageProvider = (id: string, delta: -1 | 1) => {
    const index = usageProviderOrder.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= usageProviderOrder.length) return;
    const next = [...usageProviderOrder];
    [next[index], next[target]] = [next[target], next[index]];
    saveUsageProviderOrder(next);
    setUsageProviderOrder(next);
  };

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setUsageProviderList([...USAGE_PROVIDER_IDS]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Heading title="About" />
      <UpdateRow onOpenWhatsNew={onOpenWhatsNew} />

      <Row
        label="Transcript layout"
        description="Full width keeps user prompts as a spanning card. Chat aligns them to the right with a max width, like a messaging app."
      >
        <Segmented
          label="Transcript layout"
          value={transcriptLayout}
          options={[
            { value: "full", label: "Full width" },
            { value: "chat", label: "Chat" },
          ]}
          onChange={onTranscriptLayout}
        />
      </Row>
      <Row
        label="Diff view"
        description="Editor keeps working-tree changes in the file. Unified stacks every changed file in one review, with sticky headers and collapsed unchanged lines."
      >
        <Segmented
          label="Diff view"
          value={diffViewer}
          options={[
            { value: "editor", label: "Editor" },
            { value: "unified", label: "Unified" },
          ]}
          onChange={onDiffViewer}
        />
      </Row>
      <Row
        label="Terminal dock position"
        pk
        description="Where new project terminal docks open by default. Each dock can still be moved individually from its own header."
      >
        <Segmented
          label="Terminal dock position"
          value={dockSide}
          options={[
            { value: "bottom", label: "Bottom" },
            { value: "right", label: "Right" },
            { value: "left", label: "Left" },
            { value: "top", label: "Top" },
            { value: "tab", label: "Terminal tab" },
          ]}
          onChange={onDefaultDockSide}
        />
      </Row>
      <Row
        label="Usage display"
        pk
        description="Show provider quota as consumed or remaining capacity in the footer."
      >
        <Segmented
          label="Usage display"
          value={usageDisplayMode}
          options={[
            { value: "used", label: "Used" },
            { value: "remaining", label: "Remaining" },
          ]}
          onChange={onUsageDisplayMode}
        />
      </Row>
      <Row
        label="Usage providers"
        pk
        description="Footer chips: follow the current conversation's provider (Claude, Codex, ZAI, OpenCode Go…), or hand-pick the providers that always appear."
      >
        <div className="flex flex-col items-end gap-2">
          <Segmented
            label="Usage providers"
            value={usageScope}
            options={[
              { value: "active", label: "Current chat" },
              { value: "custom", label: "Choose" },
            ]}
            onChange={onUsageScope}
          />
          {(
            usageProviderList == null ? (
              <span className="text-[12px] text-content/45">
                Loading providers…
              </span>
            ) : (
              <div className="w-[min(360px,100%)] overflow-hidden rounded-xl border border-content/10 bg-content/[0.025]">
                <div className="flex items-center justify-between border-b border-content/10 px-3 py-2">
                  <span className="text-[11px] font-medium text-content/65">Providers affichés</span>
                  <span className="text-[10px] text-content/35">ordre de la barre quota</span>
                </div>
                {usageProviderList
                  .slice()
                  .sort((a, b) => usageProviderOrder.indexOf(a) - usageProviderOrder.indexOf(b))
                  .map((id) => {
                  const canonicalId = normalizeUsageProviderId(id);
                  const visible = !hiddenUsageProviders.includes(canonicalId);
                  const position = usageProviderOrder.indexOf(canonicalId);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 border-b border-content/7 px-2 py-1.5 last:border-b-0"
                    >
                      <button
                        type="button"
                        aria-pressed={visible}
                        onClick={() => toggleUsageProvider(canonicalId)}
                        className={`grid size-6 shrink-0 place-items-center rounded-md border transition-colors ${
                          visible
                            ? "border-accent/40 bg-accent/15 text-accent"
                            : "border-content/15 text-transparent hover:border-content/30"
                        }`}
                        title={visible ? "Masquer ce provider" : "Afficher ce provider"}
                      >
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </button>
                      <span className={`min-w-0 flex-1 truncate text-left text-[12px] ${visible ? "text-content" : "text-content/40"}`}>
                        {usageProviderLabel(canonicalId)}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-content/25">{position + 1}</span>
                      <div className="flex shrink-0 gap-0.5">
                        <button
                          type="button"
                          aria-label={`Monter ${usageProviderLabel(canonicalId)}`}
                          disabled={position <= 0}
                          onClick={() => moveUsageProvider(canonicalId, -1)}
                          className="grid size-6 place-items-center rounded-md text-content/45 hover:bg-content/10 hover:text-content disabled:opacity-20"
                        ><ChevronUp className="size-3.5" /></button>
                        <button
                          type="button"
                          aria-label={`Descendre ${usageProviderLabel(canonicalId)}`}
                          disabled={position < 0 || position >= usageProviderOrder.length - 1}
                          onClick={() => moveUsageProvider(canonicalId, 1)}
                          className="grid size-6 place-items-center rounded-md text-content/45 hover:bg-content/10 hover:text-content disabled:opacity-20"
                        ><ChevronDown className="size-3.5" /></button>
                      </div>
                    </div>
                  );
                  })}
              </div>
            )
          )}
        </div>
      </Row>
      <Row
        label="Usage windows"
        pk
        description="Choose which quota window is shown in the footer. Hover a provider to see every available window, including monthly data."
      >
        <Segmented
          label="Usage windows"
          value={usageWindowVisibility}
          options={[
            { value: "session", label: "5 hours" },
            { value: "weekly", label: "Weekly" },
            { value: "all", label: "All" },
          ]}
          onChange={onUsageWindowVisibility}
        />
      </Row>
      <Row
        label="Follow-up behavior"
        description="Queue follow-ups until the active turn finishes, or steer the active turn immediately."
      >
        <Segmented
          label="Follow-up behavior"
          value={followUpBehavior}
          options={[
            { value: "queue", label: "Queue" },
            { value: "steer", label: "Steer" },
            { value: "choice", label: "Let me choose" },
          ]}
          onChange={onFollowUpBehavior}
        />
      </Row>
      <Row
        label="Anchor prompts to top"
        description="When you send, the new prompt sits at the top of the transcript and the reply grows into the space below. Turn this off to keep the classic layout, with the latest message resting on the composer."
      >
        <Toggle
          label="Anchor prompts to top"
          on={transcriptAnchor}
          onChange={onTranscriptAnchor}
        />
      </Row>
      <Row
        label="Composer mascot"
        description="When a turn is running, the project mascot runs along the composer, bonks the scroll-to-latest button the first time, then jumps it, and sometimes grabs a coin."
      >
        <Toggle
          label="Composer mascot"
          on={composerRunner}
          onChange={onComposerRunner}
        />
      </Row>
      <Row
        label="Empty session games"
        description="Pac-man and snake idle on the empty-session grid. Hover the band to take control of whichever is on screen. Turn this off to keep the pane still."
      >
        <Toggle
          label="Empty session games"
          on={gridArcadeEnabled}
          onChange={onGridArcadeEnabled}
        />
      </Row>
      <Row
        label="Notes"
        description="A global markdown notebook on the project rail. Save a finished turn from the transcript, then mention it later with @note or add it to chat. Turn this off to hide Notes from the UI."
      >
        <Toggle label="Notes" on={notesEnabled} onChange={onNotesEnabled} />
      </Row>
      <Row
        label="Working agents"
        description="When two or more chats are in flight, a card on the project rail lists them so you can jump across projects. Finished turns stay until you open that session. Turn this off to hide the card."
      >
        <Toggle
          label="Working agents"
          on={liveAgentsEnabled}
          onChange={onLiveAgentsEnabled}
        />
      </Row>
      <Row
        label="Working glow color"
        pk
        description="Highlight color of the light sweep on project titles while an agent works on them. Theme follows the accent of the current theme."
      >
        <div className="flex flex-wrap justify-end gap-1.5">
          {BUSY_GLOW_PRESETS.map((preset) => {
            const selected = busyGlowColor === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={selected}
                title={preset.label}
                aria-label={`${preset.label} glow`}
                onClick={() => onBusyGlowColor(preset.value)}
                className={`grid size-6 place-items-center rounded-md border transition-colors ${
                  selected
                    ? "border-accent/60"
                    : "border-content/15 hover:border-content/35"
                }`}
              >
                {preset.value ? (
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: preset.value }}
                  />
                ) : (
                  <span className="text-[9px] font-medium text-content/45">
                    auto
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Row>
      <Row
        label="Sounds"
        description="Short cues when a turn finishes, the agent asks a question or approval, a new inbox item appears on the project rail, or an update is available. Switches and Copy on a finished turn also play."
      >
        <Toggle label="Sounds" on={soundsEnabled} onChange={onSoundsEnabled} />
      </Row>
      <Row
        label="Notifications"
        description="Notify when an agent finishes or needs input in another session or while MonoCode is in the background. Click the notification to open that session."
      >
        {notificationsEnabled && notificationPermission === "denied" ? (
          <NotificationsBlocked />
        ) : null}
        {notificationsEnabled && notificationPermission === "unsupported" ? (
          <span className="text-[12px] text-content/45">
            Not available on this platform
          </span>
        ) : null}
        <Toggle
          label="Notifications"
          on={notificationsEnabled}
          onChange={onNotificationsEnabled}
        />
      </Row>
      <Row
        label="Claude Code hooks"
        description="Run the hooks configured in your settings.json files — PreToolUse command rewrites, blocks, notifications, and the rest — just as the Claude Code CLI would. Turn this off if a hook is misbehaving and you need the session back. Takes effect on the next turn."
      >
        <Toggle
          label="Claude Code hooks"
          on={claudeHooks}
          onChange={onClaudeHooks}
        />
      </Row>

      <Heading title="Explorer" />
      <Row
        label="Changes button"
        pk
        description="The Source Control tab already lists file changes. Turn this off to hide the duplicate Changes button from the Explorer header."
      >
        <Toggle
          label="Changes button"
          on={explorerShowChanges}
          onChange={onExplorerShowChanges}
        />
      </Row>
      <Row
        label="Highlight custom actions"
        pk
        description="Tint the Reveal and Initialize project buttons with the PK accent color so they stand out in the Explorer header."
      >
        <Toggle
          label="Highlight custom actions"
          on={explorerHighlightActions}
          onChange={onExplorerHighlightActions}
        />
      </Row>
    </>
  );
}

function InboxPage() {
  return (
    <>
      <Heading title="GitHub" id={ANCHOR_IDS.github} first />
      <GithubSettings />

      <Heading title="GitLab" id={ANCHOR_IDS.gitlab} />
      <GitlabSettings />

      <Heading title="Linear" id={ANCHOR_IDS.linear} />
      <LinearSettings />
    </>
  );
}

function GithubSettings() {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const checkStatus = useCallback(async () => {
    const generation = ++request.current;
    setChecking(true);
    setError(null);
    try {
      const next = await githubStatus();
      if (generation === request.current) setStatus(next);
    } catch (err: unknown) {
      if (generation === request.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      if (generation === request.current) setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
    return () => {
      request.current += 1;
    };
  }, [checkStatus]);

  const description = status?.connected
    ? "GitHub CLI is installed and authenticated. MonoCode uses it for GitHub inbox items."
    : status?.installed
      ? "Run gh auth login in a terminal, complete the sign-in flow, then check again."
      : "Install GitHub CLI from cli.github.com, run gh auth login in a terminal, then check again.";
  const label = checking
    ? "Checking"
    : status?.connected
      ? "Connected"
      : status?.installed
        ? "Sign in required"
        : "Not installed";

  return (
    <>
      <Row
        label={
          <span className="flex items-center gap-2">
            <InboxProviderMark provider="github" className="size-4 shrink-0" />
            Connection
          </span>
        }
        description={description}
      >
        <span className="text-[12px] text-content/50">{label}</span>
        {!checking && !status?.installed ? (
          <SecondaryButton
            onClick={() => {
              void openUrl("https://cli.github.com/").catch(() => {});
            }}
          >
            Installation guide
          </SecondaryButton>
        ) : null}
        <SecondaryButton onClick={() => void checkStatus()} disabled={checking}>
          {checking ? "Checking" : "Check again"}
        </SecondaryButton>
      </Row>
      {error ? (
        <p className="pb-2 text-[12px] text-red-400/90">{error}</p>
      ) : null}
    </>
  );
}

function GitlabSettings() {
  const [url, setUrl] = useState("https://gitlab.com");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void gitlabConnected()
      .then((status) => {
        if (cancelled) return;
        setConnected(status.connected);
        setUrl(status.url);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = async () => {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const status = await saveGitlabConfig(url, token);
      setUrl(status.url);
      setToken("");
      setConnected(status.connected);
      clearInboxCache();
    } catch (err: unknown) {
      setConnected(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const status = await disconnectGitlab(url);
      setConnected(false);
      setUrl(status.url);
      clearInboxCache();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Row
        label={
          <span className="flex items-center gap-2">
            <InboxProviderMark provider="gitlab" className="size-4 shrink-0" />
            Connection
          </span>
        }
        description="Connect GitLab.com or a self-managed GitLab instance. Use a personal access token with API access; the token is stored locally and Disconnect deletes it."
      >
        {connected ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="max-w-56 truncate text-[12px] text-content/50">
              {url}
            </span>
            <SecondaryButton
              onClick={() => void onDisconnect()}
              disabled={busy}
            >
              Disconnect
            </SecondaryButton>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <label className="flex h-7 w-52 shrink-0 items-center rounded-md border border-content/10 px-2 focus-within:border-content/20">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://gitlab.com"
                aria-label="GitLab URL"
                autoComplete="url"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-content/35"
              />
            </label>
            <label className="flex h-7 w-52 shrink-0 items-center rounded-md border border-content/10 px-2 focus-within:border-content/20">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void onSave();
                }}
                placeholder="glpat-…"
                aria-label="GitLab access token"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-content/35"
              />
            </label>
            <SecondaryButton
              onClick={() => void onSave()}
              disabled={busy || !token.trim()}
            >
              {busy ? "Saving" : "Connect"}
            </SecondaryButton>
          </div>
        )}
      </Row>
      {error ? (
        <p className="pb-2 text-[12px] text-red-400/90">{error}</p>
      ) : null}
    </>
  );
}

function LinearSettings() {
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [hiddenTeamIds, setHiddenTeamIds] = useState(loadHiddenLinearTeamIds);

  const loadTeams = useCallback(async () => {
    try {
      const next = await listLinearTeams();
      setTeams(next);
    } catch {
      setTeams([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void linearConnected().then((status) => {
      if (cancelled) return;
      setConnected(status.connected);
      if (status.connected) void loadTeams();
    });
    return () => {
      cancelled = true;
    };
  }, [loadTeams]);

  // The inbox filter menu writes the same list, so follow it while both are mounted.
  useEffect(() => {
    const onChange = () => setHiddenTeamIds(loadHiddenLinearTeamIds());
    window.addEventListener(LINEAR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LINEAR_CHANGE_EVENT, onChange);
  }, []);

  const onSave = async () => {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveLinearToken(token);
      setToken("");
      setConnected(true);
      clearInboxCache();
      notifyLinearChange();
      await loadTeams();
    } catch (err: unknown) {
      setConnected(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await disconnectLinear();
      setConnected(false);
      setTeams([]);
      clearInboxCache();
      notifyLinearChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleTeam = (id: string) => {
    const next = new Set(hiddenTeamIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const ids = [...next];
    setHiddenTeamIds(ids);
    saveHiddenLinearTeamIds(ids);
    clearInboxCache();
  };

  return (
    <>
      <Row
        label={
          <span className="flex items-center gap-2">
            <InboxProviderMark provider="linear" className="size-4 shrink-0" />
            API key
          </span>
        }
        description="Create a personal API key in Linear → Settings → Security & Access. Disconnect deletes it."
      >
        {connected ? (
          <SecondaryButton onClick={() => void onDisconnect()} disabled={busy}>
            Disconnect
          </SecondaryButton>
        ) : (
          <div className="flex items-center gap-2">
            <label className="flex h-7 w-52 shrink-0 items-center rounded-md border border-content/10 px-2 focus-within:border-content/20">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void onSave();
                }}
                placeholder="lin_api_…"
                aria-label="Linear API key"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-content/35"
              />
            </label>
            <SecondaryButton
              onClick={() => void onSave()}
              disabled={busy || !token.trim()}
            >
              {busy ? "Saving" : "Connect"}
            </SecondaryButton>
          </div>
        )}
      </Row>
      {error ? (
        <p className="pb-2 text-[12px] text-red-400/90">{error}</p>
      ) : null}
      {connected && teams.length > 0 ? (
        <div className="border-b border-content/5 py-4">
          <div className="text-[13px] font-medium text-content">
            Linear Teams
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-content/45">
            Unchecked teams stay out of the inbox.
          </p>
          <div className="mt-3 flex flex-col gap-0.5 -mx-2">
            {teams.map((team) => {
              const checked = !hiddenTeamIds.includes(team.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => toggleTeam(team.id)}
                  className="flex h-7 items-center gap-2 rounded-md px-2 text-left text-[13px] text-content hover:bg-content/5"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {team.name}
                    {team.key ? (
                      <span className="ml-1.5 text-content/40">{team.key}</span>
                    ) : null}
                  </span>
                  {checked ? (
                    <Check className="size-3.5 shrink-0" strokeWidth={2.25} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function UpdateRow({ onOpenWhatsNew }: { onOpenWhatsNew: () => void }) {
  const variant = usePkVariant();
  const [snapshot, setSnapshot] = useState<UpdaterSnapshot>({
    phase: "idle",
    currentVersion: "…",
  });

  useEffect(() => {
    let cancelled = false;
    void readAppVersion().then((currentVersion) => {
      if (cancelled) return;
      setSnapshot((current) => ({ ...current, currentVersion }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const busy =
    snapshot.phase === "checking" || snapshot.phase === "downloading";
  const hasUpdate = snapshot.phase === "available";

  const onClick = async () => {
    if (busy) return;
    if (hasUpdate) {
      await installPendingUpdate(setSnapshot);
      return;
    }
    await runUpdateFlow(true, setSnapshot);
  };

  const status =
    snapshot.phase === "available"
      ? `Official MonoCode ${snapshot.availableVersion} is available.`
      : snapshot.phase === "downloading"
        ? `Downloading${snapshot.progress != null ? ` ${snapshot.progress}%` : "…"}`
        : snapshot.phase === "checking"
          ? "Checking official MonoCode and MonoCodePK updates…"
          : snapshot.phase === "current"
            ? "Official MonoCode and MonoCodePK are up to date."
            : snapshot.phase === "error"
              ? (snapshot.error ?? "Update check failed.")
              : "Checks official MonoCode releases and MonoCodePK updates.";

  return (
    <Row
      pk
      label={
        <span className="flex flex-col gap-0.5">
          <span>
            MonoCode
            <span className="ml-2 font-mono text-[12px] text-content/45">
              {snapshot.currentVersion}
            </span>
          </span>
          <span>
            <span className="flex items-center gap-2">
              MonoCodePK
              <span className="ml-2 font-mono text-[12px] text-accent/75">
                {PK_VERSION}
              </span>
              {variant === "dev" ? (
                <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
                  DEV
                </span>
              ) : null}
            </span>
          </span>
        </span>
      }
      description={status}
    >
      <div className="flex items-center gap-2">
        <SecondaryButton
          onClick={() => onOpenWhatsNew()}
          disabled={snapshot.currentVersion === "…"}
        >
          What's new
        </SecondaryButton>
        <SecondaryButton onClick={() => void onClick()} disabled={busy}>
          {busy ? (
            <Loader className="size-3.5 animate-spin" aria-hidden />
          ) : hasUpdate ? (
            <ArrowDownCircle className="size-3.5 text-accent" aria-hidden />
          ) : (
            <RefreshCw className="size-3.5" strokeWidth={1.75} aria-hidden />
          )}
          {hasUpdate ? "Download" : "Check for updates"}
        </SecondaryButton>
      </div>
    </Row>
  );
}

type AppearanceSettings = ReturnType<typeof useAppearanceSettings>;

function useAppearanceSettings() {
  const [themePreset, setThemePreset] = useState<ThemePreset>(loadThemePreset);
  const [themePreference, setThemePreference] =
    useState<ThemePreference>(loadThemePreference);
  const [opacity, setOpacity] = useState(loadSidebarOpacity);
  const [blur, setBlur] = useState(loadSidebarBlur);
  const [themeHue, setThemeHue] = useState(loadThemeHue);
  const [themeSaturation, setThemeSaturation] = useState(loadThemeSaturation);
  const [bodyGlass, setBodyGlass] = useState(loadBodyGlass);
  const [chatBackgroundPath, setChatBackgroundPath] = useState(
    loadChatBackgroundPath,
  );
  const [chatBackgroundOpacity, setChatBackgroundOpacity] = useState(
    loadChatBackgroundOpacity,
  );
  const [chatBackgroundScope, setChatBackgroundScope] =
    useState<ChatBackgroundScope>(loadChatBackgroundScope);
  const [backgroundPanels, setBackgroundPanels] =
    useState<Record<BackgroundPanel, boolean>>(loadBackgroundPanels);
  const [chatBackgroundBusy, setChatBackgroundBusy] = useState(false);
  const [chatBackgroundError, setChatBackgroundError] = useState<string | null>(
    null,
  );
  const [uiScale, setUiScale] = useState(loadUiScale);

  useEffect(() => subscribeUiScale(() => setUiScale(loadUiScale())), []);

  const onThemePreference = useCallback((next: ThemePreference) => {
    applyThemePreference(next);
    saveThemePreference(next);
    setThemePreference(next);
  }, []);

  const onThemePreset = useCallback(
    (next: ThemePreset) => {
      // Catppuccin Latte is a light flavor: pair it with the light scheme so
      // the palette reads correctly instead of washing over a dark canvas.
      if (next === "catppuccin-latte") {
        applyThemePreference("light");
        saveThemePreference("light");
        setThemePreference("light");
      }
      applyThemePreset(next);
      saveThemePreset(next);
      setThemePreset(next);
    },
    [setThemePreference],
  );

  const onOpacity = useCallback((percent: number) => {
    const next = applySidebarOpacity(percent / 100);
    saveSidebarOpacity(next);
    setOpacity(next);
  }, []);

  const onBlur = useCallback((radius: number) => {
    const next = applySidebarBlur(radius);
    saveSidebarBlur(next);
    setBlur(next);
  }, []);

  const onTint = useCallback((hue: number, saturation: number) => {
    const next = applyThemeTint(hue, saturation);
    saveThemeHue(next.hue);
    saveThemeSaturation(next.saturation);
    setThemeHue(next.hue);
    setThemeSaturation(next.saturation);
  }, []);

  const onBodyGlass = useCallback((next: boolean) => {
    applyBodyGlass(next);
    saveBodyGlass(next);
    setBodyGlass(next);
  }, []);

  const onChooseChatBackground = useCallback(async () => {
    setChatBackgroundBusy(true);
    setChatBackgroundError(null);
    try {
      const path = await pickAndSaveChatBackground();
      if (!path) return;
      saveChatBackgroundPath(path);
      applyChatBackground(path);
      setChatBackgroundPath(path);
    } catch (error) {
      setChatBackgroundError(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setChatBackgroundBusy(false);
    }
  }, []);

  const onClearChatBackground = useCallback(async () => {
    setChatBackgroundBusy(true);
    setChatBackgroundError(null);
    try {
      await removeChatBackground();
      saveChatBackgroundPath(null);
      applyChatBackground(null);
      setChatBackgroundPath(null);
    } catch (error) {
      setChatBackgroundError(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setChatBackgroundBusy(false);
    }
  }, []);

  const onChatBackgroundOpacity = useCallback((percent: number) => {
    const next = applyChatBackgroundOpacity(percent / 100);
    saveChatBackgroundOpacity(next);
    setChatBackgroundOpacity(next);
  }, []);

  const onChatBackgroundScope = useCallback((next: ChatBackgroundScope) => {
    applyChatBackgroundScope(next);
    saveChatBackgroundScope(next);
    setChatBackgroundScope(next);
  }, []);

  const onBackgroundPanel = useCallback(
    (panel: BackgroundPanel, value: boolean) => {
      const next = { ...loadBackgroundPanels(), [panel]: value };
      applyBackgroundPanels(next);
      saveBackgroundPanels(next);
      setBackgroundPanels(next);
    },
    [],
  );

  const onUiScale = useCallback((percent: number) => {
    const next = saveUiScale(percent / 100);
    setUiScale(next);
    void applyUiScale(next);
  }, []);

  const restoreDefaults = useCallback(() => {
    onThemePreference(THEME_PREFERENCE_DEFAULT);
    onThemePreset("default");
    onOpacity(Math.round(SIDEBAR_OPACITY_DEFAULT * 100));
    onBlur(SIDEBAR_BLUR_DEFAULT);
    onTint(THEME_HUE_DEFAULT, THEME_SATURATION_DEFAULT);
    onBodyGlass(BODY_GLASS_DEFAULT);
    onChatBackgroundOpacity(Math.round(CHAT_BACKGROUND_OPACITY_DEFAULT * 100));
    onChatBackgroundScope(CHAT_BACKGROUND_SCOPE_DEFAULT);
    onBackgroundPanel("chat", true);
    onBackgroundPanel("workspace", false);
    onBackgroundPanel("terminal", false);
    if (chatBackgroundPath) void onClearChatBackground();
    onUiScale(Math.round(UI_SCALE_DEFAULT * 100));
  }, [
    chatBackgroundPath,
    onBlur,
    onBodyGlass,
    onChatBackgroundOpacity,
    onChatBackgroundScope,
    onClearChatBackground,
    onThemePreference,
    onThemePreset,
    onOpacity,
    onTint,
    onUiScale,
  ]);

  return {
    themePreference,
    themePreset,
    opacity,
    blur,
    themeHue,
    themeSaturation,
    bodyGlass,
    chatBackgroundPath,
    chatBackgroundOpacity,
    chatBackgroundScope,
    backgroundPanels,
    chatBackgroundBusy,
    chatBackgroundError,
    uiScale,
    onThemePreference,
    onThemePreset,
    onOpacity,
    onBlur,
    onTint,
    onBodyGlass,
    onChooseChatBackground,
    onClearChatBackground,
    onChatBackgroundOpacity,
    onChatBackgroundScope,
    onBackgroundPanel,
    onUiScale,
    restoreDefaults,
  };
}

function AppearancePage({ appearance }: { appearance: AppearanceSettings }) {
  const percent = Math.round(appearance.opacity * 100);
  const glassDisabled = useColorScheme() === "light";

  return (
    <>
      <Row
        label="Theme"
        description="System follows the OS appearance. Dark and light share the same tint, so the hue below applies to both."
      >
        <Segmented
          label="Theme"
          value={appearance.themePreference}
          options={[
            { value: "system", label: "System" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
          onChange={appearance.onThemePreference}
        />
      </Row>
      <Row
        label="Theme preset"
        pk
        description="Personal color palettes for MonoCode."
      >
        <Segmented
          label="Theme preset"
          value={appearance.themePreset}
          options={[
            { value: "default", label: "Default" },
            { value: "dracula", label: "Dracula" },
            { value: "catppuccin-frappe", label: "Frappé" },
            { value: "catppuccin-latte", label: "Latte" },
            { value: "catppuccin-macchiato", label: "Macchiato" },
            { value: "catppuccin-mocha", label: "Mocha" },
          ]}
          onChange={appearance.onThemePreset}
        />
      </Row>
      <Row
        label="Sidebar opacity"
        description={
          glassDisabled
            ? "Light mode always uses an opaque window. Your dark-mode value is preserved."
            : "How much of the desktop shows through the sidebar and the project rail."
        }
      >
        <Slider
          label="Sidebar opacity"
          value={percent}
          display={`${percent}%`}
          min={Math.round(SIDEBAR_OPACITY_MIN * 100)}
          max={Math.round(SIDEBAR_OPACITY_MAX * 100)}
          onChange={appearance.onOpacity}
          disabled={glassDisabled}
        />
      </Row>
      <Row
        label="Blur radius"
        description={
          glassDisabled
            ? "Background blur is unavailable while light mode uses an opaque window."
            : "Background blur behind the window. Higher values cost more to composite."
        }
      >
        <Slider
          label="Blur radius"
          value={appearance.blur}
          display={String(appearance.blur)}
          min={SIDEBAR_BLUR_MIN}
          max={SIDEBAR_BLUR_MAX}
          onChange={appearance.onBlur}
          disabled={glassDisabled}
        />
      </Row>
      <Row label="Hue" description="Base hue for accents and tinted surfaces.">
        <Slider
          label="Hue"
          value={appearance.themeHue}
          display={`${appearance.themeHue}°`}
          min={THEME_HUE_MIN}
          max={THEME_HUE_MAX}
          onChange={(value) =>
            appearance.onTint(value, appearance.themeSaturation)
          }
        />
      </Row>
      <Row
        label="Saturation"
        description="How strongly the hue tints the interface. Zero keeps it neutral."
      >
        <Slider
          label="Saturation"
          value={appearance.themeSaturation}
          display={`${appearance.themeSaturation}%`}
          min={THEME_SATURATION_MIN}
          max={THEME_SATURATION_MAX}
          onChange={(value) => appearance.onTint(appearance.themeHue, value)}
        />
      </Row>
      <Row
        label="Main pane glass"
        description={
          glassDisabled
            ? "Main pane glass is unavailable while light mode uses an opaque window."
            : "Extend the translucent treatment to the main pane behind sessions and editors."
        }
      >
        <Toggle
          label="Main pane glass"
          on={appearance.bodyGlass}
          onChange={appearance.onBodyGlass}
          disabled={glassDisabled}
        />
      </Row>
      <ChatBackgroundCard appearance={appearance} />
      <Row
        label="Interface scale"
        description="Zoom the whole interface. You can also use Ctrl+=, Ctrl+-, and Ctrl+0 (Cmd on macOS)."
      >
        <Slider
          label="Interface scale"
          value={Math.round(appearance.uiScale * 100)}
          display={`${Math.round(appearance.uiScale * 100)}%`}
          min={Math.round(UI_SCALE_MIN * 100)}
          max={Math.round(UI_SCALE_MAX * 100)}
          step={10}
          onChange={appearance.onUiScale}
        />
      </Row>
    </>
  );
}

function ChatBackgroundCard({
  appearance,
}: {
  appearance: AppearanceSettings;
}) {
  const src = chatBackgroundSrc(appearance.chatBackgroundPath);
  const hasImage = Boolean(appearance.chatBackgroundPath && src);
  const visibility = Math.round(appearance.chatBackgroundOpacity * 100);
  const busy = appearance.chatBackgroundBusy;

  return (
    <div className="border-b border-content/5 py-4 last:border-b-0">
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-content">
            Chat background
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-content/45">
            An image behind your chat panes. It stays on this device.
          </p>
        </div>
        {hasImage ? (
          <div className="flex shrink-0 items-center gap-2">
            <SecondaryButton
              onClick={() => void appearance.onChooseChatBackground()}
              disabled={busy}
            >
              {busy ? (
                <Loader className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              Change
            </SecondaryButton>
            <SecondaryButton
              onClick={() => void appearance.onClearChatBackground()}
              disabled={busy}
              danger
            >
              Remove
            </SecondaryButton>
          </div>
        ) : null}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-content/10">
        {hasImage ? (
          <div className="relative h-36">
            <img
              src={src ?? undefined}
              alt=""
              draggable={false}
              className="size-full object-cover"
              style={{ opacity: appearance.chatBackgroundOpacity }}
            />
            <span className="pointer-events-none absolute bottom-2 left-2 text-[11px] text-content/40">
              Preview at {visibility}%
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void appearance.onChooseChatBackground()}
            disabled={busy}
            className="flex h-36 w-full flex-col items-center justify-center gap-2 text-content/40 hover:bg-content/5 hover:text-content/70 disabled:cursor-default disabled:opacity-40"
          >
            {busy ? (
              <Loader className="size-5 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-5" aria-hidden />
            )}
            <span className="text-[12px]">Choose an image</span>
          </button>
        )}
        {hasImage ? (
          <div className="border-t border-content/8">
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[12px] text-content">Show on</div>
                <p className="text-[11px] text-content/40">
                  Empty sessions only, or every conversation.
                </p>
              </div>
              <Segmented
                label="Show background on"
                value={appearance.chatBackgroundScope}
                options={[
                  { value: "empty", label: "Empty only" },
                  { value: "all", label: "All sessions" },
                ]}
                onChange={appearance.onChatBackgroundScope}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-content/5 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[12px] text-content">Panels</div>
                <p className="text-[11px] text-content/40">
                  Extend the image to the workspace panes and terminals.
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {(["chat", "workspace", "terminal"] as BackgroundPanel[]).map(
                  (panel) => {
                    const on = appearance.backgroundPanels[panel];
                    return (
                      <button
                        key={panel}
                        type="button"
                        aria-pressed={on}
                        onClick={() => appearance.onBackgroundPanel(panel, !on)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] leading-none transition-colors ${
                          on
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-content/15 text-content/45 hover:text-content"
                        }`}
                      >
                        {on ? (
                          <Check className="size-3" strokeWidth={2.25} />
                        ) : null}
                        {panel === "workspace"
                          ? "Workspace"
                          : panel === "terminal"
                            ? "Terminal"
                            : "Chat"}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-content/5 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[12px] text-content">Visibility</div>
                <p className="text-[11px] text-content/40">
                  Keep it subtle so long conversations stay readable.
                </p>
              </div>
              <Slider
                label="Background visibility"
                value={visibility}
                display={`${visibility}%`}
                min={Math.round(CHAT_BACKGROUND_OPACITY_MIN * 100)}
                max={Math.round(CHAT_BACKGROUND_OPACITY_MAX * 100)}
                onChange={appearance.onChatBackgroundOpacity}
              />
            </div>
          </div>
        ) : null}
      </div>
      {appearance.chatBackgroundError ? (
        <p className="mt-2 text-[12px] text-red-400">
          {appearance.chatBackgroundError}
        </p>
      ) : null}
    </div>
  );
}

function CustomProvidersSection() {
  const [providers, setProviders] = useState(loadCustomProviders);
  const [draft, setDraft] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
  });
  const [draftError, setDraftError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [probes, setProbes] = useState<Record<string, CustomProviderProbe>>({});

  useEffect(() => {
    setProviders(loadCustomProviders());
  }, []);

  const testProbe = async (
    id: string,
    baseUrl: string,
    apiKey: string,
  ): Promise<CustomProviderProbe | null> => {
    setBusyId(id);
    try {
      const probe = await invoke<CustomProviderProbe>("custom_provider_test", {
        baseUrl,
        apiKey,
      });
      setProbes((current) => ({ ...current, [id]: probe }));
      return probe;
    } catch (error) {
      setProbes((current) => ({
        ...current,
        [id]: {
          ok: false,
          status: 0,
          models: [],
          error: error instanceof Error ? error.message : String(error),
        },
      }));
      return null;
    } finally {
      setBusyId(null);
    }
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    const baseUrl = draft.baseUrl.trim().replace(/\/+$/, "");
    if (!name || !baseUrl) {
      setDraftError("Name and endpoint are required.");
      return;
    }
    setBusyId("draft");
    const probe =
      (await testProbe(slugCustomProviderId(name), baseUrl, draft.apiKey)) ??
      null;
    if (!probe || !probe.ok) {
      setBusyId(null);
      return;
    }
    const entry: CustomProvider = {
      id: slugCustomProviderId(name),
      name,
      baseUrl,
      apiKey: draft.apiKey,
      models: probe.models,
    };
    ensureOpenCodeProviderRegistered(entry.id as HarnessId);
    void refreshHarnessCatalogs([entry.id as HarnessId]);
    setProviders(upsertCustomProvider(entry));
    setDraft({ name: "", baseUrl: "", apiKey: "" });
    setBusyId(null);
  };

  const retestSaved = async (entry: CustomProvider) => {
    const probe = await testProbe(entry.id, entry.baseUrl, entry.apiKey);
    if (probe?.ok) {
      setProviders(upsertCustomProvider({ ...entry, models: probe.models }));
    }
  };

  const remove = (id: string) => {
    setProviders(deleteCustomProvider(id));
  };

  return (
    <section className="border-b border-content/5 py-4 last:border-b-0">
      <div className="flex items-center gap-2 text-[13px] font-medium text-content">
        Custom providers
        <PkBadge />
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-content/45">
        OpenAI-compatible endpoints run through the OpenCode runtime: save a
        provider, and its models appear in the OpenCode tab of the model picker.
        Keys stay on this device and are written to OpenCode's config.
      </p>

      <div className="mt-3 space-y-2">
        {providers.length === 0 ? (
          <p className="rounded-md border border-dashed border-content/10 px-3 py-2 text-[11px] text-content/40">
            No custom provider yet.
          </p>
        ) : (
          providers.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-content/10 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-content">
                  {entry.name}
                </span>
                <span
                  className="shrink-0 font-mono text-[10px] text-content/35"
                  title={entry.baseUrl}
                >
                  {customProviderTestLabel(probes[entry.id] ?? null) ??
                    `${entry.models.length} model${entry.models.length === 1 ? "" : "s"}`}
                </span>
                <SecondaryButton
                  onClick={() => void retestSaved(entry)}
                  disabled={busyId === entry.id}
                >
                  {busyId === entry.id ? (
                    <Loader className="size-3 animate-spin" aria-hidden />
                  ) : null}
                  Test
                </SecondaryButton>
                <SecondaryButton danger onClick={() => remove(entry.id)}>
                  Remove
                </SecondaryButton>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] text-content/35">
                {entry.baseUrl} · {entry.models.join(", ") || "no models yet"}
              </p>
            </div>
          ))
        )}

        <div className="rounded-lg border border-content/10 px-3 py-2.5">
          <div className="grid gap-2">
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Name — e.g. Acme AI"
              aria-label="Custom provider name"
              className="rounded-md border border-content/10 bg-content/5 px-2 py-1.5 text-[12px] text-content outline-none placeholder:text-content/30 focus:border-accent/45"
            />
            <input
              value={draft.baseUrl}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, baseUrl: event.target.value }))
              }
              placeholder="Endpoint — https://api.example.com/v1"
              aria-label="Custom provider endpoint"
              spellCheck={false}
              className="rounded-md border border-content/10 bg-content/5 px-2 py-1.5 font-mono text-[11px] text-content outline-none placeholder:text-content/30 focus:border-accent/45"
            />
            <input
              value={draft.apiKey}
              type="password"
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, apiKey: event.target.value }))
              }
              placeholder="API key"
              aria-label="Custom provider API key"
              spellCheck={false}
              autoComplete="off"
              className="rounded-md border border-content/10 bg-content/5 px-2 py-1.5 font-mono text-[11px] text-content outline-none placeholder:text-content/30 focus:border-accent/45"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            {draftError ? (
              <span className="text-[12px] text-red-400">{draftError}</span>
            ) : null}
            <div className="flex items-center gap-2">
              <SecondaryButton
                onClick={() => void saveDraft()}
                disabled={
                  busyId === "draft" ||
                  !draft.name.trim() ||
                  !draft.baseUrl.trim()
                }
              >
                {busyId === "draft" ? (
                  <Loader className="size-3 animate-spin" aria-hidden />
                ) : null}
                Test & save
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function KeybindingsPage() {
  const [query, setQuery] = useState("");
  const [version, setVersion] = useState(0);
  const [capturingId, setCapturingId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(
    () => subscribeKeybindings(() => setVersion((value) => value + 1)),
    [],
  );

  useEffect(() => {
    if (!capturingId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setCapturingId(null);
        return;
      }
      if (
        event.key === "Backspace" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        setKeybindingOverride(capturingId, null);
        setConflict(null);
        setCapturingId(null);
        return;
      }
      const accel = captureAccelerator(event);
      if (!accel) return;
      const clash = findBindingOwner(capturingId, accel);
      if (clash) {
        setConflict(
          `${accel} is already used by “${clash}” — rebind that one first, then retry.`,
        );
        setCapturingId(null);
        return;
      }
      setConflict(null);
      setKeybindingOverride(capturingId, accel);
      setCapturingId(null);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [capturingId]);

  const rows = useMemo(
    () => filterKeybindings(buildKeybindingRows(), query),
    // version: rebuild when overrides change
    [query, version],
  );

  return (
    <>
      <div className="flex items-center justify-end gap-3 pb-3">
        <span className="shrink-0 text-[12px] text-content/40 tabular-nums">
          {rows.length} {rows.length === 1 ? "binding" : "bindings"}
        </span>
        <label className="flex h-7 w-52 shrink-0 items-center gap-2 rounded-md border border-content/10 px-2 text-content/45 focus-within:border-content/20">
          <Search className="size-3.5 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter"
            aria-label="Filter keybindings"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-content/35"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-content/10">
        <div className="flex items-center border-b border-content/10 bg-content/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-content/40">
          <span className="min-w-0 flex-1">Command</span>
          <span className="w-40 shrink-0">Keybinding</span>
          <span className="w-28 shrink-0">When</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-3 py-3 text-[12px] text-content/45">
            No matching bindings
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.command}
              className="flex items-center border-b border-content/5 px-3 py-2 text-[12px] last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate">{row.command}</span>
              <span className="w-40 shrink-0">
                {row.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConflict(null);
                      setCapturingId(row.id ?? null);
                    }}
                    title="Click, then press the new combo · Backspace resets · Esc cancels"
                    className={`w-full rounded-md border px-2 py-1 text-left font-mono text-[12px] transition-colors ${
                      capturingId === row.id
                        ? "border-content/40 bg-content/10 text-content"
                        : isOverridden(row.id)
                          ? "border-content/25 text-content hover:bg-content/5"
                          : "border-transparent text-content/80 hover:border-content/15 hover:bg-content/5"
                    }`}
                  >
                    {capturingId === row.id ? "Press keys…" : row.keys}
                  </button>
                ) : (
                  <span className="block font-mono text-[12px] text-content/80">
                    {row.keys}
                  </span>
                )}
              </span>
              <span className="w-28 shrink-0 font-mono text-[11px] text-content/40">
                {row.when}
              </span>
            </div>
          ))
        )}
      </div>

      <p className="pt-3 text-[12px] text-content/40">
        Click a keybinding, press the new combo, and the app menu updates
        instantly. Backspace on a selected row resets it to the default.
      </p>
      {conflict ? (
        <p className="pt-1 text-[12px] text-amber-400/90">{conflict}</p>
      ) : null}
    </>
  );
}

function ProvidersPage() {
  useSyncExternalStore(subscribeModels, getModelSnapshot, getModelSnapshot);
  useSyncExternalStore(
    subscribeHarnessAvailability,
    getHarnessAvailabilitySnapshot,
    getHarnessAvailabilitySnapshot,
  );
  const [choice, setChoice] = useState(loadLastModelChoice);
  const [defaultModels, setDefaultModels] = useState(loadDefaultModels);

  useEffect(() => {
    void probeHarnessAvailability();
  }, []);

  const onModelChange = (harness: HarnessId, model: string) => {
    saveDefaultModel(harness, model);
    setDefaultModels((prev) => ({ ...prev, [harness]: model }));
    if (choice?.harness === harness) {
      saveLastModelChoice(harness, model);
      setChoice({ harness, model });
    }
  };

  const onDefault = (harness: HarnessId, model: string) => {
    saveLastModelChoice(harness, model);
    setDefaultModels((prev) => ({ ...prev, [harness]: model }));
    setChoice({ harness, model });
  };

  return (
    <>
      <p className="pb-2 text-[12px] leading-relaxed text-content/45">
        A provider is listed as installed once its CLI is found on your PATH.
        Uninstalled CLIs stay listed here but are omitted from the model picker.
        Turn off Show in picker to hide an installed provider from those tabs.
        The model beside each provider is what new conversations use when that
        provider is selected; Use by default picks the provider itself.
      </p>
      {[
        ...HARNESSES,
        ...loadCustomProviders().map((provider) => provider.id as HarnessId),
      ].map((harness) => (
        <ProviderRow
          key={harness}
          harness={harness}
          selectedModel={
            defaultModels[harness] ??
            (choice?.harness === harness
              ? choice.model
              : defaultModelId(harness))
          }
          isDefault={choice?.harness === harness}
          onDefault={onDefault}
          onModelChange={onModelChange}
        />
      ))}
      <CustomProvidersSection />
    </>
  );
}

/** Providers added by MonoCodePK (absent from upstream MonoCode). */
const PK_PROVIDERS = new Set<HarnessId>([
  "zai",
  "mimo",
  "openrouter",
  "nvidia",
]);

function ProviderRow({
  harness,
  selectedModel,
  isDefault,
  onDefault,
  onModelChange,
}: {
  harness: HarnessId;
  selectedModel: string;
  isDefault: boolean;
  onDefault: (harness: HarnessId, model: string) => void;
  onModelChange: (harness: HarnessId, model: string) => void;
}) {
  const models = modelsFor(harness);
  const available = isHarnessAvailable(harness);
  const current =
    models.length > 0 ? resolveModel(harness, selectedModel) : null;
  const [inPicker, setInPicker] = useState(() =>
    isPickerProviderVisible(harness),
  );

  useEffect(() => {
    if (!available || models.length > 0) return;
    void refreshHarnessCatalogs([harness]);
  }, [available, harness, models.length]);

  const onPickerVisible = (visible: boolean) => {
    savePickerProviderVisible(harness, visible);
    setInPicker(visible);
  };

  return (
    <Row
      label={
        <span className="flex items-center gap-2">
          <HarnessIcon harness={harness} className="size-4 shrink-0" />
          {harnessTitle(harness)}
          {PK_PROVIDERS.has(harness) ? <PkBadge /> : null}
          {isDefault ? (
            <span className="rounded-full bg-content/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-content/60">
              Default
            </span>
          ) : null}
        </span>
      }
      description={
        available
          ? `${models.length} ${models.length === 1 ? "model" : "models"} available.`
          : harnessUnavailableHint(harness)
      }
    >
      {current ? (
        <Select
          label={`${harnessTitle(harness)} model`}
          value={current.id}
          onChange={(next) => onModelChange(harness, next)}
          options={models.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
      ) : null}
      <SecondaryButton
        onClick={() => current && onDefault(harness, current.id)}
        disabled={isDefault || !current}
      >
        {isDefault ? "Default" : "Use by default"}
      </SecondaryButton>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-content/50">Show in picker</span>
        <Toggle
          label={`Show ${harnessTitle(harness)} in the model picker`}
          on={inPicker}
          onChange={onPickerVisible}
        />
      </div>
    </Row>
  );
}

function useArchivedProjects(): ArchivedProject[] {
  const [items, setItems] = useState(loadArchivedProjects);
  useEffect(
    () => subscribeArchivedProjects(() => setItems(loadArchivedProjects())),
    [],
  );
  return items;
}

function archivedProjectLabel(path: string): string {
  return resolveTabGroupLabel(
    projectKey(path),
    loadTabGroupLabels(),
    projectName(path),
  );
}

function ArchivePage({
  cwd,
  sessions,
  onOpenSession,
  onArchiveSession,
  onDeleteSession,
  onRestoreProject,
  onDeleteProject,
}: {
  cwd: string;
  sessions: SessionSummary[];
  onOpenSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string, archived: boolean) => void;
  onDeleteSession: (sessionId: string) => void;
  onRestoreProject?: (path: string) => void;
  onDeleteProject?: (path: string) => void;
}) {
  const [filters, setFilters] = useState(loadSessionSidebarFilters);
  const [deleting, setDeleting] = useState<ArchivedProject | null>(null);
  const archivedProjects = useArchivedProjects();
  const archived = useMemo(
    () =>
      sessions
        .filter((session) => session.archived)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );

  const onShowArchived = (showArchived: boolean) => {
    const next = { ...filters, showArchived };
    saveSessionSidebarFilters(next);
    setFilters(next);
  };

  return (
    <>
      <Heading title="Archived projects" first />
      {archivedProjects.length === 0 ? (
        <p className="py-3 text-[12px] text-content/45">
          Archive a project from the rail to keep its chats without listing it
          in the sidebar.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-content/10">
          {archivedProjects.map((project) => (
            <div
              key={project.path}
              className="flex items-center gap-3 border-b border-content/5 px-3 py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px]">
                  {archivedProjectLabel(project.path)}
                </div>
                <div className="truncate text-[11px] text-content/40">
                  {prettyCwd(project.path)}
                </div>
              </div>
              {onRestoreProject ? (
                <SecondaryButton onClick={() => onRestoreProject(project.path)}>
                  Restore
                </SecondaryButton>
              ) : null}
              {onDeleteProject ? (
                <SecondaryButton danger onClick={() => setDeleting(project)}>
                  Delete
                </SecondaryButton>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Row
        label="Show archived in the sidebar"
        description="Keep archived conversations listed alongside the active ones."
      >
        <Toggle
          label="Show archived in the sidebar"
          on={filters.showArchived}
          onChange={onShowArchived}
        />
      </Row>

      <Heading
        title={
          looksLikeProject(cwd)
            ? `Archived in ${projectName(cwd)}`
            : "Archived conversations"
        }
      />

      {!looksLikeProject(cwd) ? (
        <p className="py-3 text-[12px] text-content/45">
          Open a project to see its archived conversations.
        </p>
      ) : archived.length === 0 ? (
        <p className="py-3 text-[12px] text-content/45">
          No archived conversations in this project.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-content/10">
          {archived.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 border-b border-content/5 px-3 py-2 last:border-b-0"
            >
              <HarnessIcon
                harness={session.harness}
                className="size-3.5 shrink-0"
              />
              <button
                type="button"
                onClick={() => onOpenSession(session.id)}
                className="min-w-0 flex-1 truncate text-left text-[13px] hover:text-content"
              >
                {sessionDisplayTitle(session.title, session.harness)}
              </button>
              <span className="shrink-0 text-[11px] text-content/35 tabular-nums">
                {formatDate(session.updatedAt)}
              </span>
              <SecondaryButton
                onClick={() => onArchiveSession(session.id, false)}
              >
                Unarchive
              </SecondaryButton>
              <SecondaryButton
                danger
                onClick={() => onDeleteSession(session.id)}
              >
                Delete
              </SecondaryButton>
            </div>
          ))}
        </div>
      )}

      {deleting ? (
        <RemoveProjectDialog
          name={archivedProjectLabel(deleting.path)}
          path={deleting.path}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            onDeleteProject?.(deleting.path);
            setDeleting(null);
          }}
        />
      ) : null}
    </>
  );
}

function formatDate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function PageHeader({
  title,
  description,
}: {
  title: ReactNode;
  description: string;
}) {
  return (
    <header className="pb-4">
      <h1 className="flex items-center gap-2 text-[20px] font-semibold leading-tight text-content">
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-content/45">
          {description}
        </p>
      ) : null}
    </header>
  );
}

function Heading({
  title,
  first = false,
  id,
}: {
  title: string;
  first?: boolean;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={`pb-1 text-[15px] font-semibold text-content ${
        first ? "" : "pt-8"
      }`}
    >
      {title}
    </h2>
  );
}

function Row({
  label,
  description,
  children,
  pk = false,
}: {
  label: ReactNode;
  description?: string;
  children?: ReactNode;
  pk?: boolean;
}) {
  return (
    <div className="flex items-start gap-6 border-b border-content/5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] font-medium text-content">
          {label}
          {pk ? <PkBadge /> : null}
        </div>
        {description ? (
          <p className="mt-1 text-[12px] leading-relaxed text-content/45">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}

const USAGE_PROVIDER_LABELS: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  zai: "ZAI",
  opencode: "OpenCode",
  opencodego: "OpenCode Go",
  mimo: "Xiaomi MiMo",
  antigravity: "Antigravity",
  gemini: "Gemini",
  cursor: "Cursor",
  grok: "Grok",
  openrouter: "OpenRouter",
  devin: "Devin",
  kilocode: "Kilo Code",
  codebuff: "CodeBuff",
};

function usageProviderLabel(id: string): string {
  return USAGE_PROVIDER_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

function PkBadge() {
  return (
    <span
      title="MonoCodePK custom setting"
      aria-label="MonoCodePK custom setting"
      className="rounded border border-accent/35 bg-accent/10 px-1 py-px text-[9px] font-semibold uppercase tracking-[0.08em] text-accent"
    >
      PK
    </span>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-grid shrink-0 gap-0.5 rounded-md border border-content/10 p-0.5 text-[12px]"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-w-0 whitespace-nowrap rounded-[5px] px-2.5 py-1 ${
            value === option.value
              ? "bg-content/10 text-content"
              : "text-content/50 hover:text-content"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex w-56 items-center gap-3 ${disabled ? "opacity-40" : ""}`}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        disabled={disabled}
        className="sidebar-opacity-slider min-w-0 flex-1 disabled:cursor-not-allowed"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="w-10 shrink-0 text-right text-[12px] text-content tabular-nums">
        {display}
      </span>
    </div>
  );
}

/** macOS keeps the decision after the first prompt; only System Settings can flip it. */
function NotificationsBlocked() {
  return (
    <span className="flex items-center gap-2 text-[12px] text-content/45">
      Permission needed
      {IS_MAC ? (
        <button
          type="button"
          onClick={() => {
            void openNotificationSettings().catch(() => {});
          }}
          className="rounded-md border border-content/10 px-2 py-1 text-content/70 hover:bg-content/10 hover:text-content"
        >
          Open System Settings
        </button>
      ) : null}
    </span>
  );
}

function Toggle({
  label,
  on,
  onChange,
  disabled = false,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={on}
      disabled={disabled}
      onClick={() => {
        onChange(!on);
        playCue("switch");
      }}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        on ? "bg-accent" : "bg-content/20"
      }`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
          on ? "left-4.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

/** Theme-aware dropdown for a Settings row: a trigger button opening a Popover listbox. Used instead of a native select, whose option popup is OS-rendered and unreadable in dark mode on Windows/Linux. */
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const activeOption = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const activeId =
    options[active] != null ? `${listId}-opt-${active}` : undefined;

  useEffect(() => {
    if (!open) return;
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    activeOption.current?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    trigger.current?.focus();
  };

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
      return;
    }
    if (e.key === "Tab") {
      const option = options[active];
      if (option && option.value !== value) onChange(option.value);
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const option = options[active];
      if (option) pick(option.value);
    }
  };

  return (
    <div ref={root} className="relative max-w-52">
      <button
        type="button"
        ref={trigger}
        aria-label={`${label}: ${selected?.label ?? value}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-content/10 bg-content/5 px-2 py-1 text-left text-[12px] text-content outline-none hover:border-content/20"
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? selected.label : value}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-content/50 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>
      {open ? (
        <Popover
          anchor={root}
          side="bottom"
          align="end"
          width={280}
          maxHeight={320}
          autoFocus
          onDismiss={(reason) => {
            setOpen(false);
            if (reason === "escape") trigger.current?.focus();
          }}
          role="listbox"
          aria-label={label}
          aria-activedescendant={activeId}
          tabIndex={-1}
          onKeyDown={onMenuKey}
          className="overflow-y-auto overscroll-contain p-1"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const highlighted = index === active;
            return (
              <button
                key={option.value}
                ref={highlighted ? activeOption : undefined}
                type="button"
                id={`${listId}-opt-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option.value)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] ${
                  highlighted || isSelected
                    ? "bg-content/10 text-content"
                    : "text-content hover:bg-content/5"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected ? (
                  <Check className="size-3.5 shrink-0" strokeWidth={2.25} />
                ) : null}
              </button>
            );
          })}
        </Popover>
      ) : null}
    </div>
  );
}

function SecondaryButton({
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex shrink-0 items-center gap-1.5 rounded-md border border-content/10 px-2.5 py-1 text-[12px] ${
        danger
          ? "text-red-400 hover:border-red-400/40 hover:bg-red-400/10"
          : "text-content/70 hover:bg-content/10 hover:text-content"
      } disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}
