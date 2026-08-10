import { Box } from "@mui/material";
import { Action } from "../ability/types";
import { MesoCoinImage, MesoImage } from "../images";

const coinAnimation = {
    "@keyframes coinFloat": {
        "0%": {
            transform: "translate(-50%, 100px)",
            opacity: 1,
        },
        "50%": {
            easing: "ease-in-out",
            transform: "translate(-50%, -100px) ",
            opacity: 1,
        },
        "100%": {
            transform: "translate(-50%, 100px)",
            opacity: 0,
        },
    },
};

const Coin = ({ action }: { action?: Action }) => {
    const mesos = action?.mesos;
    if (!mesos) {
        return;
    }

    let moneyImage;
    if (mesos > 10) {
        moneyImage = MesoCoinImage;
    } else {
        moneyImage = MesoImage;
    }

    return (
        <Box
            sx={{
                ...coinAnimation,
                position: "absolute",
                left: "50%",
                bottom: "50%",
                width: 40,
                height: 40,
                animation: "coinFloat 500ms ease-out forwards",
                zIndex: 100,
                pointerEvents: "none",

                "& img": {
                    display: "block",
                    width: "100%",
                    height: "100%",
                },
            }}
        >
            <img src={moneyImage} alt="meso" />
        </Box>
    );
};

export default Coin;
