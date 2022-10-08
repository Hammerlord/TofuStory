import { getRandomItem } from "../../../utils";

const getBystanderDialogue = () => {
    return getRandomItem([
        "",
        "",
        "ccplz @@@@@@@@@@@@@",
        "mesos plz @@@@@@@@@@ @@@@@@@@ @@@@@@@@@@@@",
        "free stuff plz @@@@@@@@@@ @@@@@@@@ @@@@@@@@@@@@",
        "LF KPQ @@@@@@@@@@@@@@@@@@@",
        "NX Plzxxxxx",
        "WTB> fame 5 meso you fame first",
        "noob",
        "wtf",
        "give me mesos or I defame",
        "WTS KUMBI 300K OBO",
        "WTS>>> 11 DEF PANLID 1 MIL @@@@@ @@@@@ @@@@@",
        "can i have free plz",
        "LF GF MUST HAVE NX",
        `LVL ${getRandomItem(Array.from({ length: 10 }).map((_, i) => 20 + i))} ${getRandomItem([
            "rouge",
            "MAGICIAN",
            "war",
            "archer",
        ])} LFG KPQ @@@@@@@ @@@@@@@@@@ @@@@@@@@@@ @@@@ @@@@@@@`,
    ]);
};

export default getBystanderDialogue;
