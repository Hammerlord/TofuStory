import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { BystanderImage, KerningSewerFullImage, ShoImage, StefaImage, WessImage } from "../../../images";
import { getRandomArbitrary } from "../../../utils";
import Tooltip from "../../../view/Tooltip";
import { SceneProps } from "../../types";
import getBystanderDialogue from "./getBystanderDialogue";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${KerningSewerFullImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        left: 200,
        top: 323,
        height: "65px",
    },
    sho: {
        left: "470px",
        top: 308,
    },
    stefa: {
        left: "430px",
        top: "317px",
    },
    wess: {
        left: "380px",
        top: 310,
    },
    flip: {
        transform: "scale(-1, 1)",
    },
    bystander: {
        top: 313,
        width: 48,
    },
    speechBubble: {
        "&&": {
            maxWidth: "100px",
        },
    },
});

const SewerEntrance = ({ player }: SceneProps) => {
    const classes = useStyles();
    const [bystanders] = useState(
        Array.from({ length: 7 }).map((_, i: number) => ({
            flip: Math.random() < 0.5,
            left: 700 + i * getRandomArbitrary(20, 40),
            text: getBystanderDialogue(),
        }))
    );

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={StefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={ShoImage} className={classNames(classes.sho, classes.character)} />
            <img src={WessImage} className={classNames(classes.wess, classes.character)} />
            {bystanders.map(({ flip, left, text }, i) => (
                <Tooltip
                    placement={"top"}
                    arrow
                    title={text}
                    open={Boolean(text)}
                    key={i}
                    classes={{ tooltip: classes.speechBubble }}
                    PopperProps={{ disablePortal: true }}
                >
                    <img
                        src={BystanderImage}
                        className={classNames(classes.character, classes.bystander, {
                            [classes.flip]: flip,
                        })}
                        style={{ left }}
                    />
                </Tooltip>
            ))}
        </div>
    );
};

export default SewerEntrance;
