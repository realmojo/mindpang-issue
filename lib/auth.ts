/** 관리자 요청 인증: Authorization: Bearer <ADMIN_TOKEN> */
export function isAuthorized(request: Request): boolean {
  const token = process.env.ADMIN_TOKEN
  if (!token) return false
  const header = request.headers.get("authorization") ?? ""
  const provided = header.replace(/^Bearer\s+/i, "").trim()
  return provided.length > 0 && provided === token
}
