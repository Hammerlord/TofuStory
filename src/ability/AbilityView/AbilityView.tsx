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
        width: "140px",
        minHeight: "250px",
        padding: "12px",
        paddingTop: "6px",
        paddingBottom: "2px",
        cursor: "pointer",
        background: "#d9ca96",
        transition: "transform 0.25s",
        borderRadius: "2px",
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px",
        zIndex: 1,
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
    },
    portraitContainer: {
        height: "60px",
    },
    portrait: {
        height: "64px",
        objectFit: "contain",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "35px",
    },
    selectedAbility: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        background: "#ead27c",
        transform: "translateY(-16px)",
    },
    body: {
        minHeight: "40px",
        marginTop: "8px",
        fontSize: "0.9rem",
        "& div": {
            marginBottom: "4px",
        },

        "& .icon-root": {
            verticalAlign: "bottom",
        },
    },
    iconPlaceholder: {
        width: "24px",
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
        <div
            onClick={onClick}
            className={classNames(classes.root, {
                [classes.selectedAbility]: isSelected,
            })}
            style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
        >
            <span className={classes.header} ref={ref as any}>
                {damageIcon}
                <span className={classes.name}>{name}</span> <Fury text={resourceCost} />
            </span>
            {cardImage && (
                <div className={classes.portraitContainer}>
                    <img src={cardImage} className={classes.portrait} />
                </div>
            )}
            <div className={classes.body}>
                <Debuffs ability={ability} />
                <SelfActions ability={ability} />
                <Buffs ability={ability} />
                <CardsToAdd ability={ability} />
                <BonusView ability={ability} />
                {removeAfterTurn && <div>Ephemeral</div>}
                {interpolatedDescription && <div>{interpolatedDescription}</div>}
                {minion && (
                    <div>
                        <Icon icon={<Heart />} text={minion.maxHP} />
                        <Icon icon={<CrossedSwords />} text={minion.damage} />
                    </div>
                )}
                {aura && <AuraView aura={aura} />}
                {actions.length > 0 && (
                    <div>
                        Area: <Area area={area} />
                    </div>
                )}
                <AbilityTypeView targetType={targetType} minion={minion} />
            </div>
        </div>
    );
});

export default AbilityView;
