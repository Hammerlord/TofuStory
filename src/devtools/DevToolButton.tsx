import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Popper from "@material-ui/core/Popper";

import { useState } from "react";
import { createUseStyles } from "react-jss";
import Map from "../Map/Map";
import Shop from "../shops/Shop";
import defaultCharacterProperties, { wizardProperties } from "../character/defaultCharacterProperties";
import CardMatchingGame from "../scene/CardMatchingGame";
import DimPath from "../scene/Ellinia/DimPath";
import FollowFairies from "../scene/Ellinia/FollowFairies";
import Tombstones from "../scene/Ellinia/Tombstones";
import KittenBarrelsQuest from "../scene/Kerning/kpq/KittenBarrelsQuest";
import RopeQuest from "../scene/Kerning/kpq/RopeQuest";
import ComboPuzzle from "../scene/TreasureBox/ComboPuzzle";
import OnOffPuzzle from "../scene/TreasureBox/OnOffPuzzle";
import ReelLockPuzzle from "../scene/TreasureBox/ReelLockPuzzle";
import RowPuzzle from "../scene/TreasureBox/RowPuzzle";
import SortingPuzzle from "../scene/TreasureBox/SortingPuzzle";
import TreasureBox from "../scene/TreasureBox/TreasureBox";
import Button from "../view/Button";
import DevAbilityViewer from "./DevAbilityViewer";
import DevItemViewer from "./DevItemViewer";
import DevStageBattle from "./DevStageBattle";
import TradingPost from "../shops/TradingPost";
import { FortuneBox } from "../scene/FortuneBox";

const useStyles = createUseStyles({
    buttonContainer: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
    },
    overlay: {
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
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        zIndex: "999",
        width: "100%",
        height: "100%",
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
});

const QUEST_MAP = {
    "Rope Quest": RopeQuest,
    "Kitten Barrels Quest": KittenBarrelsQuest,
    Tombstones: Tombstones,
    DimPath: DimPath,
    FollowFairies: FollowFairies,
};

const TREASURE_PUZZLE_MAP = {
    "On/Off": OnOffPuzzle,
    ReelLock: ReelLockPuzzle,
    Combo: ComboPuzzle,
    Sorting: SortingPuzzle,
    RowPuzzle: RowPuzzle,
};

const DevToolButton = () => {
    const [devToolsMenuAnchor, setDevToolsMenuAnchor] = useState(null);
    const [cardGameDifficulty, setCardGameDifficulty] = useState(null);
    const [isAbilityViewerOpen, setIsAbilityViewerOpen] = useState(false);
    const [isBattle, setIsBattle] = useState(false);
    const [isSceneViewerOpen, setIsSceneViewerOpen] = useState(false);
    const [questName, setQuestName] = useState("");
    const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);
    const [treasurePuzzleName, setTreasurePuzzleName] = useState(null);
    const [isItemViewerOpen, setIsItemViewerOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const [isFortuneBoxOpen, setIsFortuneBoxOpen] = useState(false);
    const classes = useStyles();

    const handleCardGameDifficultyClick = (difficulty: "easy" | "medium" | "hard") => {
        setCardGameDifficulty(difficulty);
    };

    const handleClickDevTools = (e) => {
        setDevToolsMenuAnchor((prev) => (prev ? null : e.currentTarget));
    };

    const Quest = QUEST_MAP[questName];

    return (
        <>
            <div className={classes.buttonContainer}>
                <Button variant="contained" color="primary" onClick={handleClickDevTools}>
                    Dev Tools
                </Button>
            </div>
            {devToolsMenuAnchor && (
                <Popper anchorEl={devToolsMenuAnchor} open={true} placement={"bottom-start"} className={classes.menu}>
                    <ClickAwayListener onClickAway={() => setDevToolsMenuAnchor(null)}>
                        <div>
                            Card Matching Minigame
                            <MenuList>
                                <MenuItem onClick={() => handleCardGameDifficultyClick("easy")}>Easy</MenuItem>
                                <MenuItem onClick={() => handleCardGameDifficultyClick("medium")}>Medium</MenuItem>
                                <MenuItem onClick={() => handleCardGameDifficultyClick("hard")}>Hard</MenuItem>
                                <Divider />
                            </MenuList>
                            <MenuList>
                                <MenuItem onClick={() => setIsAbilityViewerOpen((prev) => !prev)}>Ability Viewer</MenuItem>
                                <MenuItem onClick={() => setIsItemViewerOpen((prev) => !prev)}>Item Viewer</MenuItem>
                                <MenuItem onClick={() => setIsSceneViewerOpen((prev) => !prev)}>Scene Viewer</MenuItem>
                                <MenuItem onClick={() => setIsShopOpen((prev) => !prev)}>Shop Viewer</MenuItem>
                                <MenuItem onClick={() => setIsTradingPostOpen((prev) => !prev)}>Trading Post</MenuItem>
                                <MenuItem onClick={() => setIsBattle((prev) => !prev)}>Staged Battle</MenuItem>
                                <MenuItem onClick={() => setIsMapDrawerOpen((prev) => !prev)}>Map Drawer</MenuItem>
                                <MenuItem onClick={() => setIsFortuneBoxOpen((prev) => !prev)}>Fortune Box</MenuItem>
                            </MenuList>
                            Treasure Box Puzzles
                            <MenuList>
                                {Object.keys(TREASURE_PUZZLE_MAP).map((key) => (
                                    <MenuItem key={key} onClick={() => setTreasurePuzzleName(key)}>
                                        {key}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </div>
                    </ClickAwayListener>
                </Popper>
            )}
            {cardGameDifficulty && (
                <div className={classes.overlay}>
                    <CardMatchingGame difficulty={cardGameDifficulty} onExit={() => setCardGameDifficulty(null)} />
                </div>
            )}
            {isAbilityViewerOpen && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <DevAbilityViewer onClose={() => setIsAbilityViewerOpen(false)} />
                    </div>
                </div>
            )}
            {isBattle && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <DevStageBattle />
                    </div>
                </div>
            )}
            {isSceneViewerOpen && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <div>
                            KPQ
                            <MenuList>
                                {Object.keys(QUEST_MAP).map((key) => (
                                    <MenuList onClick={() => setQuestName(key)}>{key}</MenuList>
                                ))}
                            </MenuList>
                        </div>
                    </div>
                </div>
            )}
            {Quest && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <Quest player={defaultCharacterProperties} onComplete={() => setQuestName(null)} />
                    </div>
                </div>
            )}
            {isMapDrawerOpen && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <Map enableDraw={true} />
                    </div>
                </div>
            )}
            {treasurePuzzleName && (
                <TreasureBox
                    onExit={() => setTreasurePuzzleName(null)}
                    onLoot={() => {}}
                    initItems={[]}
                    initMesos={[123, 123]}
                    Puzzle={TREASURE_PUZZLE_MAP[treasurePuzzleName]}
                    player={wizardProperties as any}
                    curse={"damage"}
                />
            )}
            {isItemViewerOpen && (
                <div className={classes.overlay}>
                    <div className={classes.inner}>
                        <DevItemViewer />
                    </div>
                </div>
            )}
            {isShopOpen && (
                <Shop
                    player={{ ...defaultCharacterProperties, mesos: 1000 } as any}
                    onBuyItem={() => {}}
                    onExit={() => setIsShopOpen(false)}
                />
            )}
            {isTradingPostOpen && (
                <TradingPost player={defaultCharacterProperties} onTrade={() => {}} onExit={() => setIsTradingPostOpen(false)} />
            )}
            {isFortuneBoxOpen && <FortuneBox player={defaultCharacterProperties} onComplete={() => setIsFortuneBoxOpen(false)} />}
        </>
    );
};

export default DevToolButton;
