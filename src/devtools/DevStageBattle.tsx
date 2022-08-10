import { useMemo, useState } from "react";
import { bash, slam, slashBlast, whirlwind } from "../ability/warrior/warriorAbilities";
import defaultCharacterProperties from "../character/defaultCharacterProperties";
import { blueSnail, redSnail, snail } from "../enemy/enemy";
import BattlefieldContainer from "../battle/BattleView";

const DevStageBattle = () => {
    const deck = useMemo(() => [bash, slashBlast, whirlwind, slashBlast, bash], []);
    const enemies = useMemo(() => [snail, blueSnail, redSnail, blueSnail, snail], []);
    const [player, setPlayer] = useState(defaultCharacterProperties);

    const onBattleWon = () => {
        setPlayer(defaultCharacterProperties);
    };

    return (
        <BattlefieldContainer player={player} updatePlayer={setPlayer} initialDeck={deck} onBattleWon={onBattleWon} waves={[{ enemies }]} />
    );
};

export default DevStageBattle;
