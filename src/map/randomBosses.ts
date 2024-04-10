import { athena } from "../enemy/athenaPierce";
import { miniBean } from "../enemy/miniBean";
import { TOWNS } from "./types";

export const RANDOM_BOSSES = {
    [TOWNS.HENESYS]: [miniBean.name, athena.name],
};
