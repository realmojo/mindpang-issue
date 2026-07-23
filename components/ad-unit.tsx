"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const AD_CLIENT = "ca-pub-9130836798889522"

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

/** AdSense 디스플레이 광고 유닛 */
export function AdUnit({
  slot,
  className,
}: {
  slot: string
  className?: string
}) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* 광고 로더 미로딩/차단 시 무시 */
    }
  }, [])

  return (
    <ins
      className={cn("adsbygoogle block", className)}
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
