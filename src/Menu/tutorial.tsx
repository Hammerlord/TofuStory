import { energyBolt, lesserBolt, magicArmor, magicClaw, magicFang, manaGem } from "../ability/magician/magicianAbilities";
import { block, slam, cleave } from "../ability/warrior/warriorAbilities";
import { Wave } from "../battle/types";
import { basicAoeDummyMagician, basicDummy, basicDummy2, spikedDummy } from "../enemy/dummy";
import Icon from "../icon/Icon";
import {
    AlchemistStoneImage,
    BlockImage,
    BlueRushImage,
    EnergyBoltImage,
    MagicArmorOldImage,
    MagicClawImage,
    OldEnergyBoltImage,
    SlashBlastImage,
    SpikedMaceImage,
} from "../images";
import { CactusIcon, ShieldIcon } from "../images/icons";
import { Fury, Mana } from "../resource/ResourcesView";

export interface Tutorial {
    isTutorial?: boolean;
    disableItemRewards?: boolean;
    waves: Wave[];
}

export const warriorTutorial: Tutorial = {
    isTutorial: true,
    disableItemRewards: true,
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
            enemies: [null, null, { ...basicDummy, maxHP: 21 }, null, null],
            presetDeck: [slam, slam, slam],
        },
        {
            description: [
                <>
                    Target multiple enemies with <Icon icon={SlashBlastImage} /> Cleave.
                </>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 10 }, null, { ...basicDummy, maxHP: 10 }, null],
            presetDeck: [cleave, cleave, cleave],
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
            presetDeck: [block, block],
            winCondition: {
                surviveRounds: 1,
            },
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

export const magicianTutorial: Tutorial = {
    isTutorial: true,
    disableItemRewards: true,
    waves: [
        {
            description: [
                <>
                    Select <Icon icon={OldEnergyBoltImage} /> Energy Bolt, and attack the dummy.
                </>,
                <>
                    Cards often cost <Mana /> Mana, limiting how many you can play per turn.
                </>,
            ],
            enemies: [null, null, { ...basicDummy, maxHP: 18 }, null, null],
            presetDeck: [energyBolt, energyBolt, energyBolt],
        },
        {
            description: [
                <>
                    Target multiple enemies with <Icon icon={BlueRushImage} /> Magic Fang.
                </>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 12 }, null, { ...basicDummy, maxHP: 12 }, null],
            presetDeck: [magicFang, magicFang, magicFang],
        },
        {
            description: [
                <>
                    Use <Icon icon={MagicArmorOldImage} /> Magic Armor to defend against attacks.
                </>,
                <>
                    Unused <Icon icon={ShieldIcon} /> Armor will decay by half every turn.
                </>,
            ],
            enemies: [basicAoeDummyMagician, basicAoeDummyMagician, basicDummy2, basicAoeDummyMagician, basicAoeDummyMagician],
            presetDeck: [magicArmor, magicArmor],
            winCondition: {
                surviveRounds: 1,
            },
        },
        {
            description: [
                <>
                    This dummy has <Icon icon={CactusIcon} /> Thorns. Hover over it for more info.
                </>,
                <>These effects can be dangerous, so try to pay attention to them.</>,
            ],
            enemies: [null, null, spikedDummy, null, null],
            presetDeck: [energyBolt, magicArmor, energyBolt],
        },
        {
            description: [
                <>
                    Magicians gain <Icon icon={AlchemistStoneImage} /> Charged when they play a card.
                </>,
                <>
                    <Icon icon={OldEnergyBoltImage} /> Energy Bolt and <Icon icon={BlueRushImage} /> Magic Fang consume{" "}
                    <Icon icon={AlchemistStoneImage} /> to do bonus damage.
                </>,
                <>
                    If <Icon icon={AlchemistStoneImage} /> is unused by end of turn, it'll shoot <Icon icon={OldEnergyBoltImage} /> Lesser
                    Bolt.
                </>,
                <>Try playing a combination of cards to see how this works.</>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 9 }, { ...basicDummy, maxHP: 23 }, { ...basicDummy, maxHP: 9 }, null],
            presetDeck: [energyBolt, magicFang, magicArmor],
        },
    ] as Wave[],
};

export default warriorTutorial;
