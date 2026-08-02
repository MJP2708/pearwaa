import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center sm:px-8">
        <p className="font-heading text-base text-foreground/80">
          Some feelings are easier to hand someone than to say out loud.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/70">Pearwaa — made for quiet moments, not notifications.</p>
      </div>
    </footer>
  );
}
