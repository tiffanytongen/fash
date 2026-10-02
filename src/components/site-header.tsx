"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSavedItems } from "@/lib/saved-items";
import { HeartIcon } from "./icons";
import { NAV_LINKS, isActive } from "./nav-links";

export function SiteHeader() {
  const pathname = usePathname();
  const { ids, ready } = useSavedItems();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link href="/" className="font-serif text-2xl leading-none tracking-tight">
          Taobao <span className="italic">Discovery</span>
        </Link>

        {/* Desktop navigation. Mobile uses the bottom tab bar instead. */}
        <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className="text-muted transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              {link.label}
              {link.href === "/saved" && ready && ids.length > 0 && (
                <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-paper">
                  {ids.length}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <Link
          href="/saved"
          className="relative rounded-full p-2 md:hidden"
          aria-label={`Saved items${ready ? ` (${ids.length})` : ""}`}
        >
          <HeartIcon />
          {ready && ids.length > 0 && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />
          )}
        </Link>
      </div>
    </header>
  );
}
