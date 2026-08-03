"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { AccessibilityMenu } from "@/components/accessibility-menu";

function PearwaaMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" aria-hidden="true" className="text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="11"
          rx="6.5"
          ry="10"
          fill="currentColor"
          opacity="0.85"
          transform={`rotate(${i * 72} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" fill="var(--background)" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The Flower Letter receiving page is a standalone moment — no app chrome.
  if (pathname === "/letter") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full font-heading text-lg tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <PearwaaMark />
          Pearwaa
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <AccessibilityMenu />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu" />}
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-lg font-normal">Pearwaa</SheetTitle>
              </SheetHeader>
              <nav aria-label="Primary" className="px-2">
                <ul className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <SheetClose
                          nativeButton={false}
                          render={
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "block rounded-xl px-4 py-3 text-base transition-colors",
                                active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-secondary",
                              )}
                            />
                          }
                        >
                          {item.label}
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
