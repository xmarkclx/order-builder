"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/step-1", label: "Order Builder" },
  { href: "/recent-orders", label: "Recent Orders" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex items-center gap-6">
      {links.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "relative px-1 font-medium text-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-foreground"
                : "px-1 text-muted-foreground hover:text-foreground hover:underline"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
