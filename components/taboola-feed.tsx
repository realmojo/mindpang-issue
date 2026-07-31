"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

declare global {
  interface Window {
    _taboola?: Record<string, unknown>[]
    __tbLoaderInit?: boolean
  }
}

/**
 * Taboola 하단 피드 위젯.
 *
 * 로더 주입과 PAGE_TYPE 선언은 루트 layout 의 head 스크립트가 전담하고, 이 컴포넌트는
 * 위젯 container 를 push 한다. 사이트 내 이동이 전부 <a> 태그(전체 리로드)라 head
 * 스크립트가 매 페이지마다 다시 실행되므로 페이지 유형은 항상 경로와 일치한다.
 *
 * push 는 클라이언트 마운트 시점이라 <body> 끝 flush 보다 늦을 수 있어 스스로 한 번 더
 * flush 한다(Taboola 는 컨테이너 단위로 처리하므로 중복 flush 는 무해).
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
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true

    const queue = (window._taboola = window._taboola || [])
    queue.push({ mode, container, placement, target_type: "mix" })
    queue.push({ flush: true })
  }, [container, placement, mode])

  return <div id={container} className={cn("mt-12", className)} />
}
