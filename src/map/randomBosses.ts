import { athena } from "../enemy/athenaPierce";
import { dancesWithBalrog } from "../enemy/dancesWithBalrog";
import { darkLord } from "../enemy/darkLord";
import { lostDragon } from "../enemy/dragon";
import { dyle } from "../enemy/dyle";
import { grendel } from "../enemy/grendel";
import { miniBean } from "../enemy/miniBean";
import { undeadMage } from "../enemy/undead";
import { TOWNS } from "./types";

export const RANDOM_BOSSES = {
    [TOWNS.HENESYS]: [miniBean.name, athena.name],
    [TOWNS.KERNING]: [dyle.name, darkLord.name],
    [TOWNS.PERION]: [undeadMage.name, dancesWithBalrog.name],
    [TOWNS.ELLINIA]: [lostDragon.name, grendel.name],
};
