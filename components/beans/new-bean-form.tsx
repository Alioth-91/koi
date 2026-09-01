import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import FieldCard from "@/components/brews/field-card";
import { PROCESSES, ROAST_LEVELS } from "@/libs/constants/beans";
import { BEAN_NEW_FORM_ID } from "@/libs/constants/forms";
import { beanSchema } from "@/libs/schemas/bean";

/**
 * 원두 등록 폼
 */
const PROCESS_LIST_ID = "bean-process-list";
const ROAST_LEVEL_LIST_ID = "bean-roast-level-list";

export default function NewBeanForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof beanSchema>, // 폼이 들고 있는 값 — 빈 칸은 ""
    unknown,
    z.output<typeof beanSchema> // handleSubmit이 주는 값 — 빈 칸은 undefined
  >({ resolver: zodResolver(beanSchema) });

  return (
    <form
      className="flex flex-1 flex-col gap-2.5 p-6"
      id={BEAN_NEW_FORM_ID}
      noValidate
      onSubmit={handleSubmit((values) => console.log(values))}
    >
      <FieldCard
        error={errors.name?.message}
        label="원두 이름"
        placeholder="에티오피아 예가체프"
        required
        {...register("name")}
      />

      <FieldCard
        label="로스터리"
        placeholder="프릳츠"
        {...register("roastery")}
      />

      <FieldCard
        error={errors.roastedAt?.message}
        label="로스팅 날짜"
        type="date"
        {...register("roastedAt")}
      />

      <FieldCard
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
        error={errors.weight?.message}
        label="구매 용량 (g)"
        placeholder="200"
        type="number"
        {...register("weight")}
      />

      <FieldCard
        error={errors.price?.message}
        label="가격 (원)"
        placeholder="21000"
        type="number"
        {...register("price")}
      />
    </form>
  );
}
