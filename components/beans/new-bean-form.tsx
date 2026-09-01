import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createBean } from "@/app/(main)/(private)/beans/actions";
import FieldCard from "@/components/brews/field-card";
import { PROCESSES, ROAST_LEVELS } from "@/libs/constants/beans";
import { BEAN_NEW_FORM_ID } from "@/libs/constants/forms";
import { beanSchema, type BeanForm } from "@/libs/schemas/bean";

/**
 * 원두 등록 폼
 */
const PROCESS_LIST_ID = "bean-process-list";
const ROAST_LEVEL_LIST_ID = "bean-roast-level-list";
const BEAN_FIELDS = [
  "name",
  "roastery",
  "roastedAt",
  "process",
  "roastLevel",
  "weight",
  "price",
] as const satisfies ReadonlyArray<keyof BeanForm>;

export default function NewBeanForm() {
  const router = useRouter();
  const {
    clearErrors,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof beanSchema>, // 폼이 들고 있는 값 — 빈 칸은 ""
    unknown,
    z.output<typeof beanSchema> // handleSubmit이 주는 값 — 빈 칸은 undefined
  >({ resolver: zodResolver(beanSchema) });

  const onSubmit = handleSubmit(async (values) => {
    // 이전 실패 메시지가 다음 시도에도 남지 않게 하는 목적
    clearErrors("root.server");

    const result = await createBean(values);

    for (const field of BEAN_FIELDS) {
      const message = result.errors?.[field]?.[0];

      if (message) {
        setError(field, { type: "server", message });
      }
    }

    if (result.errorMessage) {
      setError("root.server", {
        type: "server",
        message: result.errorMessage,
      });
    }

    if (result.errors || result.errorMessage) {
      return;
    }

    router.refresh();
    router.replace("/beans");
  });

  return (
    <form
      aria-busy={isSubmitting}
      className="flex flex-1 flex-col gap-2.5 p-6"
      id={BEAN_NEW_FORM_ID}
      noValidate
      onSubmit={onSubmit}
    >
      <FieldCard
        disabled={isSubmitting}
        error={errors.name?.message}
        label="원두 이름"
        placeholder="에티오피아 예가체프"
        required
        {...register("name")}
      />

      <FieldCard
        disabled={isSubmitting}
        error={errors.roastery?.message}
        label="로스터리"
        placeholder="프릳츠"
        {...register("roastery")}
      />

      <FieldCard
        disabled={isSubmitting}
        error={errors.roastedAt?.message}
        label="로스팅 날짜"
        type="date"
        {...register("roastedAt")}
      />

      <FieldCard
        disabled={isSubmitting}
        error={errors.process?.message}
        label="가공 방식"
        list={PROCESS_LIST_ID}
        placeholder="워시드"
        {...register("process")}
      />

      <datalist id={PROCESS_LIST_ID}>
        {PROCESSES.map((process) => (
          <option key={process} value={process} />
        ))}
      </datalist>

      <FieldCard
        disabled={isSubmitting}
        error={errors.roastLevel?.message}
        label="로스팅 포인트"
        list={ROAST_LEVEL_LIST_ID}
        placeholder="미디엄"
        {...register("roastLevel")}
      />

      <datalist id={ROAST_LEVEL_LIST_ID}>
        {ROAST_LEVELS.map((level) => (
          <option key={level} value={level} />
        ))}
      </datalist>

      <FieldCard
        disabled={isSubmitting}
        error={errors.weight?.message}
        label="구매 용량 (g)"
        placeholder="200"
        type="number"
        {...register("weight")}
      />

      <FieldCard
        disabled={isSubmitting}
        error={errors.price?.message}
        label="가격 (원)"
        placeholder="21000"
        type="number"
        {...register("price")}
      />

      <p aria-live="polite" className="min-h-5 text-sm text-destructive">
        {isSubmitting ? "원두를 저장하는 중..." : errors.root?.server?.message}
      </p>
    </form>
  );
}
