import Image from "next/image"
import Link from "next/link"

import type { IssueSummary } from "@/lib/issues"
import { timeAgo } from "@/lib/format"

/** 목록용 게시글 카드 */
export function IssueCard({ issue }: { issue: IssueSummary }) {
  const href = `/${encodeURIComponent(issue.slug)}`

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/[0.04]">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {issue.thumbnail ? (
            <Image
              src={issue.thumbnail}
              alt={issue.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              이슈
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight group-hover:text-brand">
            {issue.title}
          </h2>

          <div className="mt-3 text-xs text-muted-foreground">
            {timeAgo(issue.created_at)}
          </div>
        </div>
      </Link>
    </article>
  )
}
