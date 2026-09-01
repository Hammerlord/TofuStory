import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    base: "./",
    plugins: [
        svgr({
            include: "**/*.svg",
            exclude: [/\?raw/],
            svgrOptions: {
                exportType: "default",
            },
        }),
        react(),
    ],
    resolve: {
        alias: {
            handlebars: "handlebars/dist/handlebars.js",
        },
    },
    server: {
        open: true,
    },
});
