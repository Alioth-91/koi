import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BrewDetail from "@/components/brews/brew-detail";
import { brews } from "@/libs/mocks/brews";
import { formatDate } from "@/libs/utils";

/**
 * 브라우저 탭 제목과 링크 공유 시 미리보기에 쓰인다.
 */
export async function generateMetadata({
  params,
}: PageProps<"/brews/[id]">): Promise<Metadata> {
  const { id } = await params;
  const brew = brews.find((brew) => brew.id === id);

  // 없는 id는 아래 페이지가 notFound()로 처리한다. 여기선 기본값으로 둔다.
  if (!brew) return {};

  const name = brew.type === "home" ? brew.beanName : brew.cafeName;

  return {
    title: `koi — ${name}`,
    description: `${formatDate(brew.date)} · 총점 ${brew.score}`,
  };
}

export default async function BrewDetailPage({
  params,
}: PageProps<"/brews/[id]">) {
  const { id } = await params;
  const brew = brews.find((brew) => brew.id === id);

  // notFound()는 반환하지 않고 렌더를 끊는다 — 이 줄 아래로는 brew가 undefined일 수 없다.
  if (!brew) notFound();

  return <BrewDetail brew={brew} />;
}
