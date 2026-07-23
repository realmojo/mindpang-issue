import { NextResponse } from "next/server"

import { isAuthorized } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { slugify } from "@/lib/slug"
import { uploadIssueThumbnailFromUrl } from "@/lib/s3"
import { siteConfig, issueUrl } from "@/lib/site"

/** 중복되지 않는 slug 생성 */
async function uniqueSlug(
  admin: ReturnType<typeof supabaseAdmin>,
  base: string,
): Promise<string> {
  const root = slugify(base) || `issue-${Date.now()}`
  let candidate = root
  for (let i = 2; i < 100; i++) {
    const { data } = await admin
      .from("mindpang_issues")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${root}-${i}`
  }
  return `${root}-${Date.now()}`
}

/**
 * 글 등록 API
 * POST /api/issues
 * Header: Authorization: Bearer <ADMIN_TOKEN>
 * Body(JSON): { title, content, thumbnail?, thumbnailUrl?, slug? }
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const title = String(body.title ?? "").trim()
  const content = String(body.content ?? "").trim()
  if (!title || !content) {
    return NextResponse.json(
      { error: "title, content required" },
      { status: 400 },
    )
  }

  const admin = supabaseAdmin()

  // slug: 직접 지정하면 사용, 아니면 제목에서 자동 생성 (중복 시 -2, -3 …)
  const slug = await uniqueSlug(admin, body.slug ? String(body.slug) : title)

  // 썸네일: thumbnail(S3 URL 직접) 우선, 없으면 thumbnailUrl(원격 이미지)을 S3로 재업로드
  let thumbnail: string | null = body.thumbnail ? String(body.thumbnail) : null
  if (!thumbnail && body.thumbnailUrl) {
    try {
      thumbnail = await uploadIssueThumbnailFromUrl(
        String(body.thumbnailUrl),
        slug.slice(0, 40),
      )
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "thumbnail upload failed" },
        { status: 400 },
      )
    }
  }

  const { data, error } = await admin
    .from("mindpang_issues")
    .insert({ slug, title, content, thumbnail })
    .select("id, slug, thumbnail, created_at")
    .single()

  if (error) {
    console.error("create issue error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      ok: true,
      id: data.id,
      slug: data.slug,
      thumbnail: data.thumbnail,
      url: issueUrl(data.slug),
      path: `/${encodeURIComponent(data.slug)}`,
      created_at: data.created_at,
    },
    { status: 201 },
  )
}

/** 최근 글 목록 (관리자 확인용) */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from("mindpang_issues")
    .select("id, slug, title, thumbnail, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({
    count: data.length,
    site: siteConfig.url,
    items: data.map((it) => ({ ...it, url: issueUrl(it.slug) })),
  })
}
