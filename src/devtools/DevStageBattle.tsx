import { useEffect, useMemo } from "react";

import { entrenchedFire, guard, momentum, shatteringArrow, snipe } from "../ability/bowman/bowmanAbilities";
import {
    bladedArmor,
    closeCombat,
    dustDevils,
    hammerang,
    slam,
    sweepingReach,
    bash,
    whirlwind,
    cleave,
    counterattack,
    retribute,
    anger,
    dash,
    frenzy,
} from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/phases/phases";
import BattlefieldContainer from "../battle/view/BattleView";
import defaultCharacterProperties, { bowmanProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy, spikedDummy } from "../enemy/dummy";
import { useAppDispatch, useAppSelector } from "../hooks";
import { bounce, vault } from "../ability/neutralAbilities";
import { wanderingBlacksmith } from "../enemy/wanderingBlacksmith";
import { deathLaser } from "./deathLaser";
import { mesoThief } from "../enemy/mesoThieves";
import { miniBean } from "../enemy/miniBean";

const { updatePlayer, updateDeck } = playerStateSlice?.actions || {};
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];
const other = [null, null, miniBean, null, null];

const DevStageBattle = () => {
    const deck = useMemo(() => [closeCombat, momentum, momentum, momentum, snipe], []);
    const enemies = useMemo(() => other, []);
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
