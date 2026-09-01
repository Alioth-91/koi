import { toBean } from "@/libs/db/bean-mappers";
import { createClient } from "@/libs/db/server";
import type { Bean } from "@/types/bean";

/**
 * 추가한 원두 목록 조회(최신순)
 */
export async function listBeans(): Promise<Bean[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("원두 목록을 불러오지 못했습니다");
  }

  return data.map(toBean);
}

/**
 * 선택한 원두 상세 조회
 *
 * @param id - beanId
 */
export async function getBeanById(id: string): Promise<Bean | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("원두를 불러오지 못했습니다");
  }

  return data ? toBean(data) : null;
}
