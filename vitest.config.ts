import { defineConfig } from "vitest/config";

// https://vitest.dev/config/
export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    },
});