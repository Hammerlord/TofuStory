import Button from "../view/Button";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Ability } from "../ability/types";
import { getMaxHP } from "../battle/utils";
import { Combatant } from "../character/types";
import { MesoCoinImage } from "../images";
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
        background: "rgba(0, 0, 0, 0.7)",
        padding: "8px 32px",
        height: "56px",
        color: "white",
        fontWeight: 500,
        display: "flex",
    },
    playerPortrait: {
        maxHeight: "100%",
        marginRight: "32px",
    },
    stats: {
        lineHeight: "56px",
    },
    mesos: {
        margin: "0 16px",
        display: "inline-block",
    },
    mesoImage: {
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
        background: "rgba(50, 46, 46, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "4px",
        fontFamily: "Barlow",
        zIndex: "1000",
        color: "white",
        maxWidth: 300,
        padding: "16px",
    },
});

const Header = ({
    player,
    deck,
    onUseItem,
    onSelectWeaponSkin,
}: {
    player: Combatant;
    deck: Ability[];
    onUseItem?: (itemIndex: number) => void;
    onSelectWeaponSkin: (weaponSkin: string) => void;
}) => {
    const classes = useStyles();
    const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);

    return (
        <>
            <div className={classes.headerBar}>
                <img src={player.image} className={classes.playerPortrait} />{" "}
                <div className={classes.stats}>
                    {player.HP} / {getMaxHP(player)} HP{" "}
                    <Button variant="contained" color="primary" onClick={() => setIsAbilitiesOpen((prev) => !prev)}>
                        {deck.length} abilities
                    </Button>
                    <div className={classes.mesos}>
                        <img src={MesoCoinImage} className={classes.mesoImage} />
                        {player.mesos}
                    </div>
                </div>
                {isAbilitiesOpen && <DeckViewer deck={deck} onClose={() => setIsAbilitiesOpen(false)} />}
                <WeaponSkins player={player} onSelectWeaponSkin={onSelectWeaponSkin} />
                <Inventory inventory={player.items} onUseItem={onUseItem} />
            </div>
        </>
    );
};

export default Header;
