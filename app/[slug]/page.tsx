import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { getIssueBySlug, getRelatedIssues } from "@/lib/issues"
import { IssueCard } from "@/components/issue-card"
import { AdUnit } from "@/components/ad-unit"
import { siteConfig, issueUrl } from "@/lib/site"

/** 본문 HTML 을 첫 문단(</p>) 뒤에서 분리 — 중간 광고 삽입용 */
function splitAfterFirstParagraph(html: string): [string, string] {
  const marker = "</p>"
  const idx = html.indexOf(marker)
  if (idx === -1) return [html, ""]
  const cut = idx + marker.length
  return [html.slice(0, cut), html.slice(cut)]
}

export const revalidate = 300

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const issue = await getIssueBySlug(decodeURIComponent(slug))
  if (!issue) return { title: "글을 찾을 수 없습니다" }

  const description = siteConfig.description
  const url = issueUrl(issue.slug)
  const images = issue.thumbnail ? [{ url: issue.thumbnail }] : undefined

  return {
    title: issue.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: issue.title,
      description,
      images,
      publishedTime: issue.created_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description,
      images,
    },
  }
}

export default async function IssuePage({ params }: Props) {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const issue = await getIssueBySlug(decoded)
  if (!issue) notFound()

  const related = await getRelatedIssues(issue.slug, 3)
  const [firstPart, restPart] = splitAfterFirstParagraph(issue.content)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: issue.title,
    image: issue.thumbnail ? [issue.thumbnail] : undefined,
    datePublished: issue.created_at ?? undefined,
    author: { "@type": "Organization", name: "Mindpang" },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: issueUrl(issue.slug),
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        이슈 목록
      </Link>

      {/* 광고: 이슈_상단 (제목 위) */}
      <AdUnit slot="6709317490" className="mb-6" />

      <header>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.5rem] sm:leading-[1.15]">
          {issue.title}
        </h1>
      </header>

      {issue.thumbnail ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={issue.thumbnail}
            alt={issue.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      {/* 본문 (HTML) — 첫 문단 뒤에 중간 광고 삽입 */}
      <div
        className="article-content mt-10"
        dangerouslySetInnerHTML={{ __html: firstPart }}
      />

      {/* 광고: 이슈_중간 (첫 문단 끝) */}
      <AdUnit slot="9686568690" className="my-8" />

      {restPart ? (
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: restPart }}
        />
      ) : null}

      {/* 관련 글 */}
      {related.length > 0 ? (
        <section className="mt-16 border-t border-border/70 pt-10">
          <h2 className="mb-6 text-lg font-extrabold tracking-tight">
            다른 이슈도 보기
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <IssueCard key={r.id} issue={r} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
