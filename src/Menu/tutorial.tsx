import { block, slam, slashBlast } from "../ability/warrior/warriorAbilities";
import { Wave } from "../battle/types";
import { basicDummy, basicDummy2, spikedDummy } from "../enemy/dummy";
import Icon from "../icon/Icon";
import { BlockImage, SlashBlastImage, SpikedMaceImage } from "../images";
import { CactusIcon, ShieldIcon } from "../images/icons";
import { Fury } from "../resource/ResourcesView";

const warriorTutorial = {
    isTutorial: true,
    waves: [
        {
            description: [
                <>
                    Select your <Icon icon={SpikedMaceImage} /> abilities, and attack the dummy.
                </>,
                <>
                    Cards often cost <Fury /> Fury, limiting how many you can play per turn.
                </>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 35 }, null],
            presetDeck: [slam, slam, slam],
        },
        {
            description: [
                <>
                    Target multiple enemies with <Icon icon={SlashBlastImage} /> Slash Blast.
                </>,
            ],
            enemies: [null, basicDummy, null, basicDummy, null],
            presetDeck: [slashBlast, slashBlast, slashBlast],
        },
        {
            description: [
                <>
                    Use <Icon icon={BlockImage} /> Block to defend against attacks.
                </>,
                <>
                    Unused <Icon icon={ShieldIcon} /> Armor will decay by half every turn.
                </>,
            ],
            enemies: [basicDummy2, basicDummy2, basicDummy2, basicDummy2, basicDummy2],
            presetDeck: [block, block, block, slashBlast, slashBlast],
        },
        {
            description: [
                <>
                    This dummy has <Icon icon={CactusIcon} /> Thorns. Hover over it for more info.
                </>,
                <>These effects can be dangerous, so try to pay attention to them.</>,
            ],
            enemies: [null, null, spikedDummy, null, null],
            presetDeck: [slam, slam, block],
        },
    ] as Wave[],
};

export default warriorTutorial;
