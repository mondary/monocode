#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = resolve(root, "docs/pk-features");
const base = process.env.PK_FEATURE_BASE || "v0.1.50";
const labels = { pending: "À vérifier", ported: "Code porté", verified: "Vérifications OK", manual: "Test app OK" };
const features = readdirSync(directory).filter((name) => /^\d+-.*\.md$/.test(name)).sort().map((name) => {
  const text = readFileSync(resolve(directory, name), "utf8");
  const header = text.match(/^---\n([\s\S]*?)\n---/);
  if (!header) throw new Error(`En-tête absent : ${name}`);
  const result = { name, files: [], tests: [], title: text.match(/^# (.+)$/m)?.[1] };
  let list;
  for (const line of header[1].split("\n")) {
    const value = line.match(/^(id|status|upstream): (.+)$/);
    if (value) { result[value[1]] = value[2]; list = undefined; continue; }
    if (/^(files|tests):$/.test(line)) { list = line.slice(0, -1); continue; }
    const item = line.match(/^  - (.+)$/);
    if (item && list) result[list].push(item[1]);
  }
  if (!result.id || !labels[result.status] || !result.upstream) throw new Error(`Métadonnées invalides : ${name}`);
  for (const path of [...result.files, ...result.tests]) {
    if (!existsSync(resolve(root, path))) throw new Error(`Chemin absent dans ${name} : ${path}`);
  }
  return result;
});
if (new Set(features.map((f) => f.id)).size !== features.length) throw new Error("Identifiants de feature dupliqués");
const [command = "status", id] = process.argv.slice(2);
const feature = features.find((f) => f.id === id?.padStart(2, "0"));
const owners = (file) => features.filter((candidate) => candidate.files.includes(file));
const patchMode = (candidate) => candidate.files.some((file) => owners(file).length > 1) ? "contextual" : "auto";
function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (command === "status") {
  const verified = features.filter((f) => ["verified", "manual"].includes(f.status)).length;
  const manual = features.filter((f) => f.status === "manual").length;
  console.log(`Migration base ${base} — ${verified}/${features.length} vérifiées ; ${manual}/${features.length} testées dans l’application\n`);
  for (const f of features) console.log(`${f.id}  ${labels[f.status].padEnd(18)} ${f.title.replace(/^\d+ — /, "")}`);
} else if (command === "audit") {
  const covered = new Set(features.flatMap((f) => f.files));
  const changed = execFileSync("git", ["diff", "--name-only", base, "--"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const remaining = changed.filter((file) => !covered.has(file));
  console.log(`${changed.length - remaining.length}/${changed.length} fichiers divergents rattachés explicitement à une fiche.`);
  console.log("Fichiers non rattachés (à examiner, pas nécessairement des features manquantes) :");
  remaining.forEach((file) => console.log(file));
  console.log("\nFichiers partagés entre features :");
  for (const file of covered) {
    const owners = features.filter((f) => f.files.includes(file));
    if (owners.length > 1) console.log(`${file}: ${owners.map((f) => f.id).join(", ")}`);
  }
} else if (command === "check" && feature) {
  if (!feature.tests.length) throw new Error("Cette feature exige une validation native ; voir sa fiche.");
  run("npx", ["--no-install", "vitest", "run", ...feature.tests]);
  run("npx", ["--no-install", "tsc", "--noEmit"]);
  console.log(`Feature ${feature.id} : tests et TypeScript réussis. Le statut et le test manuel restent à consigner dans la fiche.`);
} else if (command === "diff" && feature) {
  console.error(`Diff de revue ${feature.upstream} → arbre courant, feature ${feature.id} (${patchMode(feature)}).`);
  run("git", ["diff", "--binary", base, "--", ...feature.files]);
} else if (command === "patch" && feature) {
  const mode = patchMode(feature);
  console.error(`Patch feature ${feature.id}: ${mode}.`);
  if (mode === "contextual") {
    console.error("Ce patch contient des fichiers partagés. Revue obligatoire avant application.");
  } else {
    console.error("Ce patch ne partage aucun fichier avec une autre fiche et peut être essayé avec git apply --3way.");
  }
  run("git", ["diff", "--binary", feature.upstream, "--", ...feature.files]);
} else if (command === "apply" && feature) {
  if (patchMode(feature) !== "auto") throw new Error(`Feature ${feature.id} contextuelle : utiliser 'patch ${feature.id}' puis revoir le diff manuellement.`);
  const patchFile = resolve(root, ".feature-patch.tmp");
  const patch = execFileSync("git", ["diff", "--binary", base, "--", ...feature.files], { cwd: root });
  const { writeFileSync, unlinkSync } = await import("node:fs");
  writeFileSync(patchFile, patch);
  try {
    run("git", ["apply", "--3way", "--check", patchFile]);
    run("git", ["apply", "--3way", patchFile]);
  } finally {
    unlinkSync(patchFile);
  }
} else {
  console.error("Usage: node scripts/pk-features.mjs [status|audit|check ID|diff ID|patch ID|apply ID]");
  process.exitCode = 1;
}
