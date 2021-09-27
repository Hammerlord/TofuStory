import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { bystanderImage, kerningSewerEntranceFull2, lakelisImage, shoImage, stefaImage, wessImage } from "../../images";
import { getRandomArbitrary, getRandomItem } from "../../utils";
import Tooltip from "../../view/Tooltip";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${kerningSewerEntranceFull2}) no-repeat`,
        width: "1200px",
        height: "616px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        left: "300px",
        top: "306px",
        height: "70px",
    },
    sho: {
        left: "380px",
        top: "297px",
        transform: "scale(-1, 1)",
    },
    stefa: {
        left: "450px",
        top: "308px",
        transform: "scale(-1, 1)",
    },
    wess: {
        left: "480px",
        top: "300px",
        transform: "scale(-1, 1)",
    },
    lakelis: {
        top: 255,
        left: 972,
    },
    flip: {
        transform: "scale(-1, 1)",
    },
    bystander: {
        top: 303,
        width: 48,
    },
    speechBubble: {
        "&&": {
            maxWidth: "100px",
        },
    },
});

const SewerEntrance2 = ({ player }) => {
    const classes = useStyles();
    const [bystanders] = useState(
        Array.from({ length: 12 }).map((_, i: number) => ({
            flip: Math.random() < 0.5,
            left: 600 + i * getRandomArbitrary(20, 30),
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
            <img src={lakelisImage} className={classNames(classes.lakelis, classes.character)} />

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

export default SewerEntrance2;
