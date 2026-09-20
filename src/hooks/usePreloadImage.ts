import { useEffect } from "react";

// Preload character sprites, projectiles, etc. or they may be invisible
const preloadedUrls = new Set<string>();

export function usePreloadImages(...collections) {
    useEffect(() => {
        const imageUrls: Set<string> = new Set();

        const traverse = (obj?: object | string) => {
            if (!obj) {
                return;
            }

            if (typeof obj === "string") {
                imageUrls.add(obj);
            }

            if (typeof obj !== "object") {
                return;
            }

            for (const [key, value] of Object.entries(obj)) {
                if ((key === "image" || key === "icon") && typeof value === "string") {
                    imageUrls.add(value);
                } else if (typeof value === "object") {
                    traverse(value);
                }
            }
        };

        collections.flat().forEach(traverse);

        imageUrls.forEach((url) => {
            if (preloadedUrls.has(url)) return;
            preloadedUrls.add(url);
            const image = new Image();
            image.src = url;
            window[url] = image;
        });
    }, collections);
}
