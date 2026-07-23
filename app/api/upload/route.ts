import { NextResponse } from "next/server"

import { isAuthorized } from "@/lib/auth"
import { uploadIssueThumbnail } from "@/lib/s3"
import { slugify } from "@/lib/slug"

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "image only" }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "thumb"
  // 고유 파일명: <slug>-<timestamp>.<ext>  ->  issue/ 폴더에 저장
  const fileName = `${base}-${Date.now()}.${ext}`

  try {
    const url = await uploadIssueThumbnail(bytes, fileName, file.type)
    return NextResponse.json({ url })
  } catch (e) {
    console.error("upload error:", e)
    return NextResponse.json({ error: "upload failed" }, { status: 500 })
  }
}
