import { useEffect, useMemo } from "react";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "../ability/types";
import { shout } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/phases";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy } from "../enemy/dummy";
import { useAppDispatch, useAppSelector } from "../hooks";
import { StarfallMagicSquareImage } from "../images";

const { updatePlayer, updateDeck } = playerStateSlice.actions;
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];

// Dev testing purposes only
export const deathLaser: Ability = {
    name: "Death Laser",
    image: StarfallMagicSquareImage,
    resourceCost: 0,
    actions: [
        {
            damage: 1000,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: StarfallMagicSquareImage,
            animation: ANIMATION_TYPES.BEAM,
        },
    ],
};

const DevStageBattle = () => {
    const deck = useMemo(() => [shout, deathLaser], []);
    const enemies = useMemo(() => dummies, []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(updatePlayer(defaultCharacterProperties));
        dispatch(updateDeck(deck));
        dispatch(startBattle({ deck, waves: [{ enemies }] }));
    }, []);

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer />;
};

export default DevStageBattle;
