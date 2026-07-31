"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const PUBLISHER_ID = "mojoday-network"
const LOADER_ID = "tb_loader_script"
const LOADER_URL = `//cdn.taboola.com/libtrc/${PUBLISHER_ID}/loader.js`
const LOADER_PRIVACY_URL = `//static.tblcontent.com/libtrc/${PUBLISHER_ID}/loader.privacy.js`
const PIXEL_URL = `https://static.qovani.com/libtrc/tr5?type=pixel&publisher=${PUBLISHER_ID}`

declare global {
  interface Window {
    _taboola?: Record<string, unknown>[]
    __tbLoaderInit?: boolean
  }
}

/** loader.js 를 페이지당 한 번만 주입 (차단 시 privacy 로더로 폴백) */
function injectLoader() {
  if (window.__tbLoaderInit) return
  window.__tbLoaderInit = true

  new Image().src = PIXEL_URL

  const inject = (id: string, src: string, fallback?: string) => {
    if (document.getElementById(id)) return
    const s = document.createElement("script")
    s.async = true
    s.src = src
    s.id = id
    if (fallback) {
      s.onerror = () => {
        s.parentNode?.removeChild(s)
        inject(`${LOADER_ID}_fb`, fallback)
      }
    }
    document.head.appendChild(s)
  }

  inject(LOADER_ID, LOADER_URL, LOADER_PRIVACY_URL)
  window.performance?.mark?.("tbl_ic")
}

/** 경로 depth 로 페이지 유형 판별 — 홈은 homepage, 나머지(/[slug])는 article */
function pageType(pathname: string) {
  return pathname === "/" ? "homepage" : "article"
}

/**
 * Taboola 하단 피드 위젯.
 *
 * mindpang(mindpang-next)은 내부 이동이 전체 리로드라 로더/PAGE_TYPE 을 layout <head>
 * 인라인 스크립트가 전담하지만, 이 사이트는 next/link 기반 SPA 라우팅이라 head 스크립트가
 * 최초 1회만 실행된다. 그래서 로더 주입·페이지 유형 선언·위젯 push·flush 를 이 컴포넌트가
 * 모두 담당하고, 라우트 이동 시에는 newPageLoad 로 알린 뒤 다시 push 한다.
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
      // SPA 라우팅으로 들어온 경우 — 이전 페이지 세션을 닫고 새 페이지로 알린다
      queue.push({ notify: "newPageLoad" })
    } else {
      mounted.current = true
      injectLoader()
    }

    queue.push({ [pageType(pathname)]: "auto", url: window.location.href })
    queue.push({ mode, container, placement, target_type: "mix" })
    queue.push({ flush: true })
  }, [pathname, container, placement, mode])

  return <div id={container} className={cn("mt-12", className)} />
}
