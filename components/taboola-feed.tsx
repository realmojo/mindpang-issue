"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

declare global {
  interface Window {
    _taboola?: Record<string, unknown>[]
    __tbLoaderInit?: boolean
  }
}

/** 경로 depth 로 페이지 유형 판별 — 홈은 homepage, 나머지(/[slug])는 article */
function pageType(pathname: string) {
  return pathname === "/" ? "homepage" : "article"
}

/**
 * Taboola 하단 피드 위젯.
 *
 * 로더 주입과 최초 진입 시 PAGE_TYPE 선언은 루트 layout 의 head 스크립트가 전담하고,
 * 이 컴포넌트는 위젯 container push 와 flush 를 담당한다.
 *
 * 다만 mindpang(mindpang-next)과 달리 이 사이트는 next/link 기반 SPA 라우팅이라 내부
 * 이동 시 head 스크립트가 다시 실행되지 않는다(= 페이지 유형이 최초 진입 시점 값으로
 * 굳는다). 그래서 라우트가 바뀐 경우에는 newPageLoad 로 알린 뒤 유형을 다시 선언한다.
 * 한 페이지에 하나만 두는 것을 전제로 한다(newPageLoad 중복 방지).
 */
export function TaboolaFeed({
  container,
  placement,
  mode = "alternating-thumbnails-a",
  className,
}: {
  container: string
  placement: string
  mode?: string
  className?: string
}) {
  const pathname = usePathname()
  const mounted = useRef(false)

  useEffect(() => {
    const queue = (window._taboola = window._taboola || [])

    if (mounted.current) {
      // SPA 라우팅으로 들어온 경우 — 이전 페이지 세션을 닫고 유형을 다시 선언한다
      queue.push({ notify: "newPageLoad" })
      queue.push({ [pageType(pathname)]: "auto", url: window.location.href })
    }
    mounted.current = true

    queue.push({ mode, container, placement, target_type: "mix" })
    queue.push({ flush: true })
  }, [pathname, container, placement, mode])

  return <div id={container} className={cn("mt-12", className)} />
}
