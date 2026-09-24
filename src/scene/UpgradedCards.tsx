import { createUseStyles } from "react-jss";
import Button from "../view/Button";
import { CombatAbility } from "../ability/types";
import AbilityView from "../ability/AbilityView/AbilityView";
import { useEffect, useRef, useState } from "react";
import { playExplodeAnimation } from "../character/animations";
import classNames from "classnames";

const FADE_OUT_MS = 400;
const AUTO_CLOSE_HOLD_MS = 750;

const useStyles = createUseStyles({
    abilityContainer: {
        display: "inline-block",
        margin: 8,
        verticalAlign: "top",
    },
    abilityUpgradeSection: {
        marginBottom: 64,
    },
    hide: {
        opacity: 0,
    },
    upgradedCards: {
        opacity: 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-in`,
    },
    fadingOut: {
        opacity: 0,
    },
});

const UpgradedCardsView = ({
    original = [],
    upgraded = [],
    onExit,
    showContinueButton = true,
    onFadeOutStart,
}: {
    original: CombatAbility[];
    upgraded: CombatAbility[];
    onExit: () => void;
    showContinueButton?: boolean;
    onFadeOutStart?: () => void;
}) => {
    const classes = useStyles();
    const cardRefs = useRef({});
    const [isAnimationFinished, setIsAnimationFinished] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const elements: HTMLElement[] = Object.values(cardRefs.current);
        setTimeout(() => {
            const playbackTime = 500;
            const animations = playExplodeAnimation({
                object: elements,
                maxScale: 1,
                playbackTime,
                delay: 0,
            });

            Promise.all(
                animations
                    .filter((animation): animation is Animation => Boolean(animation))
                    .map((animation) => animation.finished),
            )
                .then(() => {
                    setIsAnimationFinished(true);
                })
                .catch(() => {
                    setIsAnimationFinished(true);
                });
        }, 500);
    }, []);

    useEffect(() => {
        if (!showContinueButton && isAnimationFinished && !isFadingOut) {
            const timeout = setTimeout(() => {
                setIsFadingOut(true);
                onFadeOutStart?.();
            }, AUTO_CLOSE_HOLD_MS);
            return () => clearTimeout(timeout);
        }
    }, [showContinueButton, isAnimationFinished, isFadingOut, onFadeOutStart]);

    useEffect(() => {
        if (!showContinueButton && isFadingOut) {
            const timeout = setTimeout(() => {
                onExit();
            }, FADE_OUT_MS);
            return () => clearTimeout(timeout);
        }
    }, [showContinueButton, isFadingOut, onExit]);

    return (
        <div
            className={classNames(classes.upgradedCards, {
                [classes.fadingOut]: isFadingOut,
            })}
        >
            <div className={classes.abilityUpgradeSection}>
                {(isAnimationFinished ? upgraded : original).map((ability: CombatAbility) => (
                    <div
                        className={classNames(classes.abilityContainer)}
                        key={ability.instanceId}
                        ref={(element) => {
                            if (element) {
                                cardRefs.current[ability.instanceId] = element;
                            } else {
                                delete cardRefs.current[ability.instanceId];
                            }
                        }}
                    >
                        <AbilityView ability={ability} />
                    </div>
                ))}
            </div>
            {showContinueButton && (
                <div className={classNames({ [classes.hide]: !isAnimationFinished })}>
                    <Button color="secondary" onClick={onExit} disabled={!isAnimationFinished}>
                        Continue
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UpgradedCardsView;
