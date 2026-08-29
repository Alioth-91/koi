import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * 순수 함수만 테스트한다 — libs/ 의 스키마와 유틸.
 *
 * alias — 테스트에서도 `@/` 를 쓰려면 여기에 추가해야 한다.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["libs/**/*.test.ts"],

    // today()의 UTC 함정을 검사하려면 시간대가 고정돼 있어야 한다.
    // 안 정하면 실행하는 사람의 시간대에 따라 결과가 달라진다.
    env: { TZ: "Asia/Seoul" },
  },
});
