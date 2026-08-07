"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Download, X } from "lucide-react"

import { siteConfig } from "@/lib/site"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/** 페이지 진입 후 배너를 띄우기까지 기다리는 시간 */
const DELAY_MS = 3000
/** 닫기를 누르면 이 기간 동안 다시 띄우지 않는다 */
const DISMISS_DAYS = 7
const DISMISS_KEY = "pwa-install-dismissed-at"

function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY))
    if (!at) return false
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

/**
 * PWA 설치 유도 배너.
 *
 * 화면 진입 후 3초가 지나고 브라우저가 설치 가능하다고 알려준 경우(beforeinstallprompt)
 * 에만 하단에서 올라온다. 이미 설치돼 있으면 이 이벤트 자체가 발생하지 않으므로
 * 자연히 뜨지 않고, standalone 실행 중일 때도 따로 막는다.
 *
 * beforeinstallprompt 가 없는 브라우저(iOS Safari 등)에서는 아무것도 렌더링하지 않는다.
 */
export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const deferred = useRef<BeforeInstallPromptEvent | null>(null)
  /** 3초가 지났는지 — 이벤트가 늦게 와도 바로 띄울 수 있게 별도로 둔다 */
  const delayPassed = useRef(false)

  const show = useCallback(() => {
    if (!deferred.current || !delayPassed.current) return
    if (isStandalone() || isDismissed()) return
    setVisible(true)
  }, [])

  useEffect(() => {
    // 서비스 워커 등록 (설치 조건 + 오프라인 폴백)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    if (isStandalone() || isDismissed()) return

    const onBeforeInstall = (event: Event) => {
      // 브라우저 기본 미니 배너를 막고 직접 띄운다
      event.preventDefault()
      deferred.current = event as BeforeInstallPromptEvent
      show()
    }

    const onInstalled = () => {
      deferred.current = null
      setVisible(false)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)

    const timer = setTimeout(() => {
      delayPassed.current = true
      show()
    }, DELAY_MS)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [show])

  const install = async () => {
    const event = deferred.current
    if (!event) return
    setVisible(false)
    deferred.current = null
    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      // 설치를 거절했으면 당분간 다시 묻지 않는다
      if (outcome === "dismissed") remember()
    } catch {
      /* 사용자가 이미 닫은 경우 등 — 무시 */
    }
  }

  const remember = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* 스토리지 차단 환경 — 무시 */
    }
  }

  const close = () => {
    setVisible(false)
    remember()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="앱 설치"
      className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{siteConfig.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            홈 화면에 추가하고 더 빠르게 보세요
          </p>
        </div>

        <button
          type="button"
          onClick={install}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 active:translate-y-px"
        >
          <Download className="size-4" />
          설치
        </button>

        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="-mr-1 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
