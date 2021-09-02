import classNames from "classnames";
import Handlebars from "handlebars";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";
import { calculateDamage } from "../../battle/utils";
import { Combatant } from "../../character/types";
import Icon from "../../icon/Icon";
import { CrossedSwords, Heart } from "../../images";
import { Fury } from "../../resource/ResourcesView";
import { Ability, ACTION_TYPES } from "../types";
import { getAbilityColor } from "../utils";
import AbilityTooltip from "./AbilityTooltip";
import AbilityTypeView from "./AbilityTypeView";
import AuraView from "./AuraView";
import BonusView from "./BonusView";
import Buffs from "./Buffs";
import CardsToAdd from "./CardsToAdd";
import DamageIcon, { getDamageStatistics } from "./DamageIcon";
import Debuffs from "./Debuffs";
import SelfActions from "./SelfActions";

const useAreaStyles = createUseStyles({
    area: {
        width: "12px",
        height: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        display: "inline-block",
        "&:not(:last-child)": {
            marginRight: "4px",
        },
    },
    mainTarget: {
        width: "12px",
        height: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "inline-block",
        marginRight: "4px",
    },
});

const Area = ({ area }) => {
    const classes = useAreaStyles();
    const areaIndicator = Array.from({ length: area }).map((_, i) => <span className={classes.area} key={i} />);
    return (
        <span>
            {areaIndicator}
            <span className={classes.mainTarget} />
            {areaIndicator}
        </span>
    );
};

const useStyles = createUseStyles({
    root: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        width: "150px",
        minHeight: "250px",
        padding: "8px",
        paddingTop: "6px",
        paddingBottom: "2px",
        cursor: "pointer",
        background: "#d9ca96",
        transition: "transform 0.25s",
        borderRadius: "4px",
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        color: "rgba(0, 0, 0, 0.9)",
        fontFamily: "Barlow",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        textShadow: "0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white",
        lineHeight: "16px",
        zIndex: 1,
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
    },
    portraitContainer: {
        position: "absolute",
        top: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        height: "90px",
        width: "calc(100% - 16px)",
    },
    portrait: {
        height: "100%",
        width: "100%",
        objectFit: "contain",
    },
    footer: {
        position: "relative",
    },
    minionStats: {
        position: "absolute",
        bottom: 24,
        width: "100%",
    },
    minionHP: {
        left: 0,
        position: "absolute",
    },
    minionDamage: {
        right: 0,
        position: "absolute",
    },
    selectedAbility: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        background: "#ead27c",
        transform: "translateY(-16px)",
    },
    body: {
        minHeight: "75px",
        marginTop: "70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        fontSize: "0.9rem",
        "& > div:not(:last-child)": {
            marginBottom: "8px",
        },

        "& .icon-root": {
            verticalAlign: "bottom",
        },
    },
    iconPlaceholder: {
        width: "24px",
    },
    bold: {
        fontWeight: "bold",
    },
    "@keyframes fade": {
        '0%': {
            opacity: 0.95,
        },
        '60%': {
            opacity: 0.95,
        },
        '100%': {
            opacity: 0.8,
        },
    },
    ephemeral: {
        animationName: "$fade",
        animationDuration: `2s`,
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    isSelected?: boolean;
    ability: Ability;
    player?: Combatant;
}

const AbilityView = forwardRef(({ onClick, isSelected, ability, player }: AbilityViewProps, ref) => {
    const classes = useStyles();
    const { actions = [], resourceCost, name, minion, image, description, removeAfterTurn } = ability;
    const { area = ability.area } = actions[0] || {};
    const { target: targetType } = actions[0] || {};
    const cardImage = minion?.image || image;
    const { aura } = minion || {};
    const { baseDamage } = getDamageStatistics({ ability, player });
    const interpolatedDescription = Handlebars.compile(description || "")({ damage: baseDamage });
    const damageIcon = baseDamage ? <DamageIcon ability={ability} player={player} /> : <div className={classes.iconPlaceholder} />;

    return (
        <AbilityTooltip ability={ability}>
            <div
                onClick={onClick}
                className={classNames(classes.root, {
                    [classes.selectedAbility]: isSelected,
                    [classes.ephemeral]: removeAfterTurn,
                })}
                style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
            >
                <span className={classes.header} ref={ref as any}>
                    {damageIcon}
                    <span className={classes.name}>{name}</span> <Fury text={resourceCost} />
                </span>
                <div className={classes.portraitContainer}>{cardImage && <img src={cardImage} className={classes.portrait} />}</div>
                <div className={classes.body}>
                    {removeAfterTurn && <div className={classes.bold}>Ephemeral</div>}
                    <Debuffs ability={ability} />
                    <SelfActions ability={ability} />
                    <Buffs ability={ability} />
                    <CardsToAdd ability={ability} />
                    <BonusView ability={ability} />
                    {interpolatedDescription && <div>{interpolatedDescription}</div>}
                    {aura && <AuraView aura={aura} />}
                </div>
                <div className={classes.footer}>
                    {actions.length > 0 && area > 0 && (
                        <div>
                            Area: <Area area={area} />
                        </div>
                    )}
                    <AbilityTypeView targetType={targetType} minion={minion} />
                    {minion && (
                        <div className={classes.minionStats}>
                            <Icon icon={<Heart />} text={minion.maxHP} className={classes.minionHP} />
                            <Icon icon={<CrossedSwords />} text={minion.damage} className={classes.minionDamage} />
                        </div>
                    )}
                </div>
            </div>
        </AbilityTooltip>
    );
});

export default AbilityView;
