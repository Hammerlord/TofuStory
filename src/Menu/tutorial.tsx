import { snailMinion } from "../ability/minion";
import { bash, block, slam, slashBlast, warLeap } from "../ability/warrior/warriorAbilities";
import { Wave } from "../battle/types";
import { basicDummy, basicDummy2, ragingDummy, spikedDummy } from "../enemy/dummy";
import Icon from "../icon/Icon";
import { BlockImage, BrickImage, SlashBlastImage, SpikedMaceImage, WarLeapImage } from "../images";
import { CactusIcon } from "../images/icons";
import { Fury } from "../resource/ResourcesView";

const tutorial = {
    isTutorial: true,
    waves: [
        {
            description: [
                <>
                    Select your <Icon icon={SpikedMaceImage} />
                    <Icon icon={BrickImage} /> abilities, and use them to attack enemies.
                </>,
                "When you're out of moves, click End Turn to proceed.",
            ],
            enemies: [null, basicDummy, null, basicDummy, null],
            presetDeck: [bash, slam, bash],
        },
        {
            description: [
                <>
                    Target multiple enemies with area attacks like <Icon icon={SlashBlastImage} /> Slash Blast.
                </>,
            ],
            enemies: [null, basicDummy, basicDummy, basicDummy, null],
            presetDeck: [slashBlast, slashBlast, slashBlast],
        },
        {
            description: [
                <>
                    Abilities can have extra effects. War Leap <Icon icon={WarLeapImage} /> will stun an enemy so that they can't act next
                    turn.
                </>,
            ],
            enemies: [null, null, basicDummy, null, null],
            presetDeck: [warLeap, bash, bash],
        },
        {
            description: [
                <>
                    Use <Icon icon={BlockImage} /> Block on yourself to defend against attacks.
                </>,
                <>
                    Abilities often cost <Fury /> resources, shown by the numbered <Fury /> icon on each card.
                </>,
                <>
                    By default, you gain one <Fury /> per turn, so take care deciding how to spend your resources.
                </>,
            ],
            enemies: [basicDummy2, basicDummy2, basicDummy2, basicDummy2, basicDummy2],
            presetDeck: [block, block, block, slashBlast, slashBlast],
        },
        {
            description: [
                "Occasionally, you may acquire minions that can assist you in battle.",
                "Place the minion, then select it and use it to attack.",
            ],
            enemies: [null, null, basicDummy2, null, null],
            presetDeck: [snailMinion, snailMinion, snailMinion],
        },
        {
            description: [
                <>
                    This dummy has <Icon icon={CactusIcon} /> Thorns. Hover over the icon to see what it does.
                </>,
            ],
            enemies: [null, null, spikedDummy, null, null],
            presetDeck: [bash, slam, snailMinion, snailMinion],
        },
        {
            description: [
                "Defeat the Raging Dummy and its minions!",
                "Abilities are sent to your Cooldown pile after usage. They will be reusable after you draw all the cards in your deck.",
                "Minions only go to your Cooldown pile when they are destroyed.",
            ],
            enemies: [null, basicDummy, ragingDummy, basicDummy, null],
            presetDeck: [warLeap, slashBlast, slashBlast, slam, slam, block, block, block, bash, bash],
        },
    ] as Wave[],
};

export default tutorial;
