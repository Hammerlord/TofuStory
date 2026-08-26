import { useEffect, useMemo } from "react";

import { entrenchedFire, guard, shatteringArrow } from "../ability/bowman/bowmanAbilities";
import { bladedArmor, closeCombat, dustDevils } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/phases/phases";
import BattlefieldContainer from "../battle/view/BattleView";
import { bowmanProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy, spikedDummy } from "../enemy/dummy";
import { useAppDispatch, useAppSelector } from "../hooks";

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
