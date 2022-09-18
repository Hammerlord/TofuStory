import { useEffect, useMemo } from "react";
import { snailMinion } from "../ability/minion";
import { brandish } from "../ability/warrior/fighterAbilities";
import {
    bash,
    block,
    bloodthirst,
    dash,
    dustDevils,
    hammerang,
    ironBody,
    rush,
    shieldStrike,
    slashBlast,
    spikedArmor,
    whirlwind,
} from "../ability/warrior/warriorAbilities";
import { startBattle } from "../battle/actions/actions";
import BattlefieldContainer from "../battle/BattleView";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { rally } from "../enemy/abilities";
import { blueSnail, redSnail, snail } from "../enemy/enemy";
import { useAppDispatch, useAppSelector } from "../hooks";

const DevStageBattle = () => {
    const deck = useMemo(() => [spikedArmor, bloodthirst, ironBody], []);
    const enemies = useMemo(() => [snail, blueSnail, redSnail, blueSnail, snail], []);
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle);
    useEffect(() => {
        dispatch(startBattle({ player: defaultCharacterProperties, deck, waves: [{ enemies }, { enemies }] }));
    }, []);

    if (!battle) {
        return null;
    }
    return <BattlefieldContainer />;
};

export default DevStageBattle;
