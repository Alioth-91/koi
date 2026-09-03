import * as z from "zod";

import {
  toBrew,
  toBrewInsert,
  type ResolvedBrewForm,
} from "@/libs/db/brew-mappers";
import { createClient } from "@/libs/db/server";
import type { Brew, HomeBrew } from "@/types/brew";
import type { Database } from "@/types/supabase";

/*
 * 기록 소유권은 Supabase RLS가 로그인한 사용자를 기준으로 검사한다.
 * 따라서 각 조회 함수에서 user_id 조건을 따로 넣지 않는다.
 */
type BrewRow = Database["public"]["Tables"]["brews"]["Row"];

const brewIdSchema = z.uuid();
const BREW_LOAD_ERROR = "기록을 불러오지 못했습니다";
const BREW_SAVE_ERROR = "기록을 저장하지 못했습니다";

/**
 * 서버에서 원두 연결을 확인한 기록을 로그인한 사용자의 기록으로 저장한다.
 */
export async function insertBrew(
  input: ResolvedBrewForm,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("brews")
    .insert(toBrewInsert(input, userId));

  if (error) {
    throw new Error(BREW_SAVE_ERROR, { cause: error });
  }
}

/**
 * 로그인한 사용자의 모든 기록을 최신 날짜순으로 조회한다.
 */
export async function listBrews(): Promise<Brew[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brews")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(BREW_LOAD_ERROR, { cause: error });
  }

  return data.map(mapBrew);
}

/**
 * 로그인한 사용자가 볼 수 있는 기록을 ID로 조회한다.
 *
 * @param id - 조회할 기록의 UUID
 */
export async function getBrewById(brewId: string): Promise<Brew | null> {
  if (!brewIdSchema.safeParse(brewId).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brews")
    .select("*")
    .eq("id", brewId)
    .maybeSingle();

  if (error) {
    throw new Error(BREW_LOAD_ERROR, { cause: error });
  }

  return data ? mapBrew(data) : null;
}

/**
 * 특정 원두에 연결된 로그인한 사용자의 집 기록을 최신 날짜순으로 조회한다.
 */
export async function listBrewsByBeanId(beanId: string): Promise<HomeBrew[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brews")
    .select("*")
    .eq("bean_id", beanId)
    .eq("type", "home")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(BREW_LOAD_ERROR, { cause: error });
  }

  return data
    .map(mapBrew)
    .filter((brew): brew is HomeBrew => brew.type === "home");
}

function mapBrew(row: BrewRow): Brew {
  try {
    return toBrew(row);
  } catch (error) {
    throw new Error(BREW_LOAD_ERROR, { cause: error });
  }
}
