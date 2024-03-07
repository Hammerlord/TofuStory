import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { getMaxHP } from "../battle/utils";
import { useAppSelector } from "../hooks";
import { MesoCoinImage, SkullPatchImage } from "../images";
import { Item } from "../item/types";
import Tooltip from "../view/Tooltip";
import DeckViewer from "./DeckViewer";
import Inventory from "./Inventory";
import WeaponSkins from "./WeaponSkins";

const useStyles = createUseStyles({
    headerBar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "1000",
        background: "rgba(15, 15, 15, 0.9)",
        color: "white",
        fontWeight: 500,
        padding: "8",
    },
    playerPortrait: {
        height: 50,
        marginRight: "24px",
    },
    stats: {
        lineHeight: "56px",
    },
    tallyDisplay: {
        margin: "0 16px",
        display: "inline-block",
    },
    tallyImage: {
        verticalAlign: "middle",
        marginRight: "8px",
    },
    cardGameContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        height: "100%",
        zIndex: "999",
        background: "rgba(30, 30, 30, 0.9)",
        color: "rgba(255, 255, 250, 0.9)",
    },
    menu: {
        background: "rgba(30, 30, 30, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "4px",
        fontFamily: "Barlow",
        zIndex: "1000",
        color: "white",
        maxWidth: 300,
        padding: "16px",
    },
    playerHP: {
        minWidth: 100,
        display: "inline-block",
    },
    profile: {
        display: "inline-block",
        margin: "0 16px",
        verticalAlign: "top",
        borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
    },
    profileInner: {
        display: "flex",
        whiteSpace: "nowrap",
    },
    abilitiesButton: {
        color: "white",
        border: 0,
        margin: 0,
        fontSize: 16,
        fontWeight: "bold",
        padding: 16,
        background: 0,
        "&:hover": {
            filter: "drop-shadow(0 0 5px #45ff61)",
        },
    },
    abilityView: {
        height: 25,
        width: 15,
        background: "#176fbd",
        borderRadius: "2px",
        border: "1px solid white",
        boxSizing: "content-box",
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: 8,
    },
});

const Header = ({
    onUseItem,
    onSelectWeaponSkin,
}: {
    onUseItem?: (item: Item) => void;
    onSelectWeaponSkin: (weaponSkin: string) => void;
}) => {
    const classes = useStyles();
    const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);
    const { character, battle } = useAppSelector((state) => state);
    const { player: playerCharacter, deck, infamy } = character || {};
    const playerCombatant = battle?.playerSide.find((combatant) => combatant?.isPlayer);
    const player = playerCombatant || playerCharacter;

    return (
        <>
            <div className={classes.headerBar}>
                <div className={classes.profile}>
                    <div className={classes.profileInner}>
                        <div>
                            <img src={player.image} className={classes.playerPortrait} />{" "}
                        </div>
                        <div className={classes.stats}>
                            <span className={classes.playerHP}>
                                {player.HP} / {getMaxHP(player)} HP
                            </span>
                            <Tooltip
                                title={
                                    <div>
                                        Deck <hr /> You enter battle with these ability cards. Click to see your full deck.
                                    </div>
                                }
                            >
                                <button
                                    className={classNames(classes.tallyDisplay, classes.abilitiesButton)}
                                    onClick={() => setIsAbilitiesOpen((prev) => !prev)}
                                    tabIndex={0}
                                >
                                    <span className={classes.abilityView}></span>
                                    <span>{deck.length}</span>
                                </button>
                            </Tooltip>
                            <Tooltip
                                title={
                                    <div>
                                        Mesos <hr /> Cash earned from treasure boxes and beating up opponents. Spend it at Shops.
                                    </div>
                                }
                            >
                                <div className={classes.tallyDisplay}>
                                    <img src={MesoCoinImage} className={classes.tallyImage} />
                                    {player.mesos}
                                </div>
                            </Tooltip>
                            <Tooltip
                                title={
                                    <div>
                                        Infamy <hr /> Certain actions will increase your infamy and attract the attention of adventurers.
                                    </div>
                                }
                            >
                                <div className={classes.tallyDisplay}>
                                    <img src={SkullPatchImage} className={classes.tallyImage} />
                                    {infamy || 0}
                                </div>
                            </Tooltip>
                        </div>
                        <WeaponSkins player={player} onSelectWeaponSkin={onSelectWeaponSkin} />
                    </div>
                </div>
                <Inventory inventory={player.items} onUseItem={onUseItem} />
            </div>
            {isAbilitiesOpen && <DeckViewer deck={deck} onClose={() => setIsAbilitiesOpen(false)} player={player} />}
        </>
    );
};

export default Header;
