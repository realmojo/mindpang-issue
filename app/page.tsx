import Image from "next/image"
import Link from "next/link"
import { Flame } from "lucide-react"

import { getIssues } from "@/lib/issues"
import { IssueCard } from "@/components/issue-card"
import { timeAgo } from "@/lib/format"

// 항상 최신 목록을 보여주기 위해 매 요청마다 갱신
export const revalidate = 60

export default async function HomePage() {
  const issues = await getIssues(31)

  if (issues.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">아직 등록된 이슈가 없어요</h1>
        <p className="mt-2 text-muted-foreground">
          첫 번째 글이 등록되면 여기에 표시됩니다.
        </p>
      </div>
    )
  }

  const [featured, ...rest] = issues

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* 섹션 타이틀 */}
      <div className="mb-6 flex items-center gap-2">
        <Flame className="size-5 text-brand" strokeWidth={2.5} />
        <h1 className="text-xl font-extrabold tracking-tight">지금 뜨는 이슈</h1>
      </div>

      {/* 대표 글 */}
      <Link
        href={`/${encodeURIComponent(featured.slug)}`}
        className="group mb-10 grid gap-5 overflow-hidden rounded-3xl border border-border/70 bg-card md:grid-cols-2"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-auto md:h-full">
          {featured.thumbnail ? (
            <Image
              src={featured.thumbnail}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center text-muted-foreground">
              이슈
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-5 md:p-8">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight group-hover:text-brand md:text-3xl">
            {featured.title}
          </h2>
          <div className="mt-5 text-sm text-muted-foreground">
            {timeAgo(featured.created_at)}
          </div>
        </div>
      </Link>

      {/* 나머지 목록 */}
      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
