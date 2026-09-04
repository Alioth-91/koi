import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import * as z from "zod";

import BeanDetail from "@/components/beans/bean-detail";
import { getBeanById } from "@/libs/db/beans";
import { listBrewsByBeanId } from "@/libs/db/brews";

const getBean = cache(getBeanById);
const beanIdSchema = z.uuid();

/**
 * 브라우저 탭 제목과 링크 공유 시 미리보기에 쓰인다.
 */
export async function generateMetadata({
  params,
}: PageProps<"/beans/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!beanIdSchema.safeParse(id).success) return {};

  const bean = await getBean(id);

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
  if (!beanIdSchema.safeParse(id).success) notFound();

  const bean = await getBean(id);

  if (!bean) notFound();

  const homeBrews = await listBrewsByBeanId(bean.id);

  return <BeanDetail bean={bean} homeBrews={homeBrews} />;
}
