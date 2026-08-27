"use client";

import { useState } from "react";

import CafeBrewForm from "@/components/brews/cafe-brew-form";
import HomeBrewForm from "@/components/brews/home-brew-form";
import type { Brew } from "@/types/brew";

/**
 * 기록 작성 폼
 *
 * 여기는 어느 쪽을 보여줄지만 기억한다. 2단 배치도 세그먼트도 각 폼 안에 있다 —
 * 우측 패널에 총점·센서리가 들어가는데, 그 입력이 폼의 useForm에 닿아야 하기 때문이다.
 */
export default function NewBrewForm() {
  const [type, setType] = useState<Brew["type"]>("home");

  return type === "home" ? (
    <HomeBrewForm onTypeChange={setType} />
  ) : (
    <CafeBrewForm onTypeChange={setType} />
  );
}
