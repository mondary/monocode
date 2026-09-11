import { loadCustomProviders } from "../customProviders";
import type { HarnessId } from "../session";
import { ensureClaudeRegistered } from "./claudeAdapter";
import { ensureCodexRegistered } from "./codexAdapter";
import { ensureCursorRegistered } from "./cursorAdapter";
import { ensureFxRegistered } from "./fxAdapter";
import { ensureGrokRegistered } from "./grokAdapter";
import {
  ensureOpenCodeProviderRegistered,
  ensureOpenCodeRegistered,
} from "./opencodeAdapter";
import { ensureOmpRegistered } from "./ompAdapter";
import { ensurePiRegistered } from "./piAdapter";

/** Register all known live harness adapters. Idempotent. */
export function registerBuiltinHarnesses(): void {
  ensureClaudeRegistered();
  ensureCursorRegistered();
  ensureCodexRegistered();
  ensureGrokRegistered();
  ensureOpenCodeRegistered();
  ensureOpenCodeProviderRegistered("zai");
  ensureOpenCodeProviderRegistered("mimo");
  ensureOpenCodeProviderRegistered("openrouter");
  ensureOpenCodeProviderRegistered("nvidia");
  ensurePiRegistered();
  ensureOmpRegistered();
  ensureFxRegistered();
  registerCustomProviderHarnesses();
}

/** Custom providers from Settings ride the OpenCode runtime, one tab each. */
export function registerCustomProviderHarnesses(): void {
  for (const provider of loadCustomProviders()) {
    ensureOpenCodeProviderRegistered(provider.id as HarnessId);
  }
}
