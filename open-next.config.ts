import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// 기본 구성 (R2 증분 캐시 미사용 — 추가 리소스 없이 바로 배포 가능)
export default defineCloudflareConfig({})
