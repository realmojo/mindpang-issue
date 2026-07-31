import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 내부 이동은 <a> 태그(전체 리로드)로 통일한다. Taboola 로더가 head 인라인
      // 스크립트에서 경로별 PAGE_TYPE 을 선언하는데, next/link 클라이언트 라우팅에서는
      // 그 스크립트가 다시 실행되지 않아 유형이 최초 진입 시점 값으로 굳는다.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
