import { useEffect, useMemo } from "react";
import BattlefieldContainer from "../battle/BattleView";
import { startBattle } from "../battle/actions/phases";
import { wizardProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy } from "../enemy/dummy";
import { faust, ghostlyPuppeteerL, ghostlyPuppeteerR } from "../enemy/faust";
import { useAppDispatch, useAppSelector } from "../hooks";
import { deathLaser } from "./deathLaser";
import { block } from "../ability/warrior/warriorAbilities";
import { lesserBolt } from "../ability/magician/magicianAbilities";
import { manji } from "../enemy/Manji";

const { updatePlayer, updateDeck } = playerStateSlice?.actions || {};
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];
const other = [null, null, manji, null, null];

const DevStageBattle = () => {
    const deck = useMemo(() => [block, block, lesserBolt], []);
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
