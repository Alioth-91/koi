"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { signIn } from "@/app/(auth)/actions";
import { signInSchema } from "@/libs/schemas/auth";

type Props = {
  defaultEmail: string;
};

export default function SignInForm({ defaultEmail }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof signInSchema>,
    unknown,
    z.output<typeof signInSchema>
  >({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signIn(values);

    if (result.errors?.email?.[0]) {
      setError("email", { type: "server", message: result.errors.email[0] });
    }

    if (result.errors?.password?.[0]) {
      setError("password", {
        type: "server",
        message: result.errors.password[0],
      });
    }

    if (result.message) {
      setError("root.server", { type: "server", message: result.message });
    }
  });

  return (
    <form noValidate onSubmit={onSubmit}>
      <label className="block text-sm font-semibold" htmlFor="email">
        이메일
      </label>

      <input
        aria-describedby="email-error"
        aria-invalid={Boolean(errors.email)}
        autoComplete="email"
        className="mt-2 w-full rounded-xl border border-border-foreground px-4 py-3 outline-none focus:border-primary"
        defaultValue={defaultEmail}
        id="email"
        placeholder="coffee@example.com"
        type="email"
        {...register("email")}
      />

      <p className="mt-1 min-h-5 text-xs text-destructive" id="email-error">
        {errors.email?.message}
      </p>

      <label className="mt-3 block text-sm font-semibold" htmlFor="password">
        비밀번호
      </label>

      <input
        aria-describedby="password-error"
        aria-invalid={Boolean(errors.password)}
        autoComplete="current-password"
        className="mt-2 w-full rounded-xl border border-border-foreground px-4 py-3 outline-none focus:border-primary"
        id="password"
        type="password"
        {...register("password")}
      />

      <p className="mt-1 min-h-5 text-xs text-destructive" id="password-error">
        {errors.password?.message}
      </p>

      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-destructive">
        {errors.root?.server?.message}
      </p>

      <button
        className="mt-4 w-full cursor-pointer rounded-xl bg-primary py-3.5 font-extrabold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
