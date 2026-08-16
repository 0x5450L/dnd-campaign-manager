import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["src/testing/globalSetup.ts"],
    setupFiles: ["src/testing/setup.ts"],
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
});
