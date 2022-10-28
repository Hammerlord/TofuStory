import { useEffect, useMemo } from "react";
import { dustDevils, rush, slam, slashBlast2, spikedArmor, warLeap, yell } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/phases";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { stumpy } from "../enemy/stumpy";
import { useAppDispatch, useAppSelector } from "../hooks";

const { updatePlayer, updateDeck } = playerStateSlice.actions;

const DevStageBattle = () => {
    const deck = useMemo(() => [spikedArmor, yell, dustDevils, slam, slashBlast2, warLeap, slashBlast2, rush], []);
    const enemies = useMemo(() => [null, null, stumpy, null, null], []);
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
