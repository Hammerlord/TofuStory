import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import DeckEditor from "../ability/DeckEditor";
import BattlefieldContainer from "../battle/BattleView";
import {
    anger,
    bash,
    block,
    bloodthirst,
    charge,
    cleave,
    rampage,
    rend,
    shieldStrike,
    slam,
} from "./../ability/Abilities";
import ChallengeMenu from "./ChallengeMenu";

enum PLAYER_STATE {
    CLASS_SELECTION = 0,
    ACTIVITY_MENU = 1,
    EDIT_DECK = 2,
    BATTLE = 3,
}

enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
}

const allCards = [
    bash,
    bash,
    bash,
    bash,
    cleave,
    cleave,
    charge,
    charge,
    slam,
    slam,
    anger,
    rampage,
    shieldStrike,
    shieldStrike,
    block,
    block,
    block,
    block,
    rend,
    rend,
    bloodthirst,
];

const useStyles = createUseStyles({
    activityMenu: {
        width: "100%",
        height: "100%",
        position: "fixed",
        background: "#999",
    },
    inner: {
        maxWidth: "70rem",
        margin: "auto",
        padding: "32px",
        background: "#f5ebcb",
        height: "100%"
    },
});

const MainMenu = () => {
    const [player, setPlayer] = useState({
        id: uuid.v4(),
        class: PLAYER_CLASSES.WARRIOR,
        HP: 25,
        maxHP: 25,
        resources: 0,
        resourcesPerTurn: 3,
        maxResources: 10,
        armor: 0,
        effects: [],
    });
    const [deck, setDeck] = useState([
        cleave,
        cleave,
        charge,
        bash,
        bash,
        bash,
        slam,
        slam,
        anger,
        rampage,
        shieldStrike,
        block,
        block,
        rend,
        rend,
        bloodthirst,
    ]);

    const classes = useStyles();

    const [activityState, setActivityState] = useState(
        PLAYER_STATE.ACTIVITY_MENU
    );
    const [challenge, setChallenge] = useState(null);

    const handleSelectChallenge = (selectedChallenge) => {
        setChallenge(selectedChallenge);
        setActivityState(PLAYER_STATE.BATTLE);
    };

    const handleBattleEnd = (results) => {
        setActivityState(PLAYER_STATE.ACTIVITY_MENU);
        setChallenge(null);
    };

    const handleSaveDeck = (deck) => {
        setDeck(deck);
        setActivityState(PLAYER_STATE.ACTIVITY_MENU);
    };

    return (
        <>
            {activityState === PLAYER_STATE.ACTIVITY_MENU && (
                <div className={classes.activityMenu}>
                    <div className={classes.inner}>
                        <div>
                            <button
                                onClick={() =>
                                    setActivityState(PLAYER_STATE.EDIT_DECK)
                                }
                            >
                                Change deck
                            </button>
                        </div>
                        <ChallengeMenu
                            onSelectChallenge={handleSelectChallenge}
                        />
                    </div>
                </div>
            )}
            {activityState === PLAYER_STATE.EDIT_DECK && (
                <DeckEditor
                    allCards={allCards}
                    onSaveDeck={handleSaveDeck}
                    onBack={() => setActivityState(PLAYER_STATE.ACTIVITY_MENU)}
                    currentDeck={deck}
                />
            )}
            {activityState === PLAYER_STATE.BATTLE && (
                <BattlefieldContainer
                    player={player}
                    onBattleEnd={handleBattleEnd}
                    challenge={challenge}
                    deckUsed={challenge.presetDeck || deck}
                    tutorialMode={challenge.isTutorial}
                />
            )}
        </>
    );
};

export default MainMenu;
