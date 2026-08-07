import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

/** 조회수 +1 (내부용, 인증 없음). 상세 페이지 진입 시 클라이언트가 호출. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)

  const { error } = await supabaseAdmin().rpc("increment_mindpang_issue_view", {
    p_slug: decoded,
  })

  if (error) {
    console.error("increment view error:", error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
