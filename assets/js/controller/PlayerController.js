class PlayerController{

    constructor(playerEl, tableEl, data){

        this._playerEl = document.getElementById(playerEl);
        this._tableEl = document.getElementById(tableEl);
        this._data = data;

        this.init();
    }

    get playerEl(){
        return this._playerEl;
    }
    set playerEl(playerEl){
        this._playerEl = playerEl;
    }

    get tableEl(){
        return this._tableEl;
    }
    set tableEl(tableEl){
        this._tableEl = tableEl;
    }

    init(){

        let tbody = this._tableEl.querySelector("tbody");

        this._data.forEach((music) => {
            
            let tr = document.createElement('tr');

            tr.innerHTML = `
            <tr>
                <td>${music.id}</td>
                <td>${music.title}</td>
                <td>${music.author}</td>
                <td>${music.singer}</td>
                <td>${music.duration}</td>
            </tr>`

            tr.setAttribute('data-music', JSON.stringify(data));

            tr.addEventListener('click', (e) =>{

                let lastSelected = tbody.querySelector("tr.song-selected");

                if(lastSelected){

                    lastSelected.classList.remove('song-selected');
                }

                tr.classList.add('song-selected');
            });

            tr.addEventListener('dblclick', (e) =>{

                let discBanner = document.querySelector("#discBanner"),
                    songTitle = document.querySelector("#songTitle"),
                    authorName = document.querySelector("#authorName");

                this._playerEl.setAttribute('src', `assets/music/${music.file}`);
                discBanner.setAttribute('src', `assets/images/${music.image}`);
                songTitle.innerHTML = music.title;
                authorName.innerHTML = music.author;

                this._playerEl.play();

            });            

            tbody.append(tr);
        });


    }
}