import Link from "next/link";

/**
 * [id]/page.tsx 의 notFound()가 여기로 온다.
 *
 * page.tsx 자리에 렌더되므로 layout.tsx(헤더 + 목록)는 그대로 남는다 —
 * 오른쪽 칸만 이 내용으로 바뀐다.
 */
export default function BeanNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
      <h2 className="text-lg font-bold">없는 원두에요.</h2>

      <p className="text-sm text-muted-foreground">
        주소가 잘못됐거나 없어진 원두입니다.
      </p>

      <Link
        href="/beans"
        className="mt-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        목록으로
      </Link>
    </div>
  );
}
