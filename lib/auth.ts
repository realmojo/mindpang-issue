/**
 * 관리자 요청 인증.
 * - ADMIN_TOKEN 이 설정돼 있지 않으면 인증을 생략한다(누구나 허용).
 * - 설정돼 있으면 Authorization: Bearer <ADMIN_TOKEN> 와 일치해야 한다.
 */
export function isAuthorized(request: Request): boolean {
  const token = process.env.ADMIN_TOKEN?.trim()
  if (!token) return true // 토큰 미설정 → 인증 없이 허용

  const header = request.headers.get("authorization") ?? ""
  const provided = header.replace(/^Bearer\s+/i, "").trim()
  return provided.length > 0 && provided === token
}
