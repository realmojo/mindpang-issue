import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * 읽기 전용 클라이언트 (RLS 적용, 공개 글만 조회).
 * 서버 컴포넌트에서 목록/상세 조회에 사용.
 */
export const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
})

/**
 * 관리자용 클라이언트 (service_role, RLS 우회).
 * 절대 클라이언트 번들에 노출되면 안 됨 — 서버(route handler)에서만 사용.
 */
export function supabaseAdmin() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
