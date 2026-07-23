import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const region = process.env.AWS_REGION!
const bucket = process.env.AWS_BUCKET! // mindpang-image

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/** S3 오브젝트 key 로 공개 URL 생성 */
export function s3PublicUrl(key: string) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

/**
 * 썸네일을 mindpang-image 버킷의 issue/ 폴더에 업로드하고 공개 URL 반환.
 */
export async function uploadIssueThumbnail(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
): Promise<string> {
  const ext = (fileName.split(".").pop() || "jpg").toLowerCase()
  // 파일명 충돌 방지를 위한 경로 (timestamp 는 서버에서 주입)
  const key = `issue/${fileName}`

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType || `image/${ext}`,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  return s3PublicUrl(key)
}

/** 이미 우리 S3 버킷의 URL 인지 여부 */
export function isOwnBucketUrl(url: string) {
  return url.includes(`${bucket}.s3.`)
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

/**
 * 원격 이미지 URL 을 내려받아 issue/ 폴더에 재업로드하고 S3 공개 URL 반환.
 * 외부 이미지를 그대로 참조하지 않고 우리 버킷으로 가져오기 위함.
 */
export async function uploadIssueThumbnailFromUrl(
  remoteUrl: string,
  baseName = "thumb",
): Promise<string> {
  const res = await fetch(remoteUrl)
  if (!res.ok) throw new Error(`이미지 다운로드 실패 (${res.status})`)

  const contentType = res.headers.get("content-type") || "image/jpeg"
  if (!contentType.startsWith("image/")) {
    throw new Error("이미지 URL 이 아닙니다")
  }

  const buf = Buffer.from(await res.arrayBuffer())
  const ext = EXT_BY_MIME[contentType.split(";")[0].trim()] || "jpg"
  const fileName = `${baseName}-${Date.now()}.${ext}`

  return uploadIssueThumbnail(buf, fileName, contentType)
}
