const data = [
    {
        id: 1,
        title:"Piano Forte Scandal",
        author: "Oster Project",
        singer: "MEIKO",
        duration: "3:57",
        image: "piano-forte-scandal.png",
        file: "piano-forte-scandal.mpeg"
    },
    {
        id: 2,
        title:"Narisumashi Gengar",
        author: "Kulfi Q",
        singer: "Hatsune Miku | Kagamine Rin",
        duration: "3:51",
        image: "narisumashi-gengar.jpg",
        file: "narisumashi-gengar.mp3"
    },
    {
        id: 3,
        title:"Two Breaths Walking",
        author: "Deco*27",
        singer: "Hatsune Miku",
        duration: "3:57",
        image: "two-breaths-walking.png",
        file: "two-breaths-walking.mp3"
    },
    {
        id: 4,
        title:"Ashita wo Narase",
        author: "Shishido Yuuna",
        singer: "Shishido Yuuna",
        duration: "3:24",
        image: "ashita-wo-narase.png",
        file: "ashita-wo-narase.mp3"
    },
    {
        id: 5,
        title:"Peace Sign",
        author: "Kenshi Yonezu",
        singer: "Kenshi Yonezu",
        duration: "4:02",
        image: "peace-sign.png",
        file: "peace-sign.mp3"
    }
]

let controller = new PlayerController('player', 'player-container', 'table-grid', 'grid-mobile', data);