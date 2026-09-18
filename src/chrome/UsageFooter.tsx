import { RefreshCw, Terminal } from "./icons";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { HarnessIcon } from "./HarnessIcon";
import { Popover, type PopoverDismissReason } from "./Popover";
import {
  consumeCodexRateLimitResetCredit,
  fetchClaudeRateLimits,
  fetchCodexBarRateLimits,
  fetchCodexRateLimits,
  fetchOpencodeGoRateLimits,
} from "../lib/rateLimitsFetch";
import {
  errorRateLimits,
  clampUsedPercent,
  formatRateLimitWindowChipLabel,
  formatDisplayedUsagePercent,
  loadHiddenUsageProviders,
  loadUsageDisplayMode,
  loadUsageScope,
  loadUsageProviderOrder,
  loadUsageWindowVisibility,
  USAGE_DISPLAY_MODE_CHANGE_EVENT,
  USAGE_SCOPE_CHANGE_EVENT,
  USAGE_WINDOW_VISIBILITY_CHANGE_EVENT,
  USAGE_PROVIDER_ORDER_CHANGE_EVENT,
  rateLimitWindowTooltip,
  type RateLimitWindow,
  type UsageDisplayMode,
  type UsageScope,
  type UsageWindowVisibility,
  normalizeUsageProviderId,
  fetchingRateLimits,
  idleRateLimits,
  RATE_LIMIT_POLL_MS,
  shouldFetchProvider,
  type ProviderRateLimits,
  type RateLimitProvider,
} from "../lib/rateLimits";
import { harnessLabel, harnessTitle, type HarnessId } from "../lib/session";
import { loginHarness, supportsHarnessLogin } from "../lib/harness/auth";
import {
  runningTerminalChipLabel,
  type RunningTerminal,
} from "../lib/terminalTab";
import { MOD } from "../lib/platform";
import { UsageProviderChip } from "./UsageProviderChip";
import {
  ProviderSignInPanel,
  type ProviderSignInState,
} from "./ProviderSignInPanel";
import {
  newProviderAccount,
  providerAccounts,
  saveProviderAccount,
  selectProviderAccount,
  selectedProviderAccountId,
  subscribeProviderAccounts,
} from "../lib/providerAccounts";

const CLOCK_MS = 30_000;

export type UsageFooterSession = {
  id?: string;
  harness: HarnessId;
  authRequired?: boolean;
  providerAccountId?: string;
};

export function UsageFooter({
  providers,
  session,
  project,
  terminals = [],
  terminalOpen = false,
  onToggleTerminal,
  onNewTerminal,
  onShowTerminal,
  projectTerminalActive = false,
  onSelectAccount,
}: {
  providers: RateLimitProvider[];
  session?: UsageFooterSession;
  project?: string;
  terminals?: RunningTerminal[];
  terminalOpen?: boolean;
  onToggleTerminal?: (fileId: string) => void;
  onNewTerminal?: () => void;
  onShowTerminal?: () => void;
  projectTerminalActive?: boolean;
  onSelectAccount?: (provider: RateLimitProvider, accountId: string) => void;
}) {
  const [codexbar, setCodexbar] = useState<ProviderRateLimits[]>([]);
  const [displayMode, setDisplayMode] = useState<UsageDisplayMode>(
    loadUsageDisplayMode,
  );
  const [usageScope, setUsageScope] = useState<UsageScope>(loadUsageScope);
  const [windowVisibility, setWindowVisibility] =
    useState<UsageWindowVisibility>(loadUsageWindowVisibility);
  const [providerOrder, setProviderOrder] = useState(loadUsageProviderOrder);
  const [hiddenProviders, setHiddenProviders] = useState<string[]>(
    loadHiddenUsageProviders,
  );

  const wantClaude = usageScope === "custom" ? !hiddenProviders.includes("claude") : providers.includes("claude");
  const wantCodex = usageScope === "custom" ? !hiddenProviders.includes("codex") : providers.includes("codex");
  const wantOpencode = usageScope === "custom" ? !hiddenProviders.includes("opencode") : providers.includes("opencode");
  const [claude, setClaude] = useState<ProviderRateLimits>(() =>
    idleRateLimits("claude"),
  );
  const [codex, setCodex] = useState<ProviderRateLimits>(() =>
    idleRateLimits("codex"),
  );
  const [opencode, setOpencode] = useState<ProviderRateLimits>(() =>
    idleRateLimits("opencode"),
  );
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [, setAccountsVersion] = useState(0);
  const inflight = useRef<Promise<void> | null>(null);
  const claudeRef = useRef(claude);
  const codexRef = useRef(codex);
  const opencodeRef = useRef(opencode);
  const codexbarRef = useRef(codexbar);
  codexbarRef.current = codexbar;
  claudeRef.current = claude;
  codexRef.current = codex;
  opencodeRef.current = opencode;
  const claudeAccountId =
    session?.harness === "claude" && session.providerAccountId
      ? session.providerAccountId
      : selectedProviderAccountId("claude", project);
  const codexAccountId =
    session?.harness === "codex" && session.providerAccountId
      ? session.providerAccountId
      : selectedProviderAccountId("codex", project);
  const claudeAccounts = providerAccounts("claude");
  const codexAccounts = providerAccounts("codex");
  const claudeAccountRef = useRef(claudeAccountId);
  const codexAccountRef = useRef(codexAccountId);
  claudeAccountRef.current = claudeAccountId;
  codexAccountRef.current = codexAccountId;

  useEffect(
    () =>
      subscribeProviderAccounts(() => setAccountsVersion((value) => value + 1)),
    [],
  );

  const refresh = useCallback(
    (force = false) => {
      if (inflight.current) return inflight.current;
      const visible = document.visibilityState === "visible";
      const fetchClaude =
        wantClaude &&
        shouldFetchProvider(claudeRef.current, { force, visible });
      const fetchCodex =
        wantCodex && shouldFetchProvider(codexRef.current, { force, visible });
      const fetchOpencode =
        wantOpencode &&
        shouldFetchProvider(opencodeRef.current, { force, visible });
      const fetchCodexbar = (usageScope === "custom" || providers.length > 0) && (force || codexbarRef.current.length === 0 || codexbarRef.current.some((entry) => shouldFetchProvider(entry, {force, visible})));
      if (!fetchClaude && !fetchCodex && !fetchOpencode && !fetchCodexbar) return;
      if (force) setRefreshing(true);
      const jobs: Promise<void>[] = [];
      if (fetchClaude) {
        const accountId = claudeAccountId;
        setClaude((current) => fetchingRateLimits("claude", current));
        jobs.push(
          fetchClaudeRateLimits(accountId).then((value) => {
            if (accountId === claudeAccountRef.current) setClaude(value);
          }),
        );
      }
      if (fetchCodex) {
        const accountId = codexAccountId;
        setCodex((current) => fetchingRateLimits("codex", current));
        jobs.push(
          fetchCodexRateLimits(accountId).then((value) => {
            if (accountId === codexAccountRef.current) setCodex(value);
          }),
        );
      }
      if (fetchOpencode) {
        setOpencode((current) => fetchingRateLimits("opencode", current));
        jobs.push(
          fetchOpencodeGoRateLimits().then((value) => {
            setOpencode(value);
          }),
        );
      }
      if (fetchCodexbar) jobs.push(fetchCodexBarRateLimits().then(setCodexbar));
      const run = Promise.allSettled(jobs)
        .then(() => undefined)
        .finally(() => {
          inflight.current = null;
          setRefreshing(false);
        });
      inflight.current = run;
      return run;
    },
    [claudeAccountId, codexAccountId, wantClaude, wantCodex, wantOpencode, providers.length, usageScope],
  );

  useEffect(() => {
    const idle = idleRateLimits("claude");
    claudeRef.current = idle;
    setClaude(idle);
    const pending = inflight.current;
    if (pending) void pending.finally(() => refresh(true));
  }, [claudeAccountId]);

  useEffect(() => {
    const idle = idleRateLimits("codex");
    codexRef.current = idle;
    setCodex(idle);
    const pending = inflight.current;
    if (pending) void pending.finally(() => refresh(true));
  }, [codexAccountId]);

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => void refresh(), RATE_LIMIT_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), CLOCK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const consumeCodexReset = useCallback(
    async (creditId?: string) => {
      while (inflight.current) await inflight.current;
      setRefreshing(true);
      setCodex((current) => fetchingRateLimits("codex", current));
      let outcome: Awaited<ReturnType<typeof consumeCodexRateLimitResetCredit>>;
      const operation = (async () => {
        try {
          outcome = await consumeCodexRateLimitResetCredit(
            creditId,
            codexAccountId,
          );
          setCodex(await fetchCodexRateLimits(codexAccountId));
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not use Codex reset";
          setCodex((current) => errorRateLimits("codex", message, current));
          throw error;
        }
      })();
      const tracked = operation.finally(() => {
        inflight.current = null;
        setRefreshing(false);
      });
      inflight.current = tracked.catch(() => undefined);
      await tracked;
      return outcome!;
    },
    [codexAccountId],
  );

  const reconnectProvider = useCallback(
    async (
      provider: RateLimitProvider,
      accountId: string,
      fetchLimits: () => Promise<ProviderRateLimits>,
      setLimits: Dispatch<SetStateAction<ProviderRateLimits>>,
    ) => {
      while (inflight.current) await inflight.current;
      setRefreshing(true);
      setLimits((current) => fetchingRateLimits(provider, current));
      const operation = (async () => {
        try {
          await (accountId === "default"
            ? loginHarness(provider as HarnessId)
            : loginHarness(provider as HarnessId, accountId));
          const value = await fetchLimits();
          setLimits(value);
          if (value.status !== "ok") {
            throw new Error(
              value.error ||
                `${harnessTitle(provider as HarnessId)} sign-in could not be verified`,
            );
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not complete sign-in";
          setLimits((current) => errorRateLimits(provider, message, current));
          throw error;
        }
      })();
      const tracked = operation.finally(() => {
        inflight.current = null;
        setRefreshing(false);
      });
      inflight.current = tracked.catch(() => undefined);
      await tracked;
    },
    [],
  );

  const reconnectClaude = useCallback(
    () =>
      reconnectProvider(
        "claude",
        claudeAccountId,
        () => fetchClaudeRateLimits(claudeAccountId),
        setClaude,
      ),
    [claudeAccountId, reconnectProvider],
  );

  const reconnectCodex = useCallback(
    () =>
      reconnectProvider(
        "codex",
        codexAccountId,
        () => fetchCodexRateLimits(codexAccountId),
        setCodex,
      ),
    [codexAccountId, reconnectProvider],
  );

  const selectAccount = useCallback(
    (provider: RateLimitProvider, accountId: string) => {
      selectProviderAccount(provider, project, accountId);
      onSelectAccount?.(provider, accountId);
    },
    [onSelectAccount, project],
  );

  const addAccount = useCallback(
    async (provider: RateLimitProvider, label: string) => {
      const account = newProviderAccount(provider, label);
      await loginHarness(provider as HarnessId, account.id);
      saveProviderAccount(account);
      selectAccount(provider, account.id);
      return account;
    },
    [selectAccount],
  );

  useEffect(() => {
    const onChange = () => {
      setDisplayMode(loadUsageDisplayMode());
      setUsageScope(loadUsageScope());
      setWindowVisibility(loadUsageWindowVisibility());
      setProviderOrder(loadUsageProviderOrder());
      setHiddenProviders(loadHiddenUsageProviders());
    };
    window.addEventListener(USAGE_DISPLAY_MODE_CHANGE_EVENT, onChange);
    window.addEventListener(USAGE_SCOPE_CHANGE_EVENT, onChange);
    window.addEventListener(USAGE_WINDOW_VISIBILITY_CHANGE_EVENT, onChange);
    window.addEventListener(USAGE_PROVIDER_ORDER_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener(USAGE_DISPLAY_MODE_CHANGE_EVENT, onChange);
      window.removeEventListener(USAGE_SCOPE_CHANGE_EVENT, onChange);
      window.removeEventListener(USAGE_WINDOW_VISIBILITY_CHANGE_EVENT, onChange);
      window.removeEventListener(USAGE_PROVIDER_ORDER_CHANGE_EVENT, onChange);
    };
  }, []);


  const showOpencodeChip =
    wantOpencode && opencode.status !== "unavailable";
  const native = [wantClaude ? claude : null, wantCodex ? codex : null, showOpencodeChip ? opencode : null].filter(
    (entry): entry is ProviderRateLimits => entry != null,
  );
  const nativeProviders = new Set(native.map((entry) => entry.provider));
  const mergedUsage = [
    ...native,
    ...codexbar.filter((entry) => !nativeProviders.has(normalizeUsageProviderId(entry.provider))),
  ];
  const usage =
    usageScope === "active"
      ? mergedUsage.filter((entry) =>
          usageProviderMatches(entry.provider, providers),
        )
      : mergedUsage.filter(
        (entry) => !hiddenProviders.includes(normalizeUsageProviderId(entry.provider)),
        )
      .sort((a, b) => providerOrder.indexOf(normalizeUsageProviderId(a.provider)) - providerOrder.indexOf(normalizeUsageProviderId(b.provider)));
  const showUsage = usage.length > 0;
  const showTerminals = terminals.length > 0;
  const showTerminalButton = Boolean(onNewTerminal || onShowTerminal);
  const terminalLabel = projectTerminalActive
    ? "Terminal"
    : `New Terminal (${MOD}\`)`;
  const onTerminalClick = projectTerminalActive
    ? (onShowTerminal ?? onNewTerminal)
    : (onNewTerminal ?? onShowTerminal);
  const ariaLabel = showUsage
    ? "Provider usage"
    : showTerminals || showTerminalButton
      ? "Terminals"
      : session
        ? "Session"
        : undefined;

  return (
    <footer
      aria-label={ariaLabel}
      className="flex h-7 shrink-0 items-center gap-1.5 overflow-x-auto border-t border-stroke px-3 text-[11px] text-content/55"
    >
      {showUsage ? (
        <>
          {usage.map((limits) => limits.provider === "claude" || limits.provider === "codex" || limits.provider === "opencode" ? (
            <UsageProviderChip key={limits.provider} limits={limits} now={now} project={project}
              displayMode={displayMode} windowVisibility={windowVisibility}
              accounts={limits.provider === "claude" ? claudeAccounts : limits.provider === "codex" ? codexAccounts : undefined}
              accountId={limits.provider === "claude" ? claudeAccountId : limits.provider === "codex" ? codexAccountId : undefined}
              onSelectAccount={limits.provider === "opencode" ? undefined : (id) => selectAccount(limits.provider, id)}
              onAddAccount={limits.provider === "opencode" ? undefined : (label) => addAccount(limits.provider, label)}
              onReconnect={limits.provider === "claude" ? reconnectClaude : limits.provider === "codex" ? reconnectCodex : undefined}
              onConsumeReset={limits.provider === "codex" ? consumeCodexReset : undefined} />
          ) : <ProviderChip key={limits.provider} limits={limits} now={now} displayMode={displayMode} windowVisibility={windowVisibility} />)}
          <button
            type="button"
            className="grid size-4.5 shrink-0 place-items-center rounded text-content/40 hover:bg-content/10 hover:text-content disabled:opacity-50"
            aria-label="Refresh usage"
            title="Refresh usage"
            disabled={refreshing}
            onClick={() => void refresh(true)}
          >
            <RefreshCw
              className={`size-2.5 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        </>
      ) : session ? (
        <SessionChip key={session.id ?? session.harness} session={session} />
      ) : null}
      {showTerminals || showTerminalButton ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showTerminals ? (
            <RunningTerminalChip
              terminals={terminals}
              open={terminalOpen}
              onToggle={onToggleTerminal}
            />
          ) : showTerminalButton ? (
            <button
              type="button"
              className={`inline-flex h-5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-1.5 hover:bg-content/10 ${
                projectTerminalActive
                  ? "text-accent"
                  : "text-content/40 hover:text-content"
              }`}
              aria-label={terminalLabel}
              aria-pressed={projectTerminalActive}
              title={terminalLabel}
              onClick={onTerminalClick}
            >
              <Terminal className="size-3.5" strokeWidth={1.75} aria-hidden />
              <span>Terminal</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}

function TerminalLiveMark() {
  return (
    <span className="terminal-live shrink-0" aria-hidden>
      <span className="terminal-live-bar" />
      <span className="terminal-live-bar" />
      <span className="terminal-live-bar" />
    </span>
  );
}

function SessionChip({ session }: { session: UsageFooterSession }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loginState, setLoginState] = useState<ProviderSignInState>("idle");
  const [loginError, setLoginError] = useState<string | null>(null);
  const authRequired = Boolean(
    session.authRequired && loginState !== "complete",
  );
  const canLogin = authRequired && supportsHarnessLogin(session.harness);

  useEffect(() => {
    if (!session.authRequired && loginState === "complete") {
      setLoginState("idle");
    }
  }, [loginState, session.authRequired]);

  const dismiss = (reason: PopoverDismissReason) => {
    setOpen(false);
    if (reason === "escape") {
      requestAnimationFrame(() => trigger.current?.focus());
    }
  };

  const signIn = async () => {
    setLoginState("running");
    setLoginError(null);
    try {
      await loginHarness(session.harness);
      setOpen(false);
      setLoginState("complete");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Could not complete sign-in",
      );
      setLoginState("error");
    }
  };

  if (!canLogin) {
    return (
      <span
        className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap"
        title={harnessTitle(session.harness)}
      >
        <HarnessIcon harness={session.harness} className="size-3 shrink-0" />
        <span>{harnessLabel(session.harness)}</span>
      </span>
    );
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="-mx-1 inline-flex h-5 min-w-0 shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-1 text-content/55 transition-[background-color,color,transform] duration-150 ease-out hover:bg-content/10 hover:text-content focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.97]"
        aria-label={`${harnessTitle(session.harness)} sign-in required`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`${harnessTitle(session.harness)} sign-in required`}
        onClick={() => setOpen((value) => !value)}
      >
        <HarnessIcon harness={session.harness} className="size-3 shrink-0" />
        <span>{harnessLabel(session.harness)}</span>
        {authRequired ? (
          <span className="text-[10px] text-amber-600 dark:text-amber-300">
            sign in
          </span>
        ) : null}
      </button>
      {open ? (
        <Popover
          anchor={trigger}
          side="top"
          align="start"
          gap={7}
          width={300}
          autoFocus
          onDismiss={dismiss}
          role="dialog"
          aria-label={`${harnessTitle(session.harness)} sign-in`}
          tabIndex={-1}
          className="text-content"
        >
          <ProviderSignInPanel
            harness={session.harness}
            state={loginState}
            error={loginError}
            onSignIn={() => void signIn()}
          />
        </Popover>
      ) : null}
    </>
  );
}

function RunningTerminalChip({
  terminals,
  open: panelOpen,
  onToggle,
}: {
  terminals: RunningTerminal[];
  open: boolean;
  onToggle?: (fileId: string) => void;
}) {
  const root = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const label = runningTerminalChipLabel(terminals);
  const many = terminals.length > 1;
  const title = terminals
    .map((terminal) => `"${terminal.process}" in ${terminal.label}`)
    .join("\n");
  const ariaLabel =
    terminals.length === 1
      ? panelOpen
        ? `Hide ${terminals[0]?.process}`
        : `Show ${terminals[0]?.process}`
      : panelOpen
        ? "Hide running terminals"
        : `${terminals.length} terminals are running processes`;

  const toggle = (fileId: string) => {
    setMenuOpen(false);
    onToggle?.(fileId);
  };

  return (
    <>
      <button
        ref={root}
        type="button"
        className="inline-flex min-w-0 max-w-[16rem] items-center gap-1.5 whitespace-nowrap rounded px-1 -mx-1 hover:bg-content/10 hover:text-content"
        aria-label={ariaLabel}
        aria-pressed={panelOpen}
        aria-expanded={many && !panelOpen ? menuOpen : undefined}
        aria-haspopup={many && !panelOpen ? "menu" : undefined}
        title={title}
        onClick={() => {
          if (panelOpen || !many) {
            const target = terminals[0];
            if (target) toggle(target.id);
            return;
          }
          setMenuOpen((value) => !value);
        }}
      >
        <TerminalLiveMark />
        <span className="truncate font-mono text-[10px] tabular-nums">
          {label}
        </span>
      </button>
      {menuOpen && many && !panelOpen ? (
        <Popover
          anchor={root}
          side="top"
          align="end"
          autoFocus
          onDismiss={() => setMenuOpen(false)}
          role="menu"
          aria-label="Running terminals"
          className="min-w-[12rem] p-1"
        >
          {terminals.map((terminal) => (
            <button
              key={terminal.id}
              type="button"
              role="menuitem"
              className="flex h-7 w-full items-center gap-2 rounded-lg px-2 text-left text-[12px] leading-none text-content hover:bg-content/10"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => toggle(terminal.id)}
            >
              <span className="min-w-0 flex-1 truncate">
                {terminal.process}
              </span>
              <span className="max-w-[7rem] shrink-0 truncate text-[11px] text-content/40">
                {terminal.label}
              </span>
            </button>
          ))}
        </Popover>
      ) : null}
    </>
  );
}

function ProviderChip({
  limits,
  now,
  displayMode,
  windowVisibility,
}: {
  limits: ProviderRateLimits;
  now: number;
  displayMode: UsageDisplayMode;
  windowVisibility: UsageWindowVisibility;
}) {
  const root = useRef<HTMLButtonElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const loading =
    limits.status === "idle" ||
    (limits.status === "fetching" && !limits.session && !limits.weekly);
  const disconnected = limits.status === "unavailable";
  const allWindows = [
    limits.session ? { key: "session", window: limits.session } : null,
    limits.weekly ? { key: "weekly", window: limits.weekly } : null,
    limits.monthly ? { key: "monthly", window: limits.monthly } : null,
  ].filter((entry): entry is { key: string; window: RateLimitWindow } => {
    return entry != null;
  });
  const windows = allWindows.filter((entry) =>
    windowVisibility === "all" || entry.key === windowVisibility,
  );
  const tightest = windows.reduce<RateLimitWindow | null>((best, entry) => {
    if (!best || entry.window.usedPercent > best.usedPercent) {
      return entry.window;
    }
    return best;
  }, null);
  const tooltip = allWindows
    .map((entry) => `${usageWindowLabel(entry.key)}: ${rateLimitWindowTooltip(entry.window, now)}`)
    .join("\n");

  return (
    <>
    <button
      ref={root}
      type="button"
      className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded px-1 -mx-1 hover:bg-content/10 hover:text-content"
      aria-label={`${providerDisplayLabel(limits.provider)} quota details`}
      aria-expanded={detailsOpen}
      onClick={() => setDetailsOpen((open) => !open)}
    >
      <ProviderMark provider={limits.provider} />
      {loading ? (
        <span className="animate-pulse text-content/35">···</span>
      ) : disconnected ? (
        <span className="text-content/35">not connected</span>
      ) : windows.length === 0 ? (
        <span className="text-content/35">{emptyUsageLabel(limits)}</span>
      ) : (
        <>
          {tightest ? <MiniBar usedPct={tightest.usedPercent} /> : null}
          <span className="flex min-w-0 items-center gap-1 tabular-nums">
            {windows.map((entry, index) => (
              <span key={entry.key} className="inline-flex items-center gap-1">
                {index > 0 ? <span className="text-content/25">·</span> : null}
                <span>
                  {formatDisplayedUsagePercent(
                    entry.window.usedPercent,
                    displayMode,
                  )}{" "}
                  {formatRateLimitWindowChipLabel(entry.window, now)}
                </span>
              </span>
            ))}
          </span>
        </>
      )}
    </button>
    {detailsOpen && tooltip && !loading && !disconnected ? (
      <Popover
        anchor={root}
        side="top"
        align="start"
        onDismiss={() => setDetailsOpen(false)}
        className="w-64 p-3"
      >
        <div className="mb-2 text-[11px] font-semibold text-content">
          {providerDisplayLabel(limits.provider)}
        </div>
        <div className="grid gap-1.5">
          {allWindows.map((entry) => (
            <div key={entry.key} className="grid grid-cols-[4.5rem_1fr] gap-2 text-[11px]">
              <span className="text-content/45">{usageWindowLabel(entry.key)}</span>
              <span className="text-right tabular-nums">
                {formatDisplayedUsagePercent(entry.window.usedPercent, displayMode)} remaining
                <span className="block text-content/45">
                  {rateLimitWindowTooltip(entry.window, now).split(" · ").slice(-1)[0]}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Popover>
    ) : null}
    </>
  );
}

function usageWindowLabel(key: string): string {
  if (key === "session") return "5 hours";
  if (key === "weekly") return "Weekly";
  if (key === "monthly") return "Monthly";
  return key;
}

function providerDisplayLabel(provider: string): string {
  return provider === "opencodego"
    ? "OpenCode Go"
    : provider === "mimo"
      ? "Xiaomi MiMo"
      : provider.charAt(0).toUpperCase() + provider.slice(1);
}

const KNOWN_HARNESSES = new Set<HarnessId>([
  "claude",
  "codex",
  "cursor",
  "grok",
  "opencode",
  "zai",
  "mimo",
  "openrouter",
  "nvidia",
  "gemini",
  "antigravity",
  "pi",
  "omp",
  "fx",
]);

/** CodexBar names some providers differently from the app's harness ids. */
const USAGE_PROVIDER_ALIASES: Record<string, string[]> = {
  opencode: ["opencode", "opencodego"],
};

function usageProviderMatches(provider: string, providers: string[]): boolean {
  for (const harness of providers) {
    if (entryMatchesHarness(provider, harness)) return true;
  }
  return false;
}

function entryMatchesHarness(provider: string, harness: string): boolean {
  if (normalizeUsageProviderId(provider) === normalizeUsageProviderId(harness)) return true;
  return (USAGE_PROVIDER_ALIASES[harness] ?? []).includes(provider);
}

function ProviderMark({ provider }: { provider: string }) {
  if (KNOWN_HARNESSES.has(provider as HarnessId)) {
    return (
      <HarnessIcon
        harness={provider as HarnessId}
        className="size-3 shrink-0"
      />
    );
  }
  return (
    <span className="grid size-3 shrink-0 place-items-center rounded-sm bg-content/20 text-[8px] font-semibold uppercase">
      {provider.slice(0, 1)}
    </span>
  );
}

function emptyUsageLabel(limits: ProviderRateLimits): string {
  if (limits.status !== "error") return "—";
  const text = limits.error?.toLowerCase() ?? "";
  if (text.includes("expired") || text.includes("sign-in")) return "expired";
  return "—";
}

function MiniBar({ usedPct }: { usedPct: number }) {
  const pct = clampUsedPercent(usedPct);
  return (
    <span
      className="h-1 w-8 shrink-0 overflow-hidden rounded-full bg-content/10"
      aria-hidden
    >
      <span
        className={`block h-full rounded-full ${barClass(pct)}`}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function barClass(pct: number): string {
  if (pct >= 90) return "bg-red-400";
  if (pct >= 80) return "bg-amber-400";
  return "bg-content/45";
}
