import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    container: {
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
    },
    bgImage: {
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
});

const FADE_DURATION = 1500;

const BackgroundImage = ({ src, className }: { src: string; className?: string }) => {
    const classes = useStyles();
    const [prevSrc, setPrevSrc] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const currentSrcRef = useRef(src);
    const isFadingRef = useRef(false);
    const oldImgRef = useRef<HTMLImageElement>(null);
    const newImgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (src !== currentSrcRef.current && !isFadingRef.current) {
            isFadingRef.current = true;
            setPrevSrc(currentSrcRef.current);
            setIsAnimating(true);
        }
    }, [src]);

    useEffect(() => {
        if (!isAnimating || prevSrc === null) return;

        const oldImg = oldImgRef.current;
        const newImg = newImgRef.current;

        if (!oldImg || !newImg) return;

        newImg.style.opacity = "0";
        const fadeIn = newImg.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: FADE_DURATION,
            easing: "ease-in-out",
            fill: "forwards",
        });
        const fadeOut = oldImg.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: FADE_DURATION,
            easing: "ease-in-out",
            fill: "forwards",
        });

        Promise.all([fadeIn.finished, fadeOut.finished]).then(() => {
            currentSrcRef.current = src;
            setPrevSrc(null);
            setIsAnimating(false);
            isFadingRef.current = false;
        });
    }, [isAnimating, prevSrc]);

    return (
        <div className={`${classes.container} ${className ?? ""}`}>
            {prevSrc && (
                <img key="prev-bg" ref={oldImgRef} src={prevSrc} className={classes.bgImage} />
            )}
            <img key="current-bg" ref={newImgRef} src={src} className={classes.bgImage} />
        </div>
    );
};

export default BackgroundImage;
