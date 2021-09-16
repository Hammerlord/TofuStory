import { Button } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Ability } from "../ability/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import DeckViewer from "./DeckViewer";
import Inventory from "./Inventory";

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
});

const Header = ({ player, deck, onUseItem }: { player: Combatant; deck: Ability[]; onUseItem?: Function }) => {
    const classes = useStyles();
    const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);

    return (
        <div className={classes.headerBar}>
            <img src={player.image} className={classes.playerPortrait} />{" "}
            <div className={classes.stats}>
                {player.HP} / {player.maxHP} HP{" "}
                <Button variant="contained" color="primary" onClick={() => setIsAbilitiesOpen((prev) => !prev)}>
                    {deck.length} abilities
                </Button>
            </div>
            {isAbilitiesOpen && <DeckViewer deck={deck} onClose={() => setIsAbilitiesOpen(false)} />}
            <Inventory inventory={player.items} onUseItem={onUseItem} />
        </div>
    );
};

export default Header;
