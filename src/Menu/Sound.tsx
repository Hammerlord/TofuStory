import { IconButton } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { MusicIcon, XIcon } from "../images/icons";
import { REGIONS } from "../Map/regions";

const musicMap = {
    [REGIONS.LITH_HARBOR]: [
        "https://maplestory.io/api/GMS/40B/music/Bgm02/AboveTheTreetops",
        "https://maplestory.io/api/GMS/40B/music/Bgm03/BlueSky",
        "https://maplestory.io/api/GMS/40B/music/Bgm01/CavaBien",
    ],
    [REGIONS.KERNING]: [
        "https://maplestory.io/api/GMS/40B/music/Bgm01/BadGuys",
        "https://maplestory.io/api/GMS/236/music/Bgm21/LoversIntheAfternoon",
        "https://maplestory.io/api/GMS/236/music/Bgm21/KerningSquare",
    ],
    [REGIONS.KERNING_SEWERS]: ["https://maplestory.io/api/GMS/93T/music/Bgm02/JungleBook"],
    [REGIONS.HENESYS]: [
        "https://maplestory.io/api/GMS/40B/music/Bgm01/CavaBien",
        "https://maplestory.io/api/GMS/236/music/Bgm00/FloralLife",
        "https://maplestory.io/api/GMS/236/music/Bgm00/GoPicnic",
    ],
    [REGIONS.ELLINIA]: [
        "https://maplestory.io/api/GMS/236/music/Bgm01/MoonlightShadow",
        "https://maplestory.io/api/GMS/236/music/Bgm02/MissingYou",
        "https://maplestory.io/api/GMS/236/music/Bgm02/WhenTheMorningComes",
    ],
    [REGIONS.PERION]: [
        "https://maplestory.io/api/GMS/236/music/Bgm01/HighlandStar",
        "https://maplestory.io/api/GMS/236/music/Bgm12/AcientRemain",
        "https://maplestory.io/api/GMS/236/music/Bgm00/Nightmare",
    ],
    [REGIONS.SLEEPYWOOD]: ["https://maplestory.io/api/GMS/93T/music/Bgm00/SleepyWood"],
};

const useStyles = createUseStyles({
    soundOff: {
        filter: "saturate(0%)",
    },
    xIcon: {
        position: "absolute",
        right: 4,
        top: 4,
    },
    iconButton: {
        background: "rgba(40, 40, 40, 0.25) !important",
    },
});

const Sound = ({ region = REGIONS.LITH_HARBOR }: { region: REGIONS }) => {
    const [trackIndex, setTrackIndex] = useState(0);
    const tracks = musicMap[region] || [];
    const [audio] = useState(new Audio(tracks[trackIndex]));
    const [playing, setPlaying] = useState(true);
    const classes = useStyles();
    const togglePlaying = () => setPlaying(!playing);

    useEffect(() => {
        if (playing) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [playing]);

    useEffect(() => {
        let indexInTracks = tracks.findIndex((track) => track === audio.src);
        if (indexInTracks === -1) {
            indexInTracks = 0;
        }
        setTrackIndex(indexInTracks);
        if (audio.src !== tracks[indexInTracks]) {
            audio.src = tracks[indexInTracks];
            audio.play();
        }
        const onEnded = () => {
            const newIndex = (trackIndex + 1) % tracks.length;
            audio.src = tracks[newIndex];
            audio.play();
            setTrackIndex(newIndex);
        };
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("ended", onEnded);
        };
    }, [tracks, trackIndex]);

    return (
        <IconButton
            onClick={togglePlaying}
            className={classNames(classes.iconButton, {
                [classes.soundOff]: !playing,
            })}
            title="Toggle music on/off"
        >
            <Icon icon={MusicIcon} />
            {!playing && <Icon icon={XIcon} className={classes.xIcon} size="sm" />}
        </IconButton>
    );
};

export default Sound;
