import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { MusicIcon, XIcon } from "../images/icons";
import { REGIONS } from "../map/regions";
import { IconButton, Slider } from "@mui/material";

const musicMap = {
    [REGIONS.LITH_HARBOR]: [
        "https://maplestory.io/api/GMS/40B/music/Bgm02/AboveTheTreetops",
        "https://maplestory.io/api/GMS/40B/music/Bgm03/BlueSky",
        "https://maplestory.io/api/GMS/40B/music/Bgm01/CavaBien",
    ],
    [REGIONS.KERNING]: [
        "https://maplestory.io/api/GMS/40B/music/Bgm01/BadGuys",
        "https://maplestory.io/api/GMS/248/music/Bgm15/inNautilus",
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
        "https://maplestory.io/api/GMS/93T/music/Bgm15/ElinForest",
        "https://maplestory.io/api/GMS/93T/music/Bgm10/TimelessB",
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

    const interval = window.setInterval(() => {
        const decrement = Math.min(audio.volume, currentVolume / FADE_INCREMENT);
        audio.volume -= decrement;
    }, TRANSITION_TIME / FADE_INCREMENT);

    const timeout = window.setTimeout(() => {
        audio.pause();
        clearInterval(interval);
    }, TRANSITION_TIME);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
};

const fadeInAudio = (audio: HTMLAudioElement, targetVolume: number) => {
    const interval = window.setInterval(() => {
        const increment = Math.min(targetVolume - audio.volume, targetVolume / FADE_INCREMENT);

        audio.volume += increment;
    }, TRANSITION_TIME / FADE_INCREMENT);

    const timeout = window.setTimeout(() => {
        clearInterval(interval);
    }, TRANSITION_TIME);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
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

const Sound = ({
    playlist = REGIONS.LITH_HARBOR,
    playTrack,
    isGameOver,
}: {
    playlist: REGIONS;
    playTrack?: string;
    isGameOver?: boolean;
}) => {
    const [trackIndex, setTrackIndex] = useState(0);
    const [volume, setVolume] = useState(getDefaultVolume());
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [overrideAudio, setOverrideAudio] = useState(null);
    const tracks = musicMap[playlist] || [];
    const [isPlaying, setIsPlaying] = useState(volume > 0 && getDefaultPlaying());

    const [playlistAudio, setPlaylistAudio] = useState(() => {
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
        } else {
            playlistAudio.volume = volume;
            if (overrideAudio) {
                overrideAudio.volume = volume;
            }
        }
    };

    useEffect(() => {
        const onEnded = () => {
            setTrackIndex((index) => {
                return (index + 1) % tracks.length;
            });
        };

        playlistAudio.addEventListener("ended", onEnded);

        return () => {
            playlistAudio.removeEventListener("ended", onEnded);
        };
    }, [playlistAudio, tracks.length]);

    useEffect(() => {
        // Handle tracklist loop
        if (playTrack || overrideAudio) {
            return;
        }
        let fadeinCleanup;
        const timeout = setTimeout(() => {
            if (isPlaying) {
                playlistAudio.play().catch(console.error);
                fadeinCleanup = fadeInAudio(playlistAudio, volume);
            }
        }, NEXT_TRACK_TRANSITION_TIME);

        return () => {
            if (fadeinCleanup) {
                fadeinCleanup();
            }
            clearTimeout(timeout);
        };
    }, [trackIndex, isPlaying, playTrack, overrideAudio]);

    useEffect(() => {
        // Handle tracklist/region change
        if (playTrack || overrideAudio) {
            return;
        }

        if (playlistAudio.src !== tracks[trackIndex]) {
            playlistAudio.src = tracks[trackIndex];
        }

        if (isPlaying && playlistAudio.paused) {
            playlistAudio.play().catch(console.error);
        }
    }, [trackIndex, tracks, isPlaying, playTrack, overrideAudio]);

    useEffect(() => {
        if (!isGameOver) {
            return;
        }

        if (overrideAudio) {
            const cleanupFadeout = fadeOutAudio(overrideAudio);
            const timeout = setTimeout(() => {
                overrideAudio.src = "";
                setOverrideAudio(null);
            }, TRANSITION_TIME);

            return () => {
                cleanupFadeout();
                clearTimeout(timeout);
            };
        }

        const cleanupFadeout = fadeOutAudio(playlistAudio);
        const timeout = setTimeout(() => {
            playlistAudio.src = "";
            setPlaylistAudio(null);
        }, TRANSITION_TIME);

        return () => {
            cleanupFadeout();
            clearTimeout(timeout);
        };
    }, [isGameOver]);

    const previousOverride = useRef<string | null>(null);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        let timeout: ReturnType<typeof setTimeout> | undefined;
        let cleanupFadeOut: (() => void) | undefined;
        let cleanupFadeIn: (() => void) | undefined;

        const enteringOverride = !previousOverride.current && playTrack;
        const leavingOverride = previousOverride.current && !playTrack;

        if (enteringOverride) {
            previousOverride.current = playTrack;

            const audio = new Audio(playTrack);
            audio.volume = 0;

            setOverrideAudio(audio);

            cleanupFadeOut = fadeOutAudio(playlistAudio);

            timeout = setTimeout(() => {
                audio.play().catch(console.error);
                cleanupFadeIn = fadeInAudio(audio, volume);
            }, TRANSITION_TIME);
        }

        if (leavingOverride) {
            previousOverride.current = null;

            if (!overrideAudio) {
                return;
            }

            cleanupFadeOut = fadeOutAudio(overrideAudio);

            timeout = setTimeout(() => {
                overrideAudio.pause();
                overrideAudio.src = "";

                setOverrideAudio(null);

                playlistAudio.volume = 0;
                playlistAudio.play().catch(console.error);
                cleanupFadeIn = fadeInAudio(playlistAudio, volume);
            }, TRANSITION_TIME);
        }

        return () => {
            cleanupFadeOut?.();
            cleanupFadeIn?.();

            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [playTrack, isPlaying, volume]);

    useEffect(() => {
        if (!overrideAudio) {
            return;
        }

        let timeout: number | undefined;

        const onEnded = () => {
            timeout = window.setTimeout(() => {
                overrideAudio.play();
            }, NEXT_TRACK_TRANSITION_TIME);
        };

        overrideAudio.addEventListener("ended", onEnded);

        return () => {
            overrideAudio.removeEventListener("ended", onEnded);

            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [overrideAudio]);

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
