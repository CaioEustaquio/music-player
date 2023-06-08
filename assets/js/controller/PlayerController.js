class PlayerController{

    constructor(playerTemplateEl, tableEl, mobileGridEl, data){

        this._tableEl = document.getElementById(tableEl);
        this._mobileGridEl = document.getElementById(mobileGridEl);
        this._playerTemplateEl = document.getElementById(playerTemplateEl);
        this._playerEl = this._playerTemplateEl.querySelector('#player');
        this._data = data;
        this._interval;
        this._random = false;
        this._defaultVolume = 0.50;
        this._maxVolume = 1.0;

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

    get random(){
        return this._random;
    }
    set random(random){
        this._random = random;
    }

    get maxVolume(){
        return this._maxVolume;
    }
    set maxVolume(maxVolume){
        this._maxVolume = maxVolume;
    }
    get defaultVolume(){
        return this._defaultVolume;
    }
    set defaultVolume(defaultVolume){
        this._defaultVolume = defaultVolume;
    }

    init(){

        this.render().then(() =>{

            this.addPlayerEvents();
            this.addKeyboardEvents();
            this.updateTemplateData();
            this.updatePlayerData();
            this.initControls();
            this.addSongBarEvents();
            this.setVolume(this.getVolume());

        });

    }

    render(){

        return new Promise((resolve) =>{

            let tbody = this._tableEl.querySelector("tbody");

            this._data.forEach((music) => {
                
                let tr = document.createElement('tr');
                let div = document.createElement('div');

                tr.innerHTML = `
                <tr>
                    <td>${music.id}</td>
                    <td>${music.title}</td>
                    <td>${music.author}</td>
                    <td>${music.singer}</td>
                    <td>${music.duration}</td>
                </tr>`

                div.innerHTML = `
                <div class="song-grid-mobile">
                    <img class="mobile-song-icon" src="assets/images/${music.image}" alt="${music.title} disc">
                    <p class="pa">
                    ${music.title}
                    <br>
                    <span>${music.author}</span>
                    </p>
                </div>`

                tr.setAttribute('data-song', JSON.stringify(music));
                tr.setAttribute('data-id', music.id);
                
                div.setAttribute('data-song', JSON.stringify(music));
                div.setAttribute('data-id', music.id);

                this.addDesktopEvents(tr);
                this.addMobileEvents(div);

                tbody.append(tr);
                this._mobileGridEl.append(div);
            });

            let row;
            
            if(!this.getUserPreferences().lastSongPlaying){

                row = tbody.querySelector('tr');
            }else{

                row = tbody.querySelector(`tr[data-id="${this.getUserPreferences().lastSongPlaying}"]`);
            }

            this.setSelectedRow(row);
            resolve();

        }).catch(err =>{

            alert(err);
        });
    }

    getSelectedRow(){

        let lastSelected = document.querySelector("tr.song-playing");

        return lastSelected ? lastSelected : false;
    }

    setSelectedRow(el){

        this.setPhoto(JSON.parse(el.dataset.song).image);
        this.setDescription(JSON.parse(el.dataset.song).title, JSON.parse(el.dataset.song).author);
        this.setFile(JSON.parse(el.dataset.song).file);

        let lastPlayedSong = document.getElementsByClassName("song-playing");

        if(this.getSelectedRow()){

            [...lastPlayedSong].forEach((val) =>{

                val.classList.remove("song-playing");
            });
        }

        let song = document.querySelectorAll(`[data-id='${el.dataset.id}']`);

        [...song].forEach((val) =>{

            val.classList.add("song-playing");
        });

        this.setUserPreferences("lastSongPlaying", JSON.parse(el.dataset.song).id);
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

    addDesktopEvents(el){

        el.addEventListener("dblclick", (e) =>{
            
            this.setSelectedRow(el);
            this.play();
        });
    }    
    
    addMobileEvents(el){
        
        el.addEventListener("click", (e) =>{
            
            this.setSelectedRow(el);
            this.play();
        });
    }

    addPlayerEvents(){

        let volumeBar = this._playerTemplateEl.querySelector('.volume-bar');

        this.progressBar(volumeBar, this.maxVolume);

        this.playerEl.addEventListener('play', (e) =>{

            clearInterval(this._interval);
            this.setInterval();

            this._playerTemplateEl.querySelector('#btn-play-pause').classList.remove('fa-circle-play');
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.add('fa-circle-pause');
        });
        
        this.playerEl.addEventListener('pause', (e) =>{
            
            clearInterval(this._interval);
            
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.remove('fa-circle-pause');
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.add('fa-circle-play');
            this.updatePlayerData();
        });

        this.playerEl.addEventListener('loadedmetadata', (e) =>{

            this.setSongLenght();
            this.updatePlayerData();

        });
        
        
        this.playerEl.addEventListener('timeupdate', (e) =>{
            
            this.updatePlayerData();
        });
        
        this.playerEl.addEventListener('ended', (e) =>{
            
            if(!this.inLoop()){
                
                this.stepFoward();

            }
        });

        // this.playerEl.addEventListener('volumechange', (e) =>{

        //     console.log(this.getVolume());
        // });
    }

    addKeyboardEvents(){

        document.addEventListener("keydown", (e) =>{

            switch(e.code){
                
                case "Space":
                    e.preventDefault();
                    !this.isPaused() ? this.pause() : this.play();
                    break;
                default:null;
                    break;
                
            }
        });
    }

    addSongBarEvents(){

        let songBar = this._playerTemplateEl.querySelector('.song-progress-bar');

        this.playerEl.onloadeddata = () =>{

            this.progressBar(songBar, this.playerEl.duration);
        }
    }
    
    play(){
            
        this._playerEl.play();
        this.updatePlayerData();
    }

    pause(){

        this._playerEl.pause();
        this.updatePlayerData();
    }

    isPaused(){

        return this._playerEl.paused;
    }
    inLoop(){

        return (this._playerEl.loop || this.getUserPreferences().repeat ? true : false);
    }

    inRandom(){

        return (this._random || this.getUserPreferences().random ? true : false);
    }

    stepBackward(){

        if(parseInt(this.playerEl.currentTime) >= 3){

            this.restartSong();
        }else{

            if(this.inLoop()){

                this.setRepeat(false);
            }
            
            if(this.inRandom()){
                
                this.setRandomSong(false);
            }            

            if(this.getSelectedRow().previousSibling != null){

                let data = JSON.parse(this.getSelectedRow().previousSibling.dataset.song);

                this.setSelectedRow(this.getSelectedRow().previousSibling);
                
            }else{

                this.restartSong();
            }
            
            this.play();
        }
    }

    stepFoward(){

        if(this.inLoop()){

            this.setRepeat(false);
        }
        else if(this.inRandom()){

            this.randomSong();
        }

        else if(this.getSelectedRow().nextSibling != null){

            let data = JSON.parse(this.getSelectedRow().nextSibling.dataset.song);

            this.setSelectedRow(this.getSelectedRow().nextSibling);
            this.play();
        }
    }

    setRepeat(value){

        if(!value){
           
            this.playerEl.loop = false;
        }else{
            
            this.playerEl.loop = true;
            this._random = false;
            this.setUserPreferences("random", this._random);
        }
        
        this.setUserPreferences("repeat", value);
        this.updateTemplateData();
    }

    randomSong(){

        let rand = Math.floor(Math.random() * (this._data.length - 1 + 1)) + 1;
        let songRow = document.querySelector(`tr[data-id='${rand}']`);

        this.setSelectedRow(songRow);
        this.play();
    }
    
    setRandomSong(value){
        
        if(!value){
            
            this._random = false;

        }else{
            
            this._random = true;
            this.playerEl.loop = false;
            this.setUserPreferences("repeat", this.playerEl.loop);
        }

        this.setUserPreferences("random", value);
        this.updateTemplateData();
    }

    getVolume(){

        return (this.getUserPreferences().playerVolume ? this.getUserPreferences().playerVolume : this._defaultVolume);
    }

    setVolume(value){

        if(value <= 0){
            
            value = 0;
        }else if(value >= 1){
            
            value = this.maxVolume;
        }

        this.playerEl.volume = value;
        this.setUserPreferences('playerVolume', value);
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
            case 'play-pause':
                this.isPaused() ? this.play() : this.pause();
            break;
            case 'step-backward':
                this.stepBackward();
            break;
            case 'step-foward':
                this.stepFoward();
            break;
            case 'repeat-song':
                let repeat = this.inLoop() ? false : true;
                this.setRepeat(repeat);
            break;
            case 'random-song':
                let random = this.inRandom() ? false : true;
                this.setRandomSong(random);
            break;
        }
    }

    updatePlayerData(){

        this.updateProgress();

        let progressionBar = this._playerTemplateEl.querySelector('.song-progress');

        let songProgress = (this.playerEl.currentTime / this.playerEl.duration) * 100;
        let barWidth = progressionBar.parentElement.offsetWidth;

        progressionBar.style.width = ((songProgress * barWidth) / 100) + 'px';
    }

    updateTemplateData(){

        let volumeBar = this._playerTemplateEl.querySelector('.volume-progress');
        let btnRepeat = this._playerTemplateEl.querySelector('#btn-repeat-song');
        let btnRandom = this._playerTemplateEl.querySelector('#btn-random-song');

        let volumeProgress = (this.getVolume() / this._maxVolume) * 100;

        let barWidth = volumeBar.parentElement.offsetWidth;

        volumeBar.style.width = ((volumeProgress * barWidth) / 100) + 'px';

        if(this.inLoop()){

            btnRepeat.classList.add('active');
            btnRandom.classList.remove('active');
        }else{
            
            btnRepeat.classList.remove('active');
        }
        
        if(this.inRandom()){
            
            btnRandom.classList.add('active');
            btnRepeat.classList.remove('active');
        }else{
            
            btnRandom.classList.remove('active');
        }
    }

    setInterval(){

        this._interval = setInterval(() =>{

            this.updatePlayerData();

        }, 1000);
    }

    updateProgress(){

        let songProgression = this._playerTemplateEl.querySelector('#song-progression');

        let currentMinute = Utils.toMinutes(this.playerEl.currentTime);
        let currentSecond = Utils.toSeconds(currentMinute, this.playerEl.currentTime);

        songProgression.innerHTML = `${currentMinute}:${Utils.padTo2Digits(currentSecond)}`;
    }

    setSongLenght(){

        let songLenght = this._playerTemplateEl.querySelector('#song-lenght');

        let durationMinute = Utils.toMinutes(this.playerEl.duration);
        let durationSecond = Utils.toSeconds(durationMinute, this.playerEl.duration);

        songLenght.innerHTML = `${durationMinute}:${Utils.padTo2Digits(durationSecond)}`;
    }

    getUserPreferences(){

        let preferences = JSON.parse(localStorage.getItem('userPreferences'));

        if(!preferences){

            preferences = {};
        }else{

            preferences.playerVolume = parseFloat(preferences.playerVolume);
        }

        return preferences;
    }
    setUserPreferences(option, value){

        let preferences = this.getUserPreferences();
        
        switch(option){
            
            case 'lastSongPlaying':
                preferences.lastSongPlaying = value;
                break;
            case 'playerVolume':
                preferences.playerVolume = value;
                break;
            case 'random':
                preferences.random = value;
                break;
            case 'repeat':
                preferences.repeat = value;
                break;
        }
            
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    progressBar(el, maxValue){

        let barType = el.classList.contains('song-progress-bar') ? "song" : "volume";

        el.addEventListener('click', (e) =>{

            // barxAxis informs the width of the bar on the x-axis
            let barxAxis = ((e.layerX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth) * 100;

            // barProgress inform the current value of max
            let value = (barxAxis * maxValue) / 100;

            e.currentTarget.firstElementChild.style.width = (e.layerX - e.currentTarget.offsetLeft) + 'px';

            barType == "song" ? this.playerEl.currentTime = value : this.setVolume(value);
        });

        el.addEventListener('dragstart', (e) =>{

            e.dataTransfer.setDragImage(el, -99999, -99999);

            barType == "song" ? this.pause() : null;
        });

        el.addEventListener('drag', (e) =>{

            let barxAxis = ((e.layerX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth) * 100;
            let value = (barxAxis * maxValue) / 100;

            console.log(barxAxis);
            
            e.currentTarget.firstElementChild.style.width = (e.layerX - e.currentTarget.offsetLeft) + 'px';

            if(barType == "song"){

                this.playerEl.currentTime = value;
            }else{

                this.setVolume(value);
            }
        });

        el.addEventListener('dragend', (e) =>{

            let barxAxis = ((e.layerX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth) * 100;
            let value = (barxAxis * maxValue) / 100;
            
            e.currentTarget.firstElementChild.style.width = (e.layerX - e.currentTarget.offsetLeft) + 'px';

            if(barType == "song"){

                this.playerEl.currentTime = value;
                this.play();
            }else{

                this.setVolume(value);
            }
        });
    }
}