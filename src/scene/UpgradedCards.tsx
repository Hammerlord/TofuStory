import { createUseStyles } from "react-jss";
import Button from "../view/Button";
import { CombatAbility } from "../ability/types";
import AbilityView from "../ability/AbilityView/AbilityView";
import { useEffect, useRef, useState } from "react";
import { playExplodeAnimation, playFadeInAnimation } from "../character/animations";
import classNames from "classnames";

const useStyles = createUseStyles({
    abilityContainer: {
        display: "inline-block",
        margin: 8,
    },
    abilityUpgradeSection: {
        marginBottom: 64,
    },
    hide: {
        opacity: 0,
    },
});

const UpgradedCardsView = ({
    original = [],
    upgraded = [],
    onExit,
}: {
    original: CombatAbility[];
    upgraded: CombatAbility[];
    onExit: () => void;
}) => {
    const classes = useStyles();
    const cardRefs = useRef({});
    const [isAnimationFinished, setIsAnimationFinished] = useState(false);

    useEffect(() => {
        const elements: HTMLElement[] = Object.values(cardRefs.current);
        setTimeout(() => {
            const animations = playExplodeAnimation({ object: elements, maxScale: 1, playbackTime: 500 });
            if (animations[animations.length - 1]) {
                animations[animations.length - 1].onfinish = () => {
                    setIsAnimationFinished(true);
                };
            }
        }, 500);
    }, []);

    return (
        <>
            <h3>The following cards were upgraded</h3>
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
            <div className={classNames({ [classes.hide]: !isAnimationFinished })}>
                <Button color="secondary" onClick={onExit} disabled={!isAnimationFinished}>
                    Continue
                </Button>
            </div>
        </>
    );
};

export default UpgradedCardsView;
