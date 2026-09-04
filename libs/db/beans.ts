import { toBean, toBeanInsert, toBeanUpdate } from "@/libs/db/bean-mappers";
import { createClient } from "@/libs/db/server";
import type { BeanForm } from "@/libs/schemas/bean";
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

/**
 * 원두를 저장한다. user_id는 호출자가 세션에서 확인한 값만 받는다.
 */
export async function insertBean(
  input: BeanForm,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("beans")
    .insert(toBeanInsert(input, userId));

  if (error) {
    throw new Error("원두를 저장하지 못했습니다", { cause: error });
  }
}

/**
 * 원두 정보를 수정한다. archived는 별도 액션에서만 변경한다.
 */
export async function updateBeanById(
  id: string,
  input: BeanForm,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("beans")
    .update(toBeanUpdate(input))
    .eq("id", id);

  if (error) {
    throw new Error("원두를 수정하지 못했습니다", { cause: error });
  }
}

/**
 * 원두의 보유 상태를 변경한다. 소유권은 Supabase RLS가 검사한다.
 */
export async function updateBeanArchived(
  id: string,
  archived: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("beans")
    .update({ archived })
    .eq("id", id);

  if (error) {
    throw new Error("원두 상태를 변경하지 못했습니다", { cause: error });
  }
}

/**
 * 원두를 삭제한다. 삭제 권한은 Supabase RLS가 검사한다.
 */
export async function deleteBeanById(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("beans").delete().eq("id", id);

  if (error) {
    throw new Error("원두를 삭제하지 못했습니다", { cause: error });
  }
}
