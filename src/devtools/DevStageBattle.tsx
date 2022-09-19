import { useEffect, useMemo } from "react";
import { burningSoulBlade, comboFury } from "../ability/warrior/fighterAbilities";
import { dustDevils, dustDevils2, slashBlast, spikedArmor } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/actions";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { blueSnail, redSnail, snail } from "../enemy/enemy";
import { useAppDispatch, useAppSelector } from "../hooks";

const { updatePlayer, updateDeck } = playerStateSlice.actions;

const DevStageBattle = () => {
    const deck = useMemo(() => [spikedArmor], []);
    const enemies = useMemo(() => [null, null, redSnail, blueSnail, snail], []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(updatePlayer(defaultCharacterProperties));
        dispatch(updateDeck(deck));
        dispatch(startBattle({ player: defaultCharacterProperties, deck, waves: [{ enemies }, { enemies }] }));
    }, []);

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer />;
};

export default DevStageBattle;
