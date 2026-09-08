import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { createUseStyles } from "react-jss";
import { BLUE, GREEN, RED } from "../../ability/AbilityView/constants";
import { isOffensiveAbility } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, CardPileType, CombatAbility, CombatEffect } from "../../ability/types";
import { BUFF_COLOUR, DEBUFF_COLOUR } from "../../character/effects/constants";
import { useAppSelector } from "../../hooks";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon, HourglassIcon, NoEntryIcon, ShieldIcon } from "../../images/icons";
import Tooltip from "../../view/Tooltip";
import { UpdatedCombatantStats } from "../actions/getUpdatedStats";
import { BATTLEFIELD_SIDES, EventGroup } from "../types";
import { Combatant } from "../../character/types";

const useItemStyles = createUseStyles({
    root: ({ actorSide }: { actorSide: BATTLEFIELD_SIDES | undefined }) => ({
        width: "50px",
        height: "50px",
        position: "relative",
        border: `1px solid ${actorSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? BUFF_COLOUR : DEBUFF_COLOUR}`,
        background: "rgba(0,0,0,0.7)",
        borderRadius: "2px",
    }),

    action: {
        minWidth: "30px",
        width: "100%",
        maxHeight: "100%",
    },
    actionContainer: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
    },
    actor: {
        width: "25px",
        position: "absolute",
        left: 0,
        top: 0,
    },
});

const useTooltipStyles = createUseStyles({
    diamond: {
        width: "7px",
        height: "7px",
        transform: "rotate(45deg)",
        display: "inline-block",
        margin: "0 6px",
    },
    offensive: {
        background: RED,
    },
    support: {
        background: BLUE,
    },
    minion: {
        background: GREEN,
    },
});

const getAbilityType = (actionParent: CombatAbility | undefined) => {
    if (!actionParent) {
        return undefined;
    }

    if (isOffensiveAbility(actionParent as Ability)) {
        return "offense";
    }

    if (actionParent?.minion || actionParent.actions?.some((action) => action.summon)) {
        return "summon";
    }

    if (actionParent.actions?.some((action) => action.type === ACTION_TYPES.EFFECT)) {
        return "support";
    }

    return undefined;
};

const useListStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
    },
    row: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
});

// Damage that was applied as a direct result of the action, excluding damage procced off of it (eg. thorns, reflect)
const getDirectDamageUpdates = (statUpdates: EventGroup["statUpdates"]): UpdatedCombatantStats[] => {
    return Object.values(statUpdates || {}).filter((update) => !update.context?.isProc && (update.rawDamage ?? 0) > 0);
};

const getArmorUpdates = (statUpdates: EventGroup["statUpdates"]): UpdatedCombatantStats[] => {
    return Object.values(statUpdates || {}).filter((update) => !update.context?.isProc && (update.armor ?? 0) > 0);
};

type EffectUpdate = { effect: CombatEffect; update: UpdatedCombatantStats };

const getGainedEffectUpdates = (statUpdates: EventGroup["statUpdates"]): EffectUpdate[] => {
    return Object.values(statUpdates || {})
        .filter((update) => !update.context?.isProc)
        .flatMap((update) => (update.effects || []).map((effect) => ({ effect, update })));
};

const getResistedEffectUpdates = (statUpdates: EventGroup["statUpdates"]): EffectUpdate[] => {
    return Object.values(statUpdates || {})
        .filter((update) => !update.context?.isProc)
        .flatMap((update) => (update.failedToApplyEffects || []).map((effect) => ({ effect, update })));
};

const DamageList = ({ statUpdates }: { statUpdates: EventGroup["statUpdates"] }) => {
    const classes = useListStyles();
    const damageUpdates = getDirectDamageUpdates(statUpdates);

    if (!damageUpdates.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {damageUpdates.map((update) => (
                <div className={classes.row} key={update.combatantId}>
                    {update.rawDamage} <Icon icon={CrossedSwordsIcon} size="xs" /> to {update.combatantName}
                </div>
            ))}
        </div>
    );
};

const ArmorList = ({ statUpdates }: { statUpdates: EventGroup["statUpdates"] }) => {
    const classes = useListStyles();
    const updates = getArmorUpdates(statUpdates);

    if (!updates.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {updates.map((update) => (
                <div className={classes.row} key={update.combatantId}>
                    {update.armor} <Icon icon={ShieldIcon} size="xs" /> to {update.combatantName}
                </div>
            ))}
        </div>
    );
};

const EffectsGainedList = ({ statUpdates }: { statUpdates: EventGroup["statUpdates"] }) => {
    const classes = useListStyles();
    const effectUpdates = getGainedEffectUpdates(statUpdates);

    if (!effectUpdates.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {effectUpdates.map(({ effect, update }, i) => (
                <div className={classes.row} key={[update.combatantId, effect.id, i].join("-")}>
                    {update.combatantName} gained <Icon icon={effect.icon} size="xs" /> {effect.name}
                </div>
            ))}
        </div>
    );
};

const EffectsResistedList = ({ statUpdates }: { statUpdates: EventGroup["statUpdates"] }) => {
    const classes = useListStyles();
    const effectUpdates = getResistedEffectUpdates(statUpdates);

    if (!effectUpdates.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {effectUpdates.map(({ effect, update }, i) => (
                <div className={classes.row} key={[update.combatantId, effect.id, i].join("-")}>
                    {update.combatantName} resisted <Icon icon={effect.icon} size="xs" /> {effect.name}
                    <Icon icon={NoEntryIcon} size="xs" />
                </div>
            ))}
        </div>
    );
};

const SummonedMinionsList = ({ newCombatants }: { newCombatants: Combatant[] }) => {
    const classes = useListStyles();

    if (!newCombatants.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {newCombatants.map((combatant, i) => (
                <div className={classes.row} key={[combatant.id, i].join("-")}>
                    Summoned <Icon icon={combatant.image} size="xs" /> {combatant.name}
                </div>
            ))}
        </div>
    );
};

const getCardsAddedTo = (addCards: EventGroup["addCards"], pile: CardPileType): Ability[] => {
    return addCards.filter((entry) => entry.cardsAddedTo === pile).flatMap((entry) => entry.cards);
};

const CardsAddedList = ({ addCards, pile, label }: { addCards: EventGroup["addCards"]; pile: CardPileType; label: string }) => {
    const classes = useListStyles();
    const cards = getCardsAddedTo(addCards, pile);

    if (!cards.length) {
        return null;
    }

    return (
        <div className={classes.root}>
            {cards.map((card, i) => (
                <div className={classes.row} key={[card.name, i].join("-")}>
                    {label} <Icon icon={card.image} size="xs" /> {card.name}
                </div>
            ))}
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    hourglassContainer: {
        marginBottom: "4px",
    },
});

const ActionHistoryItem = ({ group }: { group: EventGroup }) => {
    const event = group.events[0] || {};
    const { actorName, actorImage, actorSide, actionParent } = event;
    const classes = useItemStyles({ actorSide });
    const tooltipClasses = useTooltipStyles();

    const image = (actionParent as CombatAbility)?.image || (actionParent as CombatEffect)?.icon;
    if (!image) {
        return null;
    }

    let actionImage;
    if (typeof image === "string") {
        actionImage = <img src={image} className={classes.action} />;
    } else if (typeof image === "function") {
        const ActionIcon = image as any;
        actionImage = <ActionIcon className={classes.action} />;
    }

    const abilityType = getAbilityType(actionParent as CombatAbility);

    const tooltipContents = (
        <>
            {abilityType && (
                <span
                    className={classNames(tooltipClasses.diamond, {
                        [tooltipClasses.offensive]: abilityType === "offense",
                        [tooltipClasses.support]: abilityType === "support",
                        [tooltipClasses.minion]: abilityType === "summon",
                    })}
                />
            )}
            {(actionParent as CombatAbility)?.name || ""}

            <hr />
            <DamageList statUpdates={group.statUpdates} />
            <ArmorList statUpdates={group.statUpdates} />
            <EffectsGainedList statUpdates={group.statUpdates} />
            <EffectsResistedList statUpdates={group.statUpdates} />
            <SummonedMinionsList newCombatants={group.newCombatants} />
            <CardsAddedList addCards={group.addCards} pile="hand" label="Drew" />
            <CardsAddedList addCards={group.addCards} pile="discard" label="Discarded" />
        </>
    );

    return (
        <Tooltip title={tooltipContents} placement="left">
            <div className={classes.root}>
                <div className={classes.actionContainer}>{actionImage}</div>
                {actorImage && <img src={actorImage} alt={actorName} className={classes.actor} />}
            </div>
        </Tooltip>
    );
};

const ActionHistory = () => {
    const classes = useStyles();
    // This component only renders if there is a battle state.
    const history: EventGroup[] = useAppSelector((state) => state.battle?.actionHistory)!;

    return (
        <div className={classes.root}>
            <div className={classes.hourglassContainer}>
                <Icon icon={HourglassIcon} />
            </div>
            <AnimatePresence mode="popLayout">
                {history.map((group) => (
                    <motion.div
                        key={group.id}
                        layout
                        initial={{
                            y: "-100%",
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: "100%",
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                    >
                        <ActionHistoryItem group={group} key={group.id} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ActionHistory;
