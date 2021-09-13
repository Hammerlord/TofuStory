const lithEventsNoob = [
    {
        dialog: ["Hey, hey, hey! Look at that mushroom with the weird cap. It's gotta be a rare mob, right?"],
    },
    {
        dialog: ["Uh... it looks scary. Do you think we should fight it?"],
    },
    {
        dialog: [
            "If we beat it and it drops something good, we can get rich. What if it drops Ilbis?",
            "Come on! [The beginner moves to jab you with his stick.]",
        ],
    },
    {
        dialog: ["But we already have such a hard time with the orange ones..."],
        responses: ["Fight the beginners.", "Run away."],
    },
];

const lithEventsNoob2 = [
    {
        dialog: ["Uh oh... It's too strong. Run!", "[The beginners flee.]"],
        responses: ["Chase them!"],
    },
    {
        dialog: ["WTF? It chased us through the portal!"],
    },
    {
        dialog: ["WTF? Monsters aren't supposed to do that!", "[The beginners sprint off. One of them dropped something...]"],
        items: [
            {
                name: "Potion",
                HP: 5,
            },
        ],
    },
];

const lithEventsKim = [
    {
        dialog: [
            "Ahh! A monster!",
            "I knew I should have hired an adventurer, but every last one of them says they 'hate escort quests'!",
            "Well, I can't help that I'm a merchant in need of escorting! If I could dash and jump around like those youngsters, I wouldn't need to hire anyone, now would I?",
            "...Wait, you want to trade? Please tell me you want to trade, Mr., um, Mushroom sir.",
        ],
        responses: ["'Trade' with Mr. Kim.", "Leave"],
    },
];
