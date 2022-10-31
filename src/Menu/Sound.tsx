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
        background: "rgba(110, 110, 110, 0.9) !important",
    },
});

const TRANSITION_TIME = 500;

const fadeOutAudio = (audio) => {
    const interval = setInterval(() => {
        if (audio.volume > 0) {
            audio.volume -= 0.1;
        }
    }, TRANSITION_TIME / 10);
    setTimeout(() => {
        audio.pause();
        clearInterval(interval);
    }, TRANSITION_TIME);
};

const fadeInAudio = (audio) => {
    audio.volume = 0;
    const interval = setInterval(() => {
        if (audio.volume < 1) {
            audio.volume += 0.1;
        }
    }, TRANSITION_TIME / 10);
    setTimeout(() => {
        clearInterval(interval);
    }, TRANSITION_TIME);
};

const Sound = ({ playlist = REGIONS.LITH_HARBOR, playTrack }: { playlist: REGIONS; playTrack?: string }) => {
    const [trackIndex, setTrackIndex] = useState(0);
    const tracks = musicMap[playlist] || [];
    const [overrideAudio, setOverrideAudio] = useState(null);
    const [playlistAudio] = useState(new Audio(tracks[trackIndex]));
    const audio = overrideAudio || playlistAudio;
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
        // Loop playlist audio
        let indexInTracks = tracks.findIndex((track) => track === playlistAudio.src);
        if (indexInTracks === -1) {
            indexInTracks = 0;
        }
        setTrackIndex(indexInTracks);
        if (playlistAudio.src !== tracks[indexInTracks]) {
            playlistAudio.src = tracks[indexInTracks];
            if (playing) {
                playlistAudio.play();
            }
        }
        const onEnded = () => {
            const newIndex = (trackIndex + 1) % tracks.length;
            playlistAudio.src = tracks[newIndex];
            playlistAudio.play();
            setTrackIndex(newIndex);
        };
        playlistAudio.addEventListener("ended", onEnded);

        return () => {
            playlistAudio.removeEventListener("ended", onEnded);
        };
    }, [tracks, trackIndex]);

    useEffect(() => {
        if (!playing || playTrack === overrideAudio?.src) {
            return;
        }

        if (overrideAudio) {
            fadeOutAudio(overrideAudio);
            setTimeout(() => {
                overrideAudio.src = "";
                setOverrideAudio(null);
                playlistAudio.play();
                fadeInAudio(playlistAudio);
            }, TRANSITION_TIME);
            return;
        }

        if (playTrack) {
            fadeOutAudio(playlistAudio);
            const newOverrideAudio = new Audio(playTrack);
            newOverrideAudio.loop = true;
            setOverrideAudio(newOverrideAudio);
            setTimeout(() => {
                newOverrideAudio.play();
                fadeInAudio(newOverrideAudio);
            }, TRANSITION_TIME);
        }
    }, [playTrack, playing]);

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
