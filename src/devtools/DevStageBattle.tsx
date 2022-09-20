import { useEffect, useMemo } from "react";
import { burningSoulBlade, comboFury } from "../ability/warrior/fighterAbilities";
import { dustDevils, dustDevils2, slam, slashBlast, spikedArmor } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/actions";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { blueSnail, manoEnemy, redSnail, snail } from "../enemy/enemy";
import { useAppDispatch, useAppSelector } from "../hooks";

const { updatePlayer, updateDeck } = playerStateSlice.actions;

const DevStageBattle = () => {
    const deck = useMemo(() => [spikedArmor, dustDevils, slam], []);
    const enemies = useMemo(() => [null, null, manoEnemy, null, null], []);
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
