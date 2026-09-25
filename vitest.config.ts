import { defineConfig } from "vitest/config";
import svgr from "vite-plugin-svgr";

// https://vitest.dev/config/
export default defineConfig({
    plugins: [
        svgr({
            include: "**/*.svg",
            exclude: [/\?raw/],
            svgrOptions: {
                exportType: "default",
            },
        }),
    ],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    },
});
