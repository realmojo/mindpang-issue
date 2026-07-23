import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="text-5xl font-black text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">글을 찾을 수 없어요</h1>
      <p className="mt-2 text-muted-foreground">
        삭제되었거나 주소가 변경된 이슈일 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground"
      >
        이슈 목록으로
      </Link>
    </div>
  )
}
