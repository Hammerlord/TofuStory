import { RefObject, useEffect, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../../../ability/AbilityView/AbilityView";
import {
    Ability,
    CARD_PILE_TYPES,
    CardPileType,
    CombatAbility,
} from "../../../ability/types";
import { getCenterCoords, refreshToPile, sendToPile } from "../../../character/animations";
import { DECK_CYCLE_TIME } from "../../../constants";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { MapleLeavesImage } from "../../../images";
import { CARD_ADDED_PLAYBACK_SPEED, CARD_DEPLETED_PLAYBACK_SPEED } from "../../constants";
import { battleStateSlice } from "../../reducer";
import { EventGroup } from "../../types";

// For the animated cards that refresh from the discard back to the deck
const CARD_WIDTH = 50;
const CARD_HEIGHT = 75;

const useStyles = createUseStyles({
    abilityContainer: {
        margin: 16,
        display: "inline-block",
        opacity: 0,
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    cycledAbilityContainer: {
        position: "fixed",
        opacity: 0,
        background: "#176fbd",
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        borderRadius: "4px",
        border: "3px solid white",
        boxSizing: "content-box",
        "&:before": {
            content: "' '",
            backgroundImage: `url(${MapleLeavesImage})`,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            backgroundPosition: "50% 0",
        },
    },
});

const { updateBattle } = battleStateSlice.actions;

/**
 * Renders and animates card related effects:
 * - cards that are added to the deck, discard or depleted pile (and landed in the hand)
 * - the deck cycling animation that plays when the discard refreshes back to the deck
 */
const CardAnimations = ({
    eventGroup,
    deckRef,
    discardRef,
    depleteRef,
}: {
    eventGroup?: EventGroup;
    deckRef: RefObject<HTMLElement>;
    discardRef: RefObject<HTMLElement>;
    depleteRef: RefObject<HTMLElement>;
}) => {
    const deck = useAppSelector((state) => state.battle!.deck);
    const deckCycled = useAppSelector((state) => state.battle!.deckCycled);
    const dispatch = useAppDispatch();

    const addCardRefs = Array.from({ length: 5 }).map(() => useRef<HTMLDivElement>(null));
    const deckCycleRefs = Array.from({ length: 100 }).map(() => useRef(null));

    const { x: discardX, y: discardY } = useMemo(() => {
        if (!discardRef?.current?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(discardRef.current);
    }, [discardRef?.current]);

    const classes = useStyles();

    useEffect(() => {
        const animateCardRef = (ref: RefObject<HTMLElement | null>, addedTo: CardPileType) => {
            let props;
            if (addedTo === CARD_PILE_TYPES.DEPLETED) {
                props = {
                    to: depleteRef.current,
                    desaturate: true,
                    darken: true,
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                };
            } else if (addedTo === CARD_PILE_TYPES.DECK) {
                props = {
                    to: deckRef.current,
                    playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                };
            } else if (addedTo === CARD_PILE_TYPES.DISCARD) {
                props = {
                    to: discardRef.current,
                    desaturate: true,
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                };
            }

            // No animation for added to hand -- having the hand gain cards will suffice
            if (ref?.current && props) {
                sendToPile({ object: ref.current, ...props });
            }
        };

        eventGroup?.addCards?.forEach(
            (value: { cards: Ability[]; cardsAddedTo: CardPileType }, i) => {
                value.cards.forEach((card, j) => {
                    const ref = addCardRefs[i + j];
                    animateCardRef(ref, value.cardsAddedTo);
                });
            },
        );
    }, [eventGroup?.id]);

    useEffect(() => {
        if (!deckCycled) {
            return;
        }

        const animations = deckCycleRefs.slice(0, deck.length).map((ref, i) => {
            return refreshToPile({
                object: ref.current,
                playbackTime: DECK_CYCLE_TIME,
                to: deckRef.current,
                delay: i * 25,
            });
        });

        if (animations?.length) {
            animations[animations.length - 1].onfinish = () =>
                dispatch(updateBattle({ deckCycled: false }));
        } else {
            dispatch(updateBattle({ deckCycled: false }));
        }
    }, [deckCycled, deck]);

    return (
        <>
            <div className={classes.center}>
                {eventGroup?.addCards?.map((addCards: { cards: CombatAbility[] | Ability[] }) =>
                    addCards.cards.map((ability: CombatAbility | Ability, i) => (
                        <div
                            className={classes.abilityContainer}
                            ref={addCardRefs[i]}
                            key={"instanceId" in ability ? ability.instanceId : i}
                        >
                            <AbilityView ability={ability} disableGlow={true} />
                        </div>
                    )),
                )}
            </div>
            {deckCycled &&
                deck.map((card, i) => (
                    <div
                        ref={deckCycleRefs[i]}
                        className={classes.cycledAbilityContainer}
                        key={card.instanceId || i}
                        style={{
                            left: discardX - CARD_WIDTH / 2,
                            top: discardY - CARD_HEIGHT / 2,
                        }}
                    ></div>
                ))}
        </>
    );
};

export default CardAnimations;