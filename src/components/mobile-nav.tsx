"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, HeartIcon, HomeIcon, UploadIcon } from "./icons";
import { NAV_LINKS, isActive } from "./nav-links";

const ICONS = {
  "/": HomeIcon,
  "/discover": GridIcon,
  "/inspiration": UploadIcon,
  "/saved": HeartIcon,
} as const;

// Thumb-friendly bottom tab bar, shown on small screens only.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_LINKS.map((link) => {
          const Icon = ICONS[link.href];
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] tracking-wide ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <Icon />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
