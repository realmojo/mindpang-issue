/**
 * 마인드팡 이슈 서비스 워커.
 *
 * 목적은 두 가지뿐이다.
 *  1) PWA 설치 조건 충족 (fetch 핸들러 + 오프라인 동작)
 *  2) 오프라인일 때 안내 페이지 노출
 *
 * 본문 HTML 은 캐시하지 않는다 — ISR/광고/조회수 집계가 항상 최신 네트워크 응답을
 * 쓰도록 두고, 네트워크가 죽었을 때만 /offline.html 로 폴백한다.
 */
const CACHE = "mindpang-issue-v1"
const OFFLINE_URL = "/offline.html"
const PRECACHE = [OFFLINE_URL, "/icon-192.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  // 페이지 이동만 가로챈다. 나머지(스크립트/이미지/API)는 브라우저 기본 동작 그대로.
  if (request.mode !== "navigate") return

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(OFFLINE_URL).then((res) => res ?? Response.error()),
    ),
  )
})
