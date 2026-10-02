"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Saved items live in the browser's localStorage for now.
// Shape: a JSON array of product ids, e.g. ["linen-wrap-midi-dress"].
// When we add accounts, this hook can sync to a Supabase `saved_items` table
// while keeping the same API for components.

const STORAGE_KEY = "tfd:saved-items:v1";
const CHANGE_EVENT = "tfd:saved-items-change";

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]"; // storage blocked (e.g. some private browsing modes)
  }
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore: saving is a convenience, not critical.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // "storage" fires when another tab changes the value.
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useSavedItems() {
  // The server has no localStorage, so it renders "[]"; the client then
  // re-renders with the real value. `ready` lets UI avoid a flash of wrong state.
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const ids = useMemo(() => parse(raw), [raw]);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = parse(readRaw());
    write(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);
  }, []);

  const remove = useCallback((id: string) => {
    write(parse(readRaw()).filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, ready, isSaved, toggle, remove, clear };
}
