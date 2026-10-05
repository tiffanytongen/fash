#!/usr/bin/env node
// Manual curation helper for the concierge MVP (development only).
//
//   npm run curate -- list                       all requests, newest first
//   npm run curate -- show <id>                  one request's details
//   npm run curate -- status <id> <status>       submitted | reviewing | curated | completed
//   npm run curate -- attach <id> <picks.json>   attach your shortlist (3–5 products)
//   npm run curate -- demo <id>                  attach the labelled DEMO shortlist
//   npm run curate -- template                   where the blank shortlist template lives
//
// Add --force to `attach`/`demo` to replace an existing shortlist.
//
// It reads/writes the same files as src/lib/requests/store.ts:
//   .data/requests/<id>.json, .data/curations/<id>.json
// Data shapes are defined in src/types/curation.ts — keep them in sync.

import { readFile, readdir, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = process.env.TFD_DATA_DIR ?? path.join(ROOT, ".data");
const BASE_URL = process.env.TFD_BASE_URL ?? "http://localhost:3000";
const REQUESTS = path.join(DATA_DIR, "requests");
const CURATIONS = path.join(DATA_DIR, "curations");

const STATUSES = ["submitted", "reviewing", "curated", "completed"];
const MATCH_TYPES = ["exact-ish", "similar", "vibe"];
const CURRENCIES = ["MYR", "AUD"];
const TAOBAO_HOSTS = ["taobao.com", "tmall.com", "tb.cn", "tmall.hk"];
const ID_PATTERN = /^req_[a-z0-9]{16}$/;

const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const exists = (f) => access(f).then(() => true, () => false);
const readJson = async (f) => JSON.parse(await readFile(f, "utf8"));
const writeJson = async (f, data) => {
  await mkdir(path.dirname(f), { recursive: true });
  await writeFile(f, JSON.stringify(data, null, 2) + "\n");
};

async function loadRequest(id) {
  if (!id) die("Give a request id, e.g. npm run curate -- show req_abc123…");
  if (!ID_PATTERN.test(id)) die(`"${id}" doesn't look like a request id.`);
  const file = path.join(REQUESTS, `${id}.json`);
  if (!(await exists(file))) die(`No request ${id} in ${REQUESTS}`);
  return { file, request: await readJson(file) };
}

async function setStatus(id, status) {
  const { file, request } = await loadRequest(id);
  request.status = status;
  request.updatedAt = new Date().toISOString();
  await writeJson(file, request);
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function list() {
  const files = (await exists(REQUESTS)) ? (await readdir(REQUESTS)).filter((f) => f.endsWith(".json")) : [];
  if (files.length === 0) return console.log("No requests yet. Submit one at " + BASE_URL + "/inspiration");
  const rows = await Promise.all(files.map((f) => readJson(path.join(REQUESTS, f))));
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const r of rows) {
    const picks = (await exists(path.join(CURATIONS, `${r.id}.json`))) ? "has picks" : "no picks";
    const budget = `${r.budget.currency} ${r.budget.min ?? 0}–${r.budget.max ?? "+"}`;
    console.log(
      `${r.id}  ${r.createdAt.slice(0, 16).replace("T", " ")}  ${r.status.padEnd(9)}  ${picks.padEnd(9)}  ` +
        `${r.matchMode.padEnd(12)}  size ${r.usualSize.padEnd(3)}  ${budget}`,
    );
  }
  console.log(`\nOpen one: ${BASE_URL}/requests/<id>`);
}

async function show(id) {
  const { request } = await loadRequest(id);
  console.log(JSON.stringify(request, null, 2));
  console.log(`\nImage file: ${path.join(DATA_DIR, "uploads", request.inspirationImage.storageKey)}`);
  console.log(`Page:       ${BASE_URL}/requests/${id}`);
}

function validateProduct(p, i) {
  const where = `products[${i}]`;
  const problems = [];
  const str = (k) => typeof p[k] === "string" && p[k].trim() !== "";
  for (const k of ["title", "whyItMatches", "reviewNote", "sizingNote"]) if (!str(k)) problems.push(`${where}.${k} is required`);
  if (typeof p.curatorNote !== "string") problems.push(`${where}.curatorNote must be a string (can be "")`);
  if (!p.shop || typeof p.shop.name !== "string" || typeof p.shop.qualityNote !== "string")
    problems.push(`${where}.shop needs { name, qualityNote }`);
  if (!MATCH_TYPES.includes(p.matchType)) problems.push(`${where}.matchType must be one of ${MATCH_TYPES.join(", ")}`);
  if (!p.image || typeof p.image.alt !== "string" || !(p.image.url === null || typeof p.image.url === "string"))
    problems.push(`${where}.image needs { url: string|null, alt }`);
  if (!(p.priceCny === null || (typeof p.priceCny === "number" && p.priceCny > 0)))
    problems.push(`${where}.priceCny must be a number or null`);
  if (p.convertedPrice != null) {
    const c = p.convertedPrice;
    if (typeof c.amount !== "number" || !CURRENCIES.includes(c.currency))
      problems.push(`${where}.convertedPrice needs { amount: number, currency: MYR|AUD }`);
  }
  if (!(p.availableSizes === null || (Array.isArray(p.availableSizes) && p.availableSizes.every((s) => typeof s === "string"))))
    problems.push(`${where}.availableSizes must be a list of strings or null`);
  if (p.tags !== undefined && !(Array.isArray(p.tags) && p.tags.every((t) => typeof t === "string")))
    problems.push(`${where}.tags must be a list of strings`);

  // Real picks must link to a real Taobao/Tmall listing. Only demo items may omit it.
  if (p.isDemo !== true) {
    let ok = false;
    try {
      const u = new URL(p.taobaoUrl);
      ok = u.protocol === "https:" && TAOBAO_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
    } catch {}
    if (!ok) problems.push(`${where}.taobaoUrl must be an https Taobao/Tmall link (got ${JSON.stringify(p.taobaoUrl)})`);
  }
  return problems;
}

async function attach(id, picksFile, { force, isDemoCommand }) {
  await loadRequest(id);
  if (!picksFile) die("Give a shortlist file, e.g. npm run curate -- attach <id> my-picks.json");
  const out = path.join(CURATIONS, `${id}.json`);
  if ((await exists(out)) && !force) die(`${id} already has picks. Add --force to replace them.`);

  let input;
  try {
    input = await readJson(path.resolve(picksFile));
  } catch (e) {
    die(`Couldn't read ${picksFile}: ${e.message}`);
  }
  const products = input.products;
  if (!Array.isArray(products) || products.length < 3 || products.length > 5)
    die(`A shortlist needs 3–5 products (found ${Array.isArray(products) ? products.length : 0}).`);

  const problems = products.flatMap(validateProduct);
  if (problems.length) die("Shortlist has problems:\n  - " + problems.join("\n  - "));
  if (!isDemoCommand && products.some((p) => p.isDemo)) console.warn("! Some products are marked isDemo — they'll show a Demo label.");

  const result = {
    requestId: id,
    curatedAt: new Date().toISOString(),
    source: "manual",
    curatorName: typeof input.curatorName === "string" && input.curatorName.trim() ? input.curatorName.trim() : null,
    summary: typeof input.summary === "string" && input.summary.trim() ? input.summary.trim() : null,
    products: products.map((p, i) => ({ id: p.id ?? `pick-${i + 1}`, ...p })),
  };
  await writeJson(out, result);
  await setStatus(id, "curated");
  console.log(`✓ Attached ${products.length} picks to ${id} and set status to "curated".`);
  console.log(`  ${BASE_URL}/requests/${id}`);
}

// ── Entry ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const force = args.includes("--force");
const [command, a, b] = args.filter((x) => x !== "--force");

switch (command) {
  case "list":
    await list();
    break;
  case "show":
    await show(a);
    break;
  case "status":
    if (!STATUSES.includes(b)) die(`Status must be one of: ${STATUSES.join(", ")}`);
    await setStatus(a, b);
    console.log(`✓ ${a} is now "${b}".`);
    break;
  case "attach":
    await attach(a, b, { force, isDemoCommand: false });
    break;
  case "demo":
    await attach(a, path.join(ROOT, "scripts", "demo-shortlist.json"), { force, isDemoCommand: true });
    break;
  case "template":
    console.log(`Copy ${path.join(ROOT, "scripts", "curation-template.json")} → fill it in → npm run curate -- attach <id> <file>`);
    break;
  default:
    console.log(
      [
        "Usage:",
        "  npm run curate -- list",
        "  npm run curate -- show <id>",
        "  npm run curate -- status <id> <submitted|reviewing|curated|completed>",
        "  npm run curate -- attach <id> <picks.json> [--force]",
        "  npm run curate -- demo <id> [--force]",
        "  npm run curate -- template",
      ].join("\n"),
    );
    if (command) process.exit(1);
}
