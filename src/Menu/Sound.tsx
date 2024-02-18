import IconButton from "@material-ui/core/IconButton";
import Slider from "@material-ui/core/Slider";
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
        "https://delta.vgmsite.com/soundtracks/maplestory-music/uwemoqzyah/82.%20In%20Nautilus.mp3",
        "https://maplestory.io/api/GMS/236/music/Bgm21/KerningSquare",
    ],
    [REGIONS.KERNING_SEWERS]: ["https://maplestory.io/api/GMS/93T/music/Bgm02/JungleBook"],
    [REGIONS.HENESYS]: [
        "https://maplestory.io/api/GMS/210.1.1/music/Bgm00/RestNPeace",
        "https://maplestory.io/api/GMS/236/music/Bgm00/FloralLife",
        "https://maplestory.io/api/GMS/236/music/Bgm00/GoPicnic",
    ],
    [REGIONS.ELLINIA]: [
        "https://maplestory.io/api/GMS/236/music/Bgm01/MoonlightShadow",
        "https://maplestory.io/api/GMS/236/music/Bgm02/MissingYou",
        "https://maplestory.io/api/GMS/236/music/Bgm02/WhenTheMorningComes",
    ],
    [REGIONS.HIDDEN_FOREST]: [
        "https://delta.vgmsite.com/soundtracks/maplestory-music/uptjdyhuxm/81.%20Elin%20Forest.mp3",
        "https://delta.vgmsite.com/soundtracks/maplestory-music/ynanilbuga/57.%20Timeless%20B.mp3",
    ],
    [REGIONS.PERION]: [
        "https://maplestory.io/api/GMS/236/music/Bgm01/HighlandStar",
        "https://maplestory.io/api/GMS/236/music/Bgm12/AcientRemain",
        "https://maplestory.io/api/GMS/236/music/Bgm00/Nightmare",
        "https://maplestory.io/api/GMS/93T/music/Bgm12/RuinCastle",
        "https://maplestory.io/api/GMS/93T/music/Bgm12/WaterWay",
    ],
    [REGIONS.SLEEPYWOOD]: ["https://maplestory.io/api/GMS/93T/music/Bgm00/SleepyWood"],
};

const useStyles = createUseStyles({
    root: {
        display: "flex",
        padding: 8,
    },
    soundOff: {
        filter: "saturate(0%)",
    },
    xIcon: {
        position: "absolute",
        right: 8,
        top: 8,
        filter: "brightness(1.5)",
    },
    iconButton: {
        background: "rgba(50, 50, 50, 0.9) !important",
    },
    volumeSliderContainer: {
        background: "rgba(25, 25, 25, 0.9)",
        borderRadius: 4,
        marginLeft: 8,
        padding: "0px 24px",
        display: "flex",
    },
    volumeSlider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        width: 100,
    },
    speakerButton: {
        margin: "4px 8px !important",
        display: "flex !important",
        flexDirection: "column",
        justifyContent: "space-around !important",
        height: 44,
    },
});

const TRANSITION_TIME = 500;
const NEXT_TRACK_TRANSITION_TIME = 3000;
const FADE_INCREMENT = 10;

const MUSIC_VOLUME_KEY = "musicVolume";
const MUSIC_PLAYING_KEY = "musicPlaying";

const fadeOutAudio = (audio: HTMLAudioElement) => {
    const currentVolume = audio.volume;
    const interval = setInterval(() => {
        const decrementAmount = Math.min(audio.volume, currentVolume / FADE_INCREMENT);
        audio.volume -= decrementAmount;
    }, TRANSITION_TIME / FADE_INCREMENT);
    setTimeout(() => {
        audio.pause();
        clearInterval(interval);
    }, TRANSITION_TIME);
};

const fadeInAudio = (audio: HTMLAudioElement, currentVolume: number) => {
    const interval = setInterval(() => {
        const incrementAmount = Math.min(1 - audio.volume, currentVolume / FADE_INCREMENT);
        audio.volume += incrementAmount;
    }, TRANSITION_TIME / FADE_INCREMENT);

    setTimeout(() => {
        clearInterval(interval);
    }, TRANSITION_TIME);
};

const getDefaultPlaying = (): boolean => {
    const value = localStorage.getItem(MUSIC_PLAYING_KEY);
    if (value === null) {
        return true;
    }

    return JSON.parse(value);
};

const getDefaultVolume = (): number => {
    const value = localStorage.getItem(MUSIC_VOLUME_KEY);
    if (value === null) {
        return 0.75;
    }

    return JSON.parse(value);
};

const Sound = ({ playlist = REGIONS.LITH_HARBOR, playTrack }: { playlist: REGIONS; playTrack?: string }) => {
    const [trackIndex, setTrackIndex] = useState(0);
    const [volume, setVolume] = useState(getDefaultVolume());
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [overrideAudio, setOverrideAudio] = useState(null);
    const tracks = musicMap[playlist] || [];
    const [isPlaying, setIsPlaying] = useState(volume > 0 && getDefaultPlaying());
    const [playlistAudio] = useState(() => {
        const audio = new Audio(tracks[trackIndex]);
        audio.volume = volume;
        if (isPlaying) {
            audio.play();
        }
        return audio;
    });
    const audio = overrideAudio || playlistAudio;
    const classes = useStyles();

    const togglePlaying = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        localStorage.setItem(MUSIC_PLAYING_KEY, JSON.stringify(newIsPlaying));

        if (newIsPlaying) {
            audio.play();
        } else {
            audio.pause();
        }

        if (volume === 0) {
            const minVolume = 0.5;
            setVolume(minVolume);
            playlistAudio.volume = minVolume;
            if (overrideAudio) {
                overrideAudio.volume = minVolume;
            }
        }
    };

    useEffect(() => {
        // Loop playlist audio
        let indexInTracks = tracks.findIndex((track) => track === playlistAudio.src);
        if (indexInTracks === -1) {
            indexInTracks = 0;
        }

        setTrackIndex(indexInTracks);
        if (playlistAudio.src !== tracks[indexInTracks]) {
            fadeOutAudio(playlistAudio);
            playlistAudio.src = tracks[indexInTracks];
            setTimeout(() => {
                if (isPlaying) {
                    playlistAudio.play();
                }
                fadeInAudio(playlistAudio, volume);
            }, TRANSITION_TIME);
        }
        const onEnded = () => {
            const newIndex = (trackIndex + 1) % tracks.length;
            playlistAudio.src = tracks[newIndex];
            setTrackIndex(newIndex);
            setTimeout(() => {
                if (isPlaying) {
                    playlistAudio.play();
                }
            }, NEXT_TRACK_TRANSITION_TIME);
        };
        playlistAudio.addEventListener("ended", onEnded);
        return () => {
            playlistAudio.removeEventListener("ended", onEnded);
        };
    }, [tracks, trackIndex, isPlaying]);

    useEffect(() => {
        if (!isPlaying || playTrack === overrideAudio?.src) {
            return;
        }

        if (overrideAudio) {
            fadeOutAudio(overrideAudio);
            setTimeout(() => {
                overrideAudio.src = "";
                setOverrideAudio(null);
                playlistAudio.play();
                fadeInAudio(playlistAudio, volume);
            }, TRANSITION_TIME);
            return;
        }

        if (playTrack) {
            fadeOutAudio(playlistAudio);
            const newOverrideAudio = new Audio(playTrack);
            setOverrideAudio(newOverrideAudio);
            setTimeout(() => {
                newOverrideAudio.volume = 0;
                newOverrideAudio.play();
                fadeInAudio(newOverrideAudio, volume);
            }, TRANSITION_TIME);

            const onEnded = () => {
                setTimeout(() => {
                    newOverrideAudio.play();
                }, NEXT_TRACK_TRANSITION_TIME);
            };
            newOverrideAudio.addEventListener("ended", onEnded);
        }
    }, [playTrack, isPlaying]);

    const handleChangeVolume = (e, value: number) => {
        setVolume(value);
        localStorage.setItem(MUSIC_VOLUME_KEY, JSON.stringify(value));
        playlistAudio.volume = value;
        if (overrideAudio) {
            overrideAudio.volume = value;
        }

        setIsPlaying(value > 0);
        if (value > 0) {
            audio.play();
        } else {
            audio.pause();
        }
    };

    return (
        <div className={classes.root} onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
            <IconButton
                onClick={togglePlaying}
                title="Toggle music on/off"
                className={classNames(classes.iconButton, {
                    [classes.soundOff]: !isPlaying,
                })}
            >
                <Icon icon={MusicIcon} />
                {!isPlaying && <Icon icon={XIcon} className={classes.xIcon} size="sm" />}
            </IconButton>
            {showVolumeSlider && (
                <div className={classes.volumeSliderContainer}>
                    <div className={classes.volumeSlider}>
                        <Slider
                            aria-label="Volume"
                            value={isPlaying ? volume : 0}
                            onChange={handleChangeVolume}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sound;
