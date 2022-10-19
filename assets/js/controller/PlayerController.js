class PlayerController{

    constructor(playerEl, playerTemplateEl, tableEl, mobileGridEl, data){

        this._playerEl = document.getElementById(playerEl);
        this._playerTemplateEl = document.getElementById(playerTemplateEl);
        this._tableEl = document.getElementById(tableEl);
        this._mobileGridEl = document.getElementById(mobileGridEl);
        this._data = data;
        this._interval;

        this.init();
    }

    get playerEl(){
        return this._playerEl;
    }
    set playerEl(playerEl){
        this._playerEl = playerEl;
    }

    get playerTemplateEl(){
        return this._playerTemplateEl;
    }
    set playerTemplateEl(playerTemplateEl){
        this._playerTemplateEl = playerTemplateEl;
    }    

    get tableEl(){
        return this._tableEl;
    }
    set tableEl(tableEl){
        this._tableEl = tableEl;
    }

    get mobileGridEl(){
        return this._mobileGridEl;
    }
    set mobileGridEl(mobileGridEl){
        this._mobileGridEl = mobileGridEl;
    }

    get interval(){
        return this._interval;
    }
    set interval(interval){
        this._interval = interval;
    } 

    init(){

        this.render().then(() =>{

            this.addPlayerEvents();
        });

        this.playerUpdate();
        // this.preparePlayer();
        this.initControls();
    }

    render(){

        return new Promise((resolve, reject) =>{

            let tbody = this._tableEl.querySelector("tbody");

            this._data.forEach((music) => {
                
                let tr = document.createElement('tr');
                let div = document.createElement('div');

                tr.innerHTML = `
                <tr class="data-row">
                    <td>${music.id}</td>
                    <td>${music.title}</td>
                    <td>${music.author}</td>
                    <td>${music.singer}</td>
                    <td>${music.duration}</td>
                </tr>`

                div.innerHTML = `
                <div class="song-grid-mobile data-row">
                    <img class="mobile-song-icon" src="assets/images/${music.image}" alt="">
                    <p class="pa">
                    ${music.title}
                    <br>
                    <span>${music.author}</span>
                    </p>
                </div>`

                tr.setAttribute('data-song', JSON.stringify(music));
                tr.classList.add('data-row');
                div.setAttribute('data-song', JSON.stringify(music));
                div.classList.add('data-row')
                
                this.addEvents(tr);
                this.addEvents(div);

                this.addDesktopEvents(tr);
                this.addMobileEvents(div);

                tbody.append(tr);
                this._mobileGridEl.append(div);
            });

            let firstRow = document.querySelector('tr.data-row');

            this.setPhoto(JSON.parse(firstRow.dataset.song).image);
            this.setDescription(JSON.parse(firstRow.dataset.song).title, JSON.parse(firstRow.dataset.song).author);
            this.setFile(JSON.parse(firstRow.dataset.song).file);

            this.setSelectedRow(firstRow);

            resolve();
        });

    }

    getSelectedRow(){

        let lastSelected = document.querySelector("tr.song-selected");

        return lastSelected ? lastSelected : false;
    }

    setSelectedRow(el){
        
        let lastSelected = document.getElementsByClassName("song-selected");


        if(this.getSelectedRow()){

            [...lastSelected].forEach((val) =>{

                val.classList.remove("song-selected");
            });
        }

        let songSelected = document.querySelectorAll(`[data-song='${el.dataset.song}']`);

        [...songSelected].forEach((val) =>{

            val.classList.add("song-selected");
        });
    }
    
    setPhoto(file){
        
        let songPhoto = document.querySelector("#discBanner");

        discBanner.setAttribute('src', `assets/images/${file}`);
    }
    
    setDescription(title, author){
        
        let songDescription = document.querySelectorAll('.songDescription');
        
        [...songDescription].forEach((el) =>{

            el.innerHTML = `${title}<br><span>${author}</span>`;
        });

    }

    setFile(file){

        this._playerEl.setAttribute('src', `assets/music/${file}`);
    }

    addEvents(el){

        el.addEventListener('click', (e) =>{

            this.setSelectedRow(el);
        });
    }

    addDesktopEvents(el){

        el.addEventListener("dblclick", (e) =>{

            let data = JSON.parse(el.dataset.song);

            this.setPhoto(data.image);
            this.setDescription(data.title, data.author);
            this.setFile(data.file);
            
            this.play();
            
        });
    }    
    
    addMobileEvents(el){

        el.addEventListener("click", (e) =>{

            let data = JSON.parse(el.dataset.song);
            
            this.setPhoto(data.image);
            this.setDescription(data.title, data.author);
            this.setFile(data.file);
            
            this.play();
        });
    }

    addPlayerEvents(){

        this.playerEl.addEventListener('play', (e) =>{

            clearInterval(this._interval);

            this._interval = setInterval(() =>{

                this.playerUpdate();

            }, 1000);

            this._playerTemplateEl.querySelector('#btn-pause').style.display = 'inline-block';     
            this._playerTemplateEl.querySelector('#btn-play').style.display = 'none';
        });

        this.playerEl.addEventListener('pause', (e) =>{

            clearInterval(this._interval);

            this._playerTemplateEl.querySelector('#btn-play').style.display = 'inline-block';
            this._playerTemplateEl.querySelector('#btn-pause').style.display = 'none';
        });

        this.playerEl.addEventListener('loadedmetadata', (e) =>{


            let songLenght = this._playerTemplateEl.querySelector('#song-lenght');

            let durationMinute = Utils.toMinutes(this.playerEl.duration);
            let durationSecond = Utils.toSeconds(durationMinute, this.playerEl.duration);
    
            songLenght.innerHTML = `${durationMinute}:${Utils.padTo2Digits(durationSecond)}`;

            this.playerUpdate();
        });
        
        
        this.playerEl.addEventListener('timeupdate', (e) =>{
            
            this.playerUpdate();
        });
    }
    
    play(){
            
        this._playerEl.play();
        this.playerUpdate();
    }

    pause(){

        this._playerEl.pause();
        this.playerUpdate();
    }

    isPaused(){

        return this._playerEl.paused;
    }
    inLoop(){

        return this._playerEl.loop;
    }

    stepBackward(){

        if(parseInt(this.playerEl.currentTime) >= 3){

            this.restartSong();
        }else{

            if(this.getSelectedRow().previousSibling != null){

                let data = JSON.parse(this.getSelectedRow().previousSibling.dataset.song);

                this.setPhoto(data.image);
                this.setDescription(data.title, data.author);
                this.setFile(data.file);
                this.setSelectedRow(this.getSelectedRow().previousSibling);
                
            }else{
                this.restartSong();
            }
            
            this.play();
        }
    }
    stepFoward(){

        if(this.getSelectedRow().nextSibling != null){

            let data = JSON.parse(this.getSelectedRow().nextSibling.dataset.song);

            this.setPhoto(data.image);
            this.setDescription(data.title, data.author);
            this.setFile(data.file);
            this.setSelectedRow(this.getSelectedRow().nextSibling);

            this.play();
        }

    }

    enableRepeat(){

        console.log(this)

    }

    restartSong(){
        this.playerEl.currentTime = 0;
    }

    initControls(){

        let controls = this._playerTemplateEl.querySelectorAll(".section-middle a");

        [...controls].forEach((button) =>{

            button.addEventListener('click', (e) =>{

                let commandName = e.target.id.replace("btn-", "");

                this.controlExecution(commandName);
            });

        });
    }

    controlExecution(command){

        switch(command){
            case 'play':
                this.play();
            break;
            case 'pause':
                this.pause();
            break;
            case 'step-backward':
                this.stepBackward();
            break;
            case 'step-foward':
                this.stepFoward();
            break;
            case 'repeat-song':
                this.enableRepeat();
            break;
            case 'random-song':
                this.randomSong();
            break;
        }
    }

    playerUpdate(){

        let songProgression = this._playerTemplateEl.querySelector('#song-progression');

        let currentMinute = Utils.toMinutes(this.playerEl.currentTime);
        let currentSecond = Utils.toSeconds(currentMinute, this.playerEl.currentTime);

        songProgression.innerHTML = `${currentMinute}:${Utils.padTo2Digits(currentSecond)}`;

        // let progressionBar = this._playerTemplateEl.querySelector('.song-progress');

    }
}