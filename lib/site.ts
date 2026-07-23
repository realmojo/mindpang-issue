export const siteConfig = {
  name: "마인드팡 이슈",
  shortName: "이슈",
  description:
    "지금 가장 뜨거운 이슈, 연예·사회·화제의 소식을 빠르게 전하는 마인드팡 이슈.",
  url: "https://issue.mindpang.com",
  ogImage: "https://issue.mindpang.com/og.png",
} as const

/** 게시글 절대 URL */
export function issueUrl(slug: string) {
  return `${siteConfig.url}/${encodeURIComponent(slug)}`
}
