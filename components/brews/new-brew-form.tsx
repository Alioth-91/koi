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
  brew?: Brew;
  formId?: string;
  onSubmitDisabledChange: (disabled: boolean) => void;
  onSuccess?: () => void;
};

/**
 * 기록 등록·수정 폼
 */
export default function NewBrewForm({
  brew,
  formId,
  onSubmitDisabledChange,
  onSuccess,
}: Props) {
  const [type, setType] = useState<Brew["type"]>(brew?.type ?? "home");
  const [beans, setBeans] = useState<Bean[]>([]);
  const [beanLoadState, setBeanLoadState] = useState<BeanLoadState>("loading");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

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

    onSubmitDisabledChange(
      isFormSubmitting || (type === "home" && isBeanUnavailable),
    );
  }, [
    beanLoadState,
    beans.length,
    isFormSubmitting,
    onSubmitDisabledChange,
    type,
  ]);

  const homeBrew = brew?.type === "home" ? brew : undefined;
  const cafeBrew = brew?.type === "cafe" ? brew : undefined;

  return type === "home" ? (
    <HomeBrewForm
      beanLoadState={beanLoadState}
      beans={beans}
      brew={homeBrew}
      formId={formId}
      isEditing={brew !== undefined}
      onSubmitDisabledChange={setIsFormSubmitting}
      onSuccess={onSuccess}
      onTypeChange={setType}
    />
  ) : (
    <CafeBrewForm
      brew={cafeBrew}
      formId={formId}
      isEditing={brew !== undefined}
      onSubmitDisabledChange={setIsFormSubmitting}
      onSuccess={onSuccess}
      onTypeChange={setType}
    />
  );
}
