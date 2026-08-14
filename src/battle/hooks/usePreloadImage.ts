import { useEffect } from "react";
import { ClearImage } from "../../images";

// Preload character sprites, projectiles, etc. or they may be invisible
export function usePreloadImages(...collections) {
    useEffect(() => {
        const imageUrls: Set<string> = new Set();

        const traverse = (obj) => {
            if (!obj || typeof obj !== "object") {
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
        imageUrls.add(ClearImage);

        imageUrls.forEach((url) => {
            const image = new Image();
            image.src = url;
            window[url] = image;
        });

        return () => {
            imageUrls.forEach((url) => {
                delete window[url];
            });
        };
    }, collections);
}
