import { createUseStyles } from "react-jss";
import {
    ArwenTheFairyImage,
    DeepeningForestImage,
    ElliniaLibraryOutsideImage,
    FaustImage,
    GreenFairiesImage,
    LupinRunningImage,
    RowenTheFairyImage,
    ShadowyForestImage,
    TwilitForest2Image,
    TwilitForest3Image,
    TwilitForestImage,
    ZombieLupinDeathImage,
    ZombieLupinJumpImage,
} from "../../images";
import classNames from "classnames";
import { malady } from "../../enemy/enemy";
import { lostEcho, lostGuardEcho, lostNobleEcho } from "../../enemy/echoes";
import { TombstoneIcon } from "../../images/icons";

const character = {
    position: "absolute",
    filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
};

const introUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${ElliniaLibraryOutsideImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: "347px",
        left: "422px",
        height: "65px",
    },
    arwen: {
        top: "316px",
        left: "321px",
        transform: "scaleX(-1) translateY(-16px)",
        animationName: "$upAndDownArwen",
        animationDuration: "1.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    rowen: {
        top: "281px",
        left: "534px",
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-16px)",
        },
    },
    "@keyframes upAndDownArwen": {
        from: {
            transform: "scaleX(-1) translateY(0)",
        },
        to: {
            transform: "scaleX(-1) translateY(-16px)",
        },
    },
});

const arwen = {
    name: "Arwen the Fairy",
    image: ArwenTheFairyImage,
};

const rowen = {
    name: "Rowen the Fairy",
    image: RowenTheFairyImage,
};

export const ArwenIntroScene = ({ player }) => {
    const classes = introUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={arwen.image} className={classNames(classes.arwen, classes.character)} />
            <img src={rowen.image} className={classNames(classes.rowen, classes.character)} />
        </div>
    );
};

const lupinForestUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${DeepeningForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 324,
        left: 300,
        height: "65px",
    },
});

export const LupinForest = ({ player }) => {
    const classes = lupinForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

const lupinForest2UseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${DeepeningForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 324,
        left: 300,
        height: "65px",
    },
    lupin: {
        top: 383,
        left: 550,
    },
});

export const LupinForest2 = ({ player }) => {
    const classes = lupinForest2UseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={LupinRunningImage} className={classNames(classes.lupin, classes.character)} />
        </div>
    );
};

const lupinForest3UseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${DeepeningForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 324,
        left: 300,
        height: "65px",
    },
    lupin: {
        top: 403,
        left: 550,
    },
});

export const LupinForest3 = ({ player }) => {
    const classes = lupinForest3UseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={ZombieLupinDeathImage} className={classNames(classes.lupin, classes.character)} />
        </div>
    );
};

const lupinForest4UseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${DeepeningForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 324,
        left: 300,
        height: "65px",
    },
    lupin: {
        top: 61,
        left: 500,
    },
    lupin2: {
        top: 379,
        left: 668,
    },
    lupin3: {
        top: 359,
        left: 750,
    },
});

// No longer used because this encounter has been rolled into the initial one
export const LupinForest4 = ({ player }) => {
    const classes = lupinForest4UseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={ZombieLupinJumpImage} className={classNames(classes.lupin, classes.character)} />
            <img src={ZombieLupinJumpImage} className={classNames(classes.lupin2, classes.character)} />
            <img src={ZombieLupinJumpImage} className={classNames(classes.lupin3, classes.character)} />
        </div>
    );
};

const darkForestUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${ShadowyForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 396,
        left: 400,
        height: "65px",
    },
    giantLupin: {
        top: 227,
        left: 600,
    },
    malady1: {
        top: 350,
        left: 250,
        transform: "scaleX(-1)",
    },
    malady2: {
        top: 350,
        left: 550,
    },
});

export const DarkForest1 = ({ player }) => {
    const classes = darkForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const DarkForest2 = ({ player }) => {
    const classes = darkForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={FaustImage} className={classNames(classes.giantLupin, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady1, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady2, classes.character)} />
        </div>
    );
};

export const DarkForestMaladies = ({ player }) => {
    const classes = darkForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady1, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady2, classes.character)} />
        </div>
    );
};

export const twilitForestUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${TwilitForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
        filter: "brightness(0.4)",
    },
    character,
    player: {
        top: 396,
        left: 500,
        height: "65px",
    },
});

export const TwilitForest = ({ player }) => {
    const classes = twilitForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const twilitForestUseStyles2 = createUseStyles({
    root: {
        position: "relative",
        background: `url(${TwilitForest2Image}) no-repeat`,
        width: "100%",
        height: "100%",
        filter: "brightness(0.2)",
    },
    character,
    player: {
        top: 396,
        left: 400,
        height: "65px",
    },
});

export const TwilitForest2 = ({ player }) => {
    const classes = twilitForestUseStyles2();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const twilitForestUseStyles3 = createUseStyles({
    root: {
        position: "relative",
        background: `url(${TwilitForest2Image}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 396,
        left: 400,
        height: "65px",
    },
    lostEcho1: {
        top: 396,
        left: 520,
    },
    lostEcho2: {
        top: 396,
        left: 570,
    },
    lostEcho3: {
        top: 396,
        left: 630,
    },
    lostEcho4: {
        top: 396,
        left: 660,
    },
    lostEcho5: {
        top: 396,
        left: 680,
    },
    echo: {
        filter: "brightness(0.25) saturate(0.25) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
    },
});

export const TwilitForest3 = ({ player }) => {
    const classes = twilitForestUseStyles3();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const TwilitForest4 = ({ player }) => {
    const classes = twilitForestUseStyles3();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={lostEcho.image} className={classNames(classes.character, classes.lostEcho1, classes.echo)} />
            <img src={lostGuardEcho.image} className={classNames(classes.character, classes.lostEcho2, classes.echo)} />
            <img src={lostNobleEcho.image} className={classNames(classes.character, classes.lostEcho3, classes.echo)} />
            <img src={lostGuardEcho.image} className={classNames(classes.character, classes.lostEcho4, classes.echo)} />
            <img src={lostEcho.image} className={classNames(classes.character, classes.lostEcho5, classes.echo)} />
        </div>
    );
};

export const tombstonesTwilitForestUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${TwilitForest3Image}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 396,
        left: 300,
        height: "65px",
    },
    tombstone: {
        width: 50,
        height: 50,
    },
    tombstone1: {
        top: 390,
        left: 425,
    },
    tombstone2: {
        top: 390,
        left: 475,
    },
    tombstone3: {
        top: 390,
        left: 525,
    },
    tombstone4: {
        top: 416,
        left: 400,
    },
    tombstone5: {
        top: 416,
        left: 450,
    },
    tombstone6: {
        top: 416,
        left: 500,
    },
    lightup: {
        filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        position: "absolute",
        top: 300,
        left: 450,
    },
});

export const TombstonesTwilitForest = ({ player }) => {
    const classes = tombstonesTwilitForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                    <TombstoneIcon className={classNames(classes.character, classes.tombstone, classes[`tombstone${i + 1}`])} />
                </div>
            ))}
        </div>
    );
};

export const TombstonesTwilitForestFairies = ({ player }) => {
    const classes = tombstonesTwilitForestUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                    <TombstoneIcon className={classNames(classes.character, classes.tombstone, classes[`tombstone${i + 1}`])} />
                </div>
            ))}
            <img src={GreenFairiesImage} className={classNames(classes.lightup)} />
        </div>
    );
};

const lupinForestMaladiesUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${DeepeningForestImage}) no-repeat`,
        width: "100%",
        height: "100%",
    },
    character,
    player: {
        top: 365,
        left: 450,
        height: "65px",
    },
    malady1: {
        top: 300,
        left: 250,
        transform: "scaleX(-1)",
    },
    malady2: {
        top: 350,
        left: 600,
    },
});

export const LupinForestMaladies = ({ player }) => {
    const classes = lupinForestMaladiesUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady1, classes.character)} />
            <img src={malady.image} className={classNames(classes.malady2, classes.character)} />
        </div>
    );
};
