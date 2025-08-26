"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface RouteTransitionProps {
  children: React.ReactNode;
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  // Avoid global fade/slide animation for wizard step pages to prevent a flash
  // since steps handle their own in-card slide transitions in `WizardLayout`.
  if (pathname?.startsWith("/step-")) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="page-transition-enter">
      {children}
    </div>
  );
}
