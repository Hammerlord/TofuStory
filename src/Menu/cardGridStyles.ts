export const scrollFade = {
    maskImage:
        "linear-gradient(to bottom, transparent 0, rgba(25, 25, 25, 0.9) 0.5rem, rgba(25, 25, 25, 0.9) calc(100% - 0.5rem), transparent 100%)",
    WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0, rgba(25, 25, 25, 0.9) 0.5rem, rgba(25, 25, 25, 0.9) calc(100% - 0.5rem), transparent 100%)",
};

export const scrollableCardSection = {
    width: "100vw",
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    ...scrollFade,
};
