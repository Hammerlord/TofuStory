import { createAction } from "@reduxjs/toolkit";
import type { BattleStatistics, Wave } from "../battle/types";
import type { Player } from "./types";

export const updatePlayer = createAction<{ [key in keyof Player]?: Player[key] }>("player/updatePlayer");
export const pushBattleHistory = createAction<{ statistics: BattleStatistics; waves: Wave[] }>("player/pushBattleHistory");
