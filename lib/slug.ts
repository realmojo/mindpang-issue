/**
 * 한글 제목을 URL slug 로 변환.
 * 예: "47세 탕웨이 출산, 축복은 못할망정" -> "47세-탕웨이-출산-축복은-못할망정"
 * 한글/영문/숫자는 유지하고 공백/구두점은 하이픈으로 치환한다.
 */
export function slugify(title: string): string {
  return title
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 문자·숫자·공백·하이픈 외 제거
    .replace(/[\s_]+/g, "-") // 공백/언더스코어 -> 하이픈
    .replace(/-+/g, "-") // 중복 하이픈 정리
    .replace(/^-+|-+$/g, "") // 양끝 하이픈 제거
}
