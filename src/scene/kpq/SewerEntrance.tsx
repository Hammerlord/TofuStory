import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { bystanderImage, kerningSewerEntranceFull, shoImage, stefaImage, wessImage } from "../../images";
import { getRandomArbitrary, getRandomItem } from "../../utils";
import Tooltip from "../../view/Tooltip";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${kerningSewerEntranceFull}) no-repeat`,
        width: "1200px",
        height: "616px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        left: "200px",
        top: "306px",
        height: "70px",
    },
    sho: {
        left: "470px",
        top: "297px",
    },
    stefa: {
        left: "430px",
        top: "308px",
    },
    wess: {
        left: "380px",
        top: "300px",
    },
    flip: {
        transform: "scale(-1, 1)",
    },
    bystander: {
        top: 310,
        width: 48,
    },
    speechBubble: {
        "&&": {
            maxWidth: "100px",
        },
    },
});

const SewerEntrance = ({ player }) => {
    const classes = useStyles();
    const [bystanders] = useState(
        Array.from({ length: 10 }).map((_, i: number) => ({
            flip: Math.random() < 0.5,
            left: 800 + i * getRandomArbitrary(20, 40),
            text: getRandomItem([
                "",
                "ccplz @@@@@@@@@@@@@",
                "mesos plz @@@@@@@@@@ @@@@@@@@ @@@@@@@@@@@@",
                "free stuff plz @@@@@@@@@@ @@@@@@@@ @@@@@@@@@@@@",
                "LF KPQ @@@@@@@@@@@@@@@@@@@",
                "NX Plzxxxxx",
                "WTB> fame 5 meso you fame first",
                "noob",
                "wtf",
                "give me mesos or I defame",
                `LVL ${getRandomItem(Array.from({ length: 10 }).map((_, i) => 20 + i))} ${getRandomItem([
                    "rouge",
                    "MAGICIAN",
                    "war",
                    "archer",
                ])} LFG KPQ @@@@@@@ @@@@@@@@@@ @@@@@@@@@@ @@@@ @@@@@@@`,
            ]),
        }))
    );

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={stefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={shoImage} className={classNames(classes.sho, classes.character)} />
            <img src={wessImage} className={classNames(classes.wess, classes.character)} />
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
                        src={bystanderImage}
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
