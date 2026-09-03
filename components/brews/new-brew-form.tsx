"use client";

import { useEffect, useState } from "react";

import { loadBeans } from "@/app/(main)/(private)/beans/actions";
import CafeBrewForm from "@/components/brews/cafe-brew-form";
import HomeBrewForm, {
  type BeanLoadState,
} from "@/components/brews/home-brew-form";
import type { Bean } from "@/types/bean";
import type { Brew } from "@/types/brew";

type Props = {
  onSubmitDisabledChange: (disabled: boolean) => void;
};

/**
 * 기록 작성 폼
 */
export default function NewBrewForm({ onSubmitDisabledChange }: Props) {
  const [type, setType] = useState<Brew["type"]>("home");
  const [beans, setBeans] = useState<Bean[]>([]);
  const [beanLoadState, setBeanLoadState] = useState<BeanLoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadBeanOptions() {
      try {
        const loadedBeans = await loadBeans();

        if (cancelled) return;

        setBeans(loadedBeans);
        setBeanLoadState("ready");
      } catch {
        if (!cancelled) setBeanLoadState("error");
      }
    }

    void loadBeanOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isBeanUnavailable = beanLoadState !== "ready" || beans.length === 0;

    onSubmitDisabledChange(type === "home" && isBeanUnavailable);
  }, [beanLoadState, beans.length, onSubmitDisabledChange, type]);

  return type === "home" ? (
    <HomeBrewForm
      beanLoadState={beanLoadState}
      beans={beans}
      onTypeChange={setType}
    />
  ) : (
    <CafeBrewForm onTypeChange={setType} />
  );
}
