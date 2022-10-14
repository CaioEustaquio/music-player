class PlayerController{

    constructor(playerEl, tableEl, mobileGridEl, data){

        this._playerEl = document.getElementById(playerEl);
        this._tableEl = document.getElementById(tableEl);
        this._mobileGridEl = document.getElementById(mobileGridEl);
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

    get tableEl(){
        return this._mobileGridEl;
    }
    set tableEl(mobileGridEl){
        this._mobileGridEl = mobileGridEl;
    }    

    init(){

        this.render();
        this.renderMobile();

    }
    render(){

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
                    songDescription = document.querySelector('.songDescription');

                this._playerEl.setAttribute('src', `assets/music/${music.file}`);
                discBanner.setAttribute('src', `assets/images/${music.image}`);
                songDescription.innerHTML = `${music.title}<br>${music.author}`;

                this._playerEl.play();

            });            

            tbody.append(tr);
        });
    }
    renderMobile(){

        this._data.forEach((music) => {

            let div = document.createElement('div');

            div.innerHTML = `
            <div class="song-grid-mobile">
                <img class="mobile-song-icon" src="assets/images/${music.image}" alt="">
                <p class="pa songDescription">
                ${music.title}
                <br>
                ${music.author}
                </p>
            </div>`

            div.setAttribute('data-music', JSON.stringify(data));

            div.addEventListener('click', (e) =>{

                let lastSelected = this._mobileGridEl.querySelector("div.song-selected");

                if(lastSelected){

                    lastSelected.classList.remove('song-selected');
                }

                div.classList.add('song-selected');                

                let discBanner = document.querySelector("#discBanner"),
                    songDescription = document.querySelector('.songDescription');

                this._playerEl.setAttribute('src', `assets/music/${music.file}`);
                discBanner.setAttribute('src', `assets/images/${music.image}`);
                songDescription.innerHTML = `${music.title}<br>${music.author}`;

                if(this.isPlaying()){
                    this._playerEl.pause();
                }else{

                    this._playerEl.play();
                }
            });            

            this._mobileGridEl.append(div);
            
        });
    }

    isPlaying(){
        return !this._playerEl.paused ? true : false;
    }

}