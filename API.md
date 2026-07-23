# 마인드팡 이슈 — 글 등록 API 설명서

`issue.mindpang.com` 에 글을 등록/조회하는 REST API 문서입니다.

- **Base URL**: `https://issue.mindpang.com`
- **인증(선택)**: 환경변수 `ADMIN_TOKEN` 이 **설정돼 있을 때만** `Authorization: Bearer <ADMIN_TOKEN>` 헤더가 필요합니다. `ADMIN_TOKEN` 을 설정하지 않으면 **인증 없이 누구나** 등록할 수 있습니다.
- **본문 형식**: `application/json` (썸네일 파일 업로드만 `multipart/form-data`)

> ⚠️ `ADMIN_TOKEN` 을 비워두면 글 등록 API가 공개됩니다. 공개 도메인에 배포한다면 스팸/도배 방지를 위해 토큰 설정을 권장합니다.

---

## 1. 글 등록 — `POST /api/issues`

가장 많이 쓰는 API. 제목·본문(HTML)만 있으면 글이 발행되고, slug(URL)는 제목에서 자동 생성됩니다.

### 요청 헤더

| 헤더 | 값 |
| --- | --- |
| `Authorization` | `Bearer <ADMIN_TOKEN>` |
| `Content-Type` | `application/json` |

### 요청 바디

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | :---: | --- |
| `title` | string | ✅ | 글 제목 |
| `content` | string | ✅ | 본문 **HTML** (아래 [본문 작성](#본문-작성-html) 참고) |
| `thumbnail` | string | ⬜ | 이미 S3 에 올라간 썸네일 URL (직접 지정) |
| `thumbnailUrl` | string | ⬜ | **원격 이미지 URL**. 서버가 내려받아 S3 `issue/` 폴더로 재업로드 후 사용 |
| `slug` | string | ⬜ | URL 을 직접 지정하고 싶을 때. 생략하면 `title` 로 자동 생성 |

> `thumbnail` 과 `thumbnailUrl` 을 둘 다 주면 `thumbnail` 이 우선합니다.
> slug 가 이미 존재하면 자동으로 `-2`, `-3` … 이 붙습니다.

### 응답 `201 Created`

```json
{
  "ok": true,
  "id": "f3f9e65f-542b-4037-89c3-5b980e5ee599",
  "slug": "47세-탕웨이-출산-국적-시비",
  "thumbnail": "https://mindpang-image.s3.ap-northeast-2.amazonaws.com/issue/47세-탕웨이-...-1784820780513.jpg",
  "url": "https://issue.mindpang.com/47%EC%84%B8-...",
  "path": "/47%EC%84%B8-...",
  "created_at": "2026-07-24T15:33:03.497Z"
}
```

### 예시

**A. 원격 이미지를 그대로 넘겨 한 번에 등록 (자동 포스팅에 권장)**

```bash
curl -X POST https://issue.mindpang.com/api/issues \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "47세 탕웨이 출산 소식",
    "content": "<p>첫 문단입니다.</p><h2>소제목</h2><p>둘째 문단.</p>",
    "thumbnailUrl": "https://example.com/some-image.jpg"
  }'
```

**B. S3 에 이미 올린 썸네일 URL 지정**

```bash
curl -X POST https://issue.mindpang.com/api/issues \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "제목",
    "content": "<p>본문</p>",
    "thumbnail": "https://mindpang-image.s3.ap-northeast-2.amazonaws.com/issue/my-thumb.jpg"
  }'
```

**C. 토큰 미설정 시 — 헤더 없이 텍스트만**

```bash
curl -X POST https://issue.mindpang.com/api/issues \
  -H "Content-Type: application/json" \
  -d '{ "title": "제목", "content": "<p>본문</p>" }'
```

**D. JavaScript / Node (fetch)**

```js
const res = await fetch("https://issue.mindpang.com/api/issues", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "47세 탕웨이 출산 소식",
    content: "<p>첫 문단</p><h2>소제목</h2><p>둘째 문단</p>",
    thumbnailUrl: "https://example.com/image.jpg",
  }),
})
const data = await res.json()
console.log(data.url) // 발행된 글 주소
```

---

## 2. 썸네일 파일 업로드 — `POST /api/upload`

이미지 파일을 직접 업로드해서 S3 URL 을 먼저 받고 싶을 때 사용합니다.
(원격 이미지 URL 만 있다면 이 단계 없이 위 `thumbnailUrl` 로 한 번에 처리하세요.)

- **Content-Type**: `multipart/form-data`
- **필드**: `file` (이미지 파일)
- 저장 위치: `mindpang-image` 버킷의 `issue/` 폴더

```bash
curl -X POST https://issue.mindpang.com/api/upload \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@./thumbnail.jpg"
```

응답:

```json
{ "url": "https://mindpang-image.s3.ap-northeast-2.amazonaws.com/issue/thumbnail-1784820780513.jpg" }
```

이 `url` 을 `POST /api/issues` 의 `thumbnail` 필드에 넣으면 됩니다.

---

## 3. 글 목록 조회 — `GET /api/issues`

최근 글 최대 100개를 반환합니다 (관리자 확인용, 인증 필요).

```bash
curl https://issue.mindpang.com/api/issues \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

```json
{
  "count": 2,
  "site": "https://issue.mindpang.com",
  "items": [
    {
      "id": "…",
      "slug": "47세-탕웨이-출산-국적-시비",
      "title": "47세 탕웨이 출산 소식",
      "thumbnail": "https://mindpang-image.s3.…/issue/….jpg",
      "created_at": "2026-07-24T15:33:03.497Z",
      "url": "https://issue.mindpang.com/47%EC%84%B8-…"
    }
  ]
}
```

---

## 본문 작성 (HTML)

`content` 는 HTML 문자열입니다. 아래 태그가 자동으로 예쁘게 스타일링됩니다 (`.article-content`):

| 태그 | 용도 |
| --- | --- |
| `<p>` | 문단 |
| `<h2>`, `<h3>` | 소제목 |
| `<strong>` | 굵게 강조 |
| `<ul>`, `<ol>`, `<li>` | 목록 |
| `<blockquote>` | 인용구 |
| `<a href>` | 링크 |
| `<img src>` | 본문 삽입 이미지 |
| `<figure><img><figcaption>` | 이미지 + 설명 |
| `<table>` | 표 |
| `<hr>` | 구분선 |

예:

```html
<p>기사 도입부 문단입니다.</p>
<h2>첫 번째 소제목</h2>
<p>내용에 <strong>강조</strong>와 <a href="https://...">링크</a>를 넣을 수 있습니다.</p>
<blockquote>"인용문은 이렇게 표시됩니다."</blockquote>
<ul>
  <li>목록 항목 1</li>
  <li>목록 항목 2</li>
</ul>
<img src="https://mindpang-image.s3.ap-northeast-2.amazonaws.com/issue/inline.jpg" alt="설명" />
```

> ⚠️ `content` 는 그대로 렌더링되므로 **신뢰할 수 있는 본문만** 넣으세요 (관리자 전용 API).

---

## URL 규칙

- 글 주소: `https://issue.mindpang.com/{slug}`
- slug 는 한글 제목에서 공백·구두점을 하이픈으로 바꿔 생성됩니다.
  - 예) `47세 탕웨이 출산, 국적 시비` → `47세-탕웨이-출산-국적-시비`
- 브라우저 주소창에서는 한글이 퍼센트 인코딩되어 보입니다 (`47%EC%84%B8-…`). 정상입니다.

---

## 에러 응답

| 상태 | 바디 | 원인 |
| --- | --- | --- |
| `401` | `{ "error": "unauthorized" }` | `ADMIN_TOKEN` 설정된 상태에서 토큰 없음/불일치 |
| `400` | `{ "error": "invalid json" }` | 요청 바디가 JSON 이 아님 |
| `400` | `{ "error": "title, content required" }` | 필수값 누락 |
| `400` | `{ "error": "이미지 다운로드 실패 (404)" }` | `thumbnailUrl` 을 가져오지 못함 |
| `500` | `{ "error": "<메시지>" }` | DB/서버 오류 |

---

## 요약 흐름

```
[원격 이미지 URL 있음]  →  POST /api/issues { title, content, thumbnailUrl }   ← 한 번에 끝
[이미지 파일만 있음]    →  POST /api/upload (file)  →  받은 url 을 thumbnail 로 POST /api/issues
[텍스트만]              →  POST /api/issues { title, content }
```
