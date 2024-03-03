import { energyBolt, magicArmor, magicClaw, magicFang, manaGem } from "../ability/magician/magicianAbilities";
import { block, slam, slashBlast } from "../ability/warrior/warriorAbilities";
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

export const warriorTutorial = {
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

export const magicianTutorial = {
    isTutorial: true,
    waves: [
        {
            description: [
                <>
                    Select <Icon icon={MagicClawImage} /> Magic Claw, and attack the dummy.
                </>,
                <>
                    Cards often cost <Mana /> Mana, limiting how many you can play per turn.
                </>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 22 }, null],
            presetDeck: [magicClaw, magicClaw],
        },
        {
            description: [
                <>
                    Target multiple enemies with <Icon icon={BlueRushImage} /> Magic Fang.
                </>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 11 }, null, { ...basicDummy, maxHP: 11 }, null],
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
            presetDeck: [magicArmor, magicArmor, magicArmor, magicFang, magicFang],
        },
        {
            description: [
                <>
                    This dummy has <Icon icon={CactusIcon} /> Thorns. Hover over it for more info.
                </>,
                <>These effects can be dangerous, so try to pay attention to them.</>,
            ],
            enemies: [null, null, spikedDummy, null, null],
            presetDeck: [magicClaw, magicArmor, manaGem],
        },
        {
            description: [
                <>
                    Magicians gain <Icon icon={AlchemistStoneImage} /> Charged when they play a card.
                </>,
                <>
                    <Icon icon={MagicClawImage} /> Magic Claw and <Icon icon={BlueRushImage} /> Magic Fang can consume{" "}
                    <Icon icon={AlchemistStoneImage} /> to do bonus damage.
                </>,
                <>
                    If <Icon icon={AlchemistStoneImage} /> is unused by end of turn, it'll shoot <Icon icon={OldEnergyBoltImage} /> Energy
                    Bolt at a random enemy.
                </>,
                <>Try playing a combination of cards to see how this works.</>,
            ],
            enemies: [null, { ...basicDummy, maxHP: 7 }, { ...basicDummy, maxHP: 24 }, { ...basicDummy, maxHP: 7 }, null],
            presetDeck: [magicClaw, magicFang, energyBolt],
        },
    ] as Wave[],
};

export default warriorTutorial;
