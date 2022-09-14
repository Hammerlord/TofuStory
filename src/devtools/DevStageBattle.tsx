import { useEffect, useMemo } from "react";
import { bash, slashBlast, whirlwind } from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/actions";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { blueSnail, redSnail, snail } from "../enemy/enemy";
import { useAppDispatch, useAppSelector } from "../hooks";

const DevStageBattle = () => {
    const deck = useMemo(() => [bash, slashBlast, whirlwind, slashBlast, bash], []);
    const enemies = useMemo(() => [snail, blueSnail, redSnail, blueSnail, snail], []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(startBattle({ player: defaultCharacterProperties, deck, waves: [{ enemies }] }));
    }, []);

    const onBattleWon = () => {};

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer onBattleWon={onBattleWon} />;
};

export default DevStageBattle;
