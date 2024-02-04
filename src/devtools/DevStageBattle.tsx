import { useEffect, useMemo } from "react";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "../ability/types";
import { shout } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/phases";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties, { wizardProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy } from "../enemy/dummy";
import { useAppDispatch, useAppSelector } from "../hooks";
import { StarfallMagicSquareImage } from "../images";
import { faust, ghostlyPuppeteerL, ghostlyPuppeteerR } from "../enemy/faust";
import { JOB_CARD_MAP } from "../ability";

const { updatePlayer, updateDeck } = playerStateSlice?.actions || {};
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];
const other = [ghostlyPuppeteerL, null, faust, null, ghostlyPuppeteerR];

// Dev testing purposes only
export const deathLaser: Ability = {
    name: "Death Laser",
    image: StarfallMagicSquareImage,
    resourceCost: 0,
    actions: [
        {
            damage: 100,
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: StarfallMagicSquareImage,
            animation: ANIMATION_TYPES.BEAM,
        },
    ],
};

const DevStageBattle = () => {
    const deck = useMemo(() => [deathLaser], []);
    const enemies = useMemo(() => other, []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(updatePlayer(wizardProperties));
        dispatch(updateDeck(deck));
        dispatch(startBattle({ deck, waves: [{ enemies }] }));
    }, []);

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer />;
};

export default DevStageBattle;
