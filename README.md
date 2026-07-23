# 마인드팡 이슈 (issue.mindpang.com)

워드프레스 스타일의 이슈/게시판 블로그. Next.js 16 (App Router) + Supabase + AWS S3.

## 구조

| 경로 | 설명 |
| --- | --- |
| `/` | 메인 — 게시글 목록 (대표글 + 그리드) |
| `/[slug]` | 게시글 상세 (예: `/47세-탕웨이-출산-국적-시비`) |
| `/admin/write` | 관리자 글쓰기 UI |
| `POST /api/issues` | 글 등록 (Bearer 인증) — **[API.md](./API.md) 참고** |
| `GET /api/issues` | 글 목록 (Bearer 인증) |
| `POST /api/upload` | 썸네일 S3 업로드 (Bearer 인증) |
| `/sitemap.xml`, `/robots.txt` | SEO |

## 데이터

- **DB**: Supabase 프로젝트 `muefmsmbfhdgcokjzlcd`, 테이블 `public.mindpang_issues`

  | 컬럼 | 타입 | 설명 |
  | --- | --- | --- |
  | `id` | uuid | PK |
  | `slug` | text | URL (`/[slug]`), unique |
  | `title` | text | 제목 |
  | `content` | text | 본문 HTML |
  | `thumbnail` | text | S3 썸네일 URL (nullable) |
  | `created_at` | timestamptz | 작성일 |

  - 읽기: RLS `public read issues` 정책으로 전체 공개, 쓰기는 `service_role` 만
- **썸네일**: S3 `mindpang-image` 버킷의 `issue/` 폴더에 저장
  - 공개 URL: `https://mindpang-image.s3.ap-northeast-2.amazonaws.com/issue/<파일명>`

## 글 등록 방법

### 1) API 로 등록 (자동화 권장)

자세한 내용은 **[API.md](./API.md)**. 가장 간단한 형태:

```bash
curl -X POST https://issue.mindpang.com/api/issues \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"제목","content":"<p>본문 HTML</p>","thumbnailUrl":"https://example.com/img.jpg"}'
```

`thumbnailUrl` 로 원격 이미지를 넘기면 서버가 S3 `issue/` 폴더로 재업로드합니다.

### 2) 관리자 UI 로 등록

1. `/admin/write` 접속 → 상단 **관리자 토큰**에 `.env` 의 `ADMIN_TOKEN` 입력 (localStorage 저장)
2. **제목**, **썸네일**(이미지 업로드), **본문**(HTML) 입력
3. **발행하기** → 제목에서 slug 가 자동 생성되어 `/[slug]` 로 게시

## 환경 변수 (`.env`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET`,
`ADMIN_TOKEN` (관리자 글쓰기/API 인증 — 운영 시 반드시 변경).

## 개발

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run typecheck
```
