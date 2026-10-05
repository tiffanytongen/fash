"use client";

import { useMemo, useSyncExternalStore } from "react";

// Remembers the ids of requests made in this browser, so shoppers can find
// their shortlist again. Accounts will replace this later.

const KEY = "tfd:my-requests:v1";
const EVENT = "tfd:my-requests-change";

export type MyRequest = { id: string; createdAt: string };

const read = () => {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

const parse = (raw: string): MyRequest[] => {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v)
      ? v.filter((r): r is MyRequest => typeof r?.id === "string" && typeof r?.createdAt === "string")
      : [];
  } catch {
    return [];
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
};

export function rememberRequest(request: MyRequest) {
  const list = [request, ...parse(read()).filter((r) => r.id !== request.id)].slice(0, 20);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Not critical — the success screen also shows the link.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useMyRequests() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  return useMemo(() => parse(raw), [raw]);
}
