import { supabase } from "@/lib/supabase"

export type Issue = {
  id: string
  slug: string
  title: string
  content: string
  thumbnail: string | null
  created_at: string | null
}

/** 목록 카드에 필요한 필드만 (본문 제외) */
export type IssueSummary = Omit<Issue, "content">

const LIST_COLUMNS = "id, slug, title, thumbnail, created_at"

/** 메인 페이지용 게시글 목록 */
export async function getIssues(limit = 30): Promise<IssueSummary[]> {
  const { data, error } = await supabase
    .from("mindpang_issues")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("getIssues error:", error.message)
    return []
  }
  return (data as IssueSummary[]) ?? []
}

/** slug 로 단일 게시글 조회 */
export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const { data, error } = await supabase
    .from("mindpang_issues")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("getIssueBySlug error:", error.message)
    return null
  }
  return (data as Issue) ?? null
}

/** 상세 하단 "관련 글" */
export async function getRelatedIssues(
  slug: string,
  limit = 4,
): Promise<IssueSummary[]> {
  const { data, error } = await supabase
    .from("mindpang_issues")
    .select(LIST_COLUMNS)
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as IssueSummary[]) ?? []
}
