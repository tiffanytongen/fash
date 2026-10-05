import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CuratedResult, CurationRequest, CurationRequestInput } from "@/types/curation";

// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPMENT-ONLY STORE
//
// Requests and shortlists are plain JSON files in `.data/` (git-ignored):
//
//   .data/requests/<id>.json    one CurationRequest
//   .data/uploads/<id>.<ext>    its inspiration image
//   .data/curations/<id>.json   its CuratedResult (written by `npm run curate`)
//
// This works with `npm run dev` / `npm run start` on your own machine. It does
// NOT work on serverless hosting (e.g. Vercel), where the filesystem is
// read-only — writes throw StorageUnavailableError.
//
// To go live, re-implement these functions against a database (e.g. Supabase:
// `curation_requests`, `curated_results` tables + a storage bucket). Nothing
// else in the app needs to change. Keep scripts/curate.mjs in sync until then.
// ─────────────────────────────────────────────────────────────────────────────

// `turbopackIgnore` tells the bundler these are runtime data paths, not code to
// trace — without it, deploy builds would include the whole project.
const DATA_DIR = process.env.TFD_DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");
const dir = (kind: "requests" | "uploads" | "curations") => path.join(/*turbopackIgnore: true*/ DATA_DIR, kind);

export class StorageUnavailableError extends Error {}

/** Ids are random and unguessable: anyone with the link can view a request. */
const ID_PATTERN = /^req_[a-z0-9]{16}$/;
export const isRequestId = (id: string) => ID_PATTERN.test(id);
const newId = () => `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MIME_BY_EXT = Object.fromEntries(Object.entries(EXTENSIONS).map(([m, e]) => [e, m]));

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function write(file: string, data: string | Uint8Array) {
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new StorageUnavailableError("Request storage is only available when running locally.");
    }
    throw err;
  }
}

export async function createRequest(
  input: CurationRequestInput,
  image: { bytes: Uint8Array; mimeType: string; originalName: string },
): Promise<CurationRequest> {
  const id = newId();
  const now = new Date().toISOString();
  const ext = EXTENSIONS[image.mimeType] ?? "bin";
  const storageKey = `${id}.${ext}`;

  await write(path.join(dir("uploads"), storageKey), image.bytes);

  const request: CurationRequest = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
    inspirationImage: {
      storageKey,
      mimeType: image.mimeType,
      sizeBytes: image.bytes.byteLength,
      originalName: image.originalName.slice(0, 200),
    },
    status: "submitted",
    schemaVersion: 1,
  };
  await write(path.join(dir("requests"), `${id}.json`), JSON.stringify(request, null, 2));
  return request;
}

export async function getRequest(id: string): Promise<CurationRequest | null> {
  if (!isRequestId(id)) return null;
  return readJson<CurationRequest>(path.join(dir("requests"), `${id}.json`));
}

export async function getRequestImage(id: string): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  const request = await getRequest(id);
  if (!request) return null;
  const key = path.basename(request.inspirationImage.storageKey); // never trust a path from disk
  try {
    const bytes = new Uint8Array(await readFile(path.join(dir("uploads"), key)));
    const ext = key.split(".").pop() ?? "";
    return { bytes, mimeType: MIME_BY_EXT[ext] ?? request.inspirationImage.mimeType };
  } catch {
    return null;
  }
}

/**
 * The shortlist for a request, or null if none yet.
 * Today these are written by hand (scripts/curate.mjs). Later an automated
 * pipeline can write the same CuratedResult shape with `source: "automated"`.
 */
export async function getCuratedResult(id: string): Promise<CuratedResult | null> {
  if (!isRequestId(id)) return null;
  return readJson<CuratedResult>(path.join(dir("curations"), `${id}.json`));
}
