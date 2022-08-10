import { Button, ClickAwayListener, Divider, MenuItem, MenuList, Popper } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import CardGame from "../scene/CardGame";
import DevAbilityViewer from "./DevAbilityViewer";
import DevStageBattle from "./DevStageBattle";

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
        overflowY: "scroll",
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

const DevToolButton = () => {
    const [devToolsMenuAnchor, setDevToolsMenuAnchor] = useState(null);
    const [cardGameDifficulty, setCardGameDifficulty] = useState(null);
    const [isAbilityViewerOpen, setIsAbilityViewerOpen] = useState(false);
    const [isBattle, setIsBattle] = useState(false);
    const classes = useStyles();

    const handleCardGameDifficultyClick = (difficulty: "easy" | "medium" | "hard") => {
        setCardGameDifficulty(difficulty);
    };

    const handleClickDevTools = (e) => {
        setDevToolsMenuAnchor((prev) => (prev ? null : e.currentTarget));
    };
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
                                <MenuItem onClick={() => setIsBattle((prev) => !prev)}>Staged Battle</MenuItem>
                            </MenuList>
                        </div>
                    </ClickAwayListener>
                </Popper>
            )}
            {cardGameDifficulty && (
                <div className={classes.overlay}>
                    <CardGame difficulty={cardGameDifficulty} onExit={() => setCardGameDifficulty(null)} />
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
        </>
    );
};

export default DevToolButton;
