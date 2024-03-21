import { TOWNS } from "./types";
import Ellinia from "./Ellinia";
import Henesys from "./Henesys";
import KerningCity from "./KerningCity";
import LithHarbor from "./LithHarbor";
import Perion from "./Perion";
import Sleepywood from "./Sleepywood";

export const TOWN_MAP = {
    [TOWNS.KERNING]: KerningCity,
    [TOWNS.LITH_HARBOR]: LithHarbor,
    [TOWNS.HENESYS]: Henesys,
    [TOWNS.PERION]: Perion,
    [TOWNS.ELLINIA]: Ellinia,
    [TOWNS.SLEEPYWOOD]: Sleepywood,
};
