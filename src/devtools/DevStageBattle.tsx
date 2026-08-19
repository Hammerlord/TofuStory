import { useEffect, useMemo } from "react";

import { bowmanProperties, wizardProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy, spikedDummy } from "../enemy/dummy";
import { faust, ghostlyPuppeteerL, ghostlyPuppeteerR } from "../enemy/faust";
import { useAppDispatch, useAppSelector } from "../hooks";
import { deathLaser } from "./deathLaser";
import { bladedArmor, block, closeCombat, divineCharge, dustDevils, hammerang, shieldCharge } from "../ability/warrior/warriorAbilities";
import { goutOfFlame, icyDraft, lesserBolt, whelp, zap } from "../ability/magician/magicianAbilities";
import { manji } from "../enemy/Manji";
import { gachaponMachine } from "../scene/gachapon/Gachapon";
import { entrenchedFire, guard, shatteringArrow, windupShot } from "../ability/bowman/bowmanAbilities";
import { curseEye } from "../enemy/enemy";
import { startBattle } from "../battle/actions/phases/phases";
import BattlefieldContainer from "../battle/view/BattleView";

const { updatePlayer, updateDeck } = playerStateSlice?.actions || {};
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];
const other = [null, null, spikedDummy, spikedDummy, null];

const DevStageBattle = () => {
    const deck = useMemo(() => [closeCombat, dustDevils, guard, guard, bladedArmor, shatteringArrow, entrenchedFire], []);
    const enemies = useMemo(() => other, []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(updatePlayer(bowmanProperties));
        dispatch(updateDeck(deck));
        dispatch(startBattle({ deck, waves: [{ enemies }] }));
    }, []);

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer />;
};

export default DevStageBattle;
