"use client"

import { useEffect, useRef } from "react"

/**
 * 상세 페이지 조회수 집계용. 화면에 아무것도 그리지 않고, 마운트 시 한 번만
 * `POST /api/issues/{slug}/view` 를 호출한다.
 *
 * 상세 페이지는 ISR(revalidate=300)이라 서버에서 카운트하면 캐시 히트 시 누락되므로
 * 클라이언트에서 집계한다. StrictMode 이중 실행은 ref 로 막는다.
 */
export function ViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    fetch(`/api/issues/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {})
  }, [slug])

  return null
}
