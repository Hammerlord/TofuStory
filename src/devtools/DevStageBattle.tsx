import { useEffect, useMemo } from "react";
import BattlefieldContainer from "../battle/BattleView";
import { startBattle } from "../battle/actions/phases";
import { wizardProperties } from "../character/defaultCharacterProperties";
import { playerStateSlice } from "../character/playerReducer";
import { devDummy } from "../enemy/dummy";
import { faust, ghostlyPuppeteerL, ghostlyPuppeteerR } from "../enemy/faust";
import { useAppDispatch, useAppSelector } from "../hooks";
import { deathLaser } from "./deathLaser";

const { updatePlayer, updateDeck } = playerStateSlice?.actions || {};
const dummies = [devDummy, devDummy, devDummy, devDummy, devDummy];
const other = [ghostlyPuppeteerL, null, faust, null, ghostlyPuppeteerR];

const DevStageBattle = () => {
    const deck = useMemo(() => [deathLaser], []);
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
