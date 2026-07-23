import Link from "next/link"

import { siteConfig } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <p className="font-semibold text-foreground">{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
        <p className="mt-3 text-xs">
          © {new Date().getFullYear()} Mindpang.{" "}
          <Link href="/" className="hover:text-foreground">
            issue.mindpang.com
          </Link>
        </p>
      </div>
    </footer>
  )
}
