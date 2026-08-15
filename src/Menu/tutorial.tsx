import { defend, puppetAbility, shootAbility, volley } from "../ability/bowman/bowmanAbilities";
import { energyBolt, magicArmor, magicFang } from "../ability/magician/magicianAbilities";
import { block, cleave, slam } from "../ability/warrior/warriorAbilities";
import { Wave } from "../battle/types";
import { basicAoeDummyMagician, basicDummy, basicDummy2, spikedDummy } from "../enemy/dummy";
import Icon from "../icon/Icon";
import {
    AlchemistStoneImage,
    BlockImage,
    BlueRushImage,
    MagicArmorOldImage,
    OldEnergyBoltImage,
    SlashBlastImage,
    SpikedMaceImage,
} from "../images";
import { CactusIcon, ShieldIcon } from "../images/icons";
import { Fury, Mana, Stamina } from "../resource/ResourcesView";

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

export const bowmanTutorial: Tutorial = {
    isTutorial: true,
    disableItemRewards: true,
    waves: [
        {
            description: [
                <>
                    Select <Icon icon={shootAbility.image} /> {shootAbility.name}, and attack the dummy.
                </>,
                <>
                    Cards often cost <Stamina /> Stamina, limiting how many you can play per turn.
                </>,
            ],
            enemies: [null, null, { ...basicDummy, maxHP: 21 }, null, null],
            presetDeck: [shootAbility, shootAbility, shootAbility],
        },
        {
            description: [
                <>
                    Target multiple enemies with <Icon icon={volley.image} /> {volley.name}.
                </>,
            ],
            enemies: [{ ...basicDummy, maxHP: 12 }, null, { ...basicDummy, maxHP: 12 }, null, { ...basicDummy, maxHP: 12 }],
            presetDeck: [volley, volley, volley],
        },
        {
            description: [
                <>
                    Use <Icon icon={defend.image} /> {defend.name} to defend against attacks.
                </>,
                <>
                    Unused <Icon icon={ShieldIcon} /> Armor will decay by half every turn.
                </>,
            ],
            enemies: [basicAoeDummyMagician, basicAoeDummyMagician, basicDummy2, basicAoeDummyMagician, basicAoeDummyMagician],
            presetDeck: [defend, defend],
            winCondition: {
                surviveRounds: 1,
            },
        },
        {
            description: [
                <>
                    The Bowman also has <Icon icon={puppetAbility.image} /> {puppetAbility.name}, a summoned minion that absorbs attacks for
                    you.
                </>,
                <>Select and place it in one of the 4 available minion slots.</>,
            ],
            enemies: [basicAoeDummyMagician, basicAoeDummyMagician, basicDummy2, basicAoeDummyMagician, basicAoeDummyMagician],
            presetDeck: [puppetAbility],
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
            presetDeck: [shootAbility, shootAbility, defend],
        },
    ] as Wave[],
};
