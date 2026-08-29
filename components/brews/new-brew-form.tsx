"use client";

import { useState } from "react";

import CafeBrewForm from "@/components/brews/cafe-brew-form";
import HomeBrewForm from "@/components/brews/home-brew-form";
import type { Brew } from "@/types/brew";

/**
 * 기록 작성 폼
 */
export default function NewBrewForm() {
  const [type, setType] = useState<Brew["type"]>("home");

  return type === "home" ? (
    <HomeBrewForm onTypeChange={setType} />
  ) : (
    <CafeBrewForm onTypeChange={setType} />
  );
}
