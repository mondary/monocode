import {
  bindOpenCodeSession,
  cancelOpenCodeTurn,
  compactOpenCodeContext,
  forgetOpenCodeSession,
  respondOpenCodeApproval,
  respondOpenCodeQuestion,
  rewindOpenCodeLastTurn,
  sendOpenCodeTurn,
  steerOpenCodeTurn,
  stopOpenCodeSession,
} from "./opencode";
import { refreshOpenCodeCatalog } from "./opencodeCatalog";
import {
  generateOpenCodeBranchName,
  generateOpenCodeCommitMessage,
  generateOpenCodePrContent,
} from "./opencodeGit";
import { generateOpenCodeSessionTitle } from "./opencodeTitle";
import { warmupOpenCodeText } from "./opencodeText";
import { registerHarness, type HarnessAdapter } from "../../core/registry";
import type { HarnessId } from "../../../../features/sessions/model/session";

export const openCodeAdapter: HarnessAdapter = {
  id: "opencode",
  live: true,
  rewindLastTurn: rewindOpenCodeLastTurn,
  sendTurn: sendOpenCodeTurn,
  compactContext: compactOpenCodeContext,
  steerTurn: steerOpenCodeTurn,
  cancelTurn: cancelOpenCodeTurn,
  respondApproval: respondOpenCodeApproval,
  respondQuestion: respondOpenCodeQuestion,
  stopSession: stopOpenCodeSession,
  forgetSession: forgetOpenCodeSession,
  bindSession: bindOpenCodeSession,
  refreshCatalog: refreshOpenCodeCatalog,
  generateTitle: generateOpenCodeSessionTitle,
  generateCommitMessage: generateOpenCodeCommitMessage,
  generatePrContent: generateOpenCodePrContent,
  generateBranchName: generateOpenCodeBranchName,
  warmupText: warmupOpenCodeText,
};

let registered = false;

export function ensureOpenCodeRegistered(): void {
  if (registered) return;
  registerHarness(openCodeAdapter);
  registered = true;
}

const registeredProviders = new Set<HarnessId>();

/**
 * OpenAI-compatible providers use the OpenCode runtime, but remain separate
 * provider tabs in MonoCode. The selected model's native id tells OpenCode
 * which provider/model pair to route to.
 */
export function ensureOpenCodeProviderRegistered(id: HarnessId): void {
  if (registeredProviders.has(id)) return;
  registerHarness({ ...openCodeAdapter, id });
  registeredProviders.add(id);
}
