/** 2026-07-24T... -> "2026.07.24" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

/** 상대 시간: "방금 전", "3시간 전", "2일 전", 그 이상은 날짜 */
export function timeAgo(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value).getTime()
  if (Number.isNaN(d)) return ""
  const diff = Date.now() - d
  const min = Math.floor(diff / 60000)
  if (min < 1) return "방금 전"
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`
  return formatDate(value)
}
