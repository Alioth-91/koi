import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { beans } from "@/libs/mocks/beans";
import BeanDetail from "@/components/beans/bean-detail";
import { brews } from "@/libs/mocks/brews";

/**
 * 브라우저 탭 제목과 링크 공유 시 미리보기에 쓰인다.
 */
export async function generateMetadata({
  params,
}: PageProps<"/beans/[id]">): Promise<Metadata> {
  const { id } = await params;
  const bean = beans.find((bean) => bean.id === id);

  // 없는 id는 아래 페이지가 notFound()로 처리한다. 여기선 기본값으로 둔다.
  if (!bean) return {};

  return {
    title: `koi — ${bean.name}`,
    description: [bean.roastery, bean.process].filter(Boolean).join(" · "),
  };
}

export default async function BeanDetailPage({
  params,
}: PageProps<"/beans/[id]">) {
  const { id } = await params;
  const bean = beans.find((bean) => bean.id === id);

  if (!bean) notFound();

  // 선택한 원두를 기록에서 필터링
  const beanBrews = brews
    .filter((brew) => brew.type === "home")
    .filter((brew) => brew.beanName === bean.name);

  return <BeanDetail bean={bean} homeBrews={beanBrews} />;
}
