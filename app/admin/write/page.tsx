"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, Check } from "lucide-react"

type Status = "idle" | "saving" | "done" | "error"

export default function AdminWritePage() {
  const [token, setToken] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("admin_token")
    if (saved) setToken(saved)
  }, [])

  function saveToken(v: string) {
    setToken(v)
    localStorage.setItem("admin_token", v)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setMessage("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "업로드 실패")
      setThumbnail(json.url)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    setMessage("")
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          thumbnail,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "저장 실패")
      setStatus("done")
      setMessage(`발행 완료: ${json.url}`)
    } catch (e) {
      setStatus("error")
      setMessage(e instanceof Error ? e.message : "저장 실패")
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight">새 이슈 작성</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        issue.mindpang.com 관리자 글쓰기
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            관리자 토큰
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">제목 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="47세 탕웨이 출산, 축복은 못할망정…"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">썸네일</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              이미지 업로드
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f)
                }}
              />
            </label>
            {thumbnail ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Check className="size-4" /> 업로드 완료
              </span>
            ) : null}
          </div>
          {thumbnail ? (
            <div className="relative mt-3 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-lg border border-border">
              <Image
                src={thumbnail}
                alt="thumbnail preview"
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            본문 (HTML) *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={16}
            placeholder="<p>본문 내용을 HTML 로 입력하세요.</p>"
            className={`${inputCls} font-mono text-[13px] leading-relaxed`}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground disabled:opacity-60"
          >
            {status === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            발행하기
          </button>
          {message ? (
            <span
              className={`text-sm ${
                status === "error" ? "text-destructive" : "text-emerald-600"
              }`}
            >
              {message}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  )
}
