const data = [
    {
        id: 1,
        title:"Dramaturgy",
        author: "Eve",
        singer: "Eve",
        duration: "4:05",
        image: "dramaturgy.jpeg",
        file: "dramaturgy.mp3"
    },
    {
        id: 2,
        title:"Piano Forte Scandal",
        author: "OSTER Project",
        singer: "Meiko",
        duration: "3:57",
        image: "piano-forte-scandal.png",
        file: "piano-forte-scandal.mp3"
    },
    {
        id: 3,
        title:"Two Breaths Walking",
        author: "Deco*27",
        singer: "Hatsune Miku",
        duration: "3:07",
        image: "two-breaths-walking.png",
        file: "two-breaths-walking.mp3"
    },
    {
        id: 4,
        title:"Narisumashi Genga",
        author: "KulfiQ",
        singer: "Hatsune Miku | Kagamine Rin",
        duration: "3:51",
        image: "narisumashi-gengar.jpg",
        file: "narisumashi-gengar.mp3"
    },
    {
        id: 5,
        title:"Ashita wo Narase",
        author: "Shishido Yuuna",
        singer: "Shishido Yuuna",
        duration: "3:24",
        image: "ashita-wo-narase.png",
        file: "ashita-wo-narase.mp3"
    },
    {
        id: 6,
        title:"Peace Sign",
        author: "Kenshi Yonezu",
        singer: "Kenshi Yonezu",
        duration: "4:02",
        image: "peace-sign.png",
        file: "peace-sign.mp3"
    },
    {
        id: 7,
        title:"Blue Boi",
        author: "LAKEY INSPIRED",
        singer: "",
        duration: "1:46",
        image: "blue-boi.jpg",
        file: "blue-boi.mp3"
    },    
    {
        id: 8,
        title:"Feel Good Inc",
        author: "Gorillaz",
        singer: "Gorillaz",
        duration: "3:42",
        image: "feel-good-inc.jpg",
        file: "feel-good-inc.mp3"
    },
    {
        id: 9,
        title:"Tim Henson VS Ichika Nito",
        author: "",
        singer: "",
        duration: "1:39",
        image: "tim-henson-vs-ichika-nito.png",
        file: "tim-henson-vs-ichika-nito.mp3"
    },
    {
        id: 10,
        title:"Sweet Devil",
        author: "Hachioji P",
        singer: "Hatsune Miku",
        duration: "3:59",
        image: "sweet-devil.jpg",
        file: "sweet-devil.mp3"
    },
    {
        id: 11,
        title:"Blood Circulator",
        author: "ASIAN KUNG FU GENERATION",
        singer: "ASIAN KUNG FU GENERATION",
        duration: "3:51",
        image: "blood-circulator.jpg",
        file: "blood-circulator.mp3"
    },
    {
        id: 12,
        title:"Re:Re: (Single ver.)",
        author: "ASIAN KUNG FU GENERATION",
        singer: "ASIAN KUNG FU GENERATION",
        duration: "5:32",
        image: "re-re-single-version.jpg",
        file: "re-re-single-version.mp3"
    },
    {
        id: 13,
        title:"The Rock City Boy",
        author: "JAMIL",
        singer: "JAMIL",
        duration: "3:37",
        image: "the-rock-city-boy.jpg",
        file: "the-rock-city-boy.mp3"
    },
    {
        id: 14,
        title:"Long Way From Home (Zentaro's Theme)",
        author: "Michael Staple",
        singer: "",
        duration: "2:00",
        image: "long-way-from-home-zentaro-theme.png",
        file: "long-way-from-home-zentaro-theme.mp3"
    },
]

let controller = new PlayerController('player-container', 'table-grid', 'grid-mobile', data);