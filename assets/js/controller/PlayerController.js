class PlayerController{

    constructor(playerTemplateEl, tableEl, mobileGridEl, data){

        this.onsongchange = new Event('songchange');
        this.onprogress = new Event('progress');

        this._playerTemplateEl = document.getElementById(playerTemplateEl);
        this._tableEl = document.getElementById(tableEl);
        this._mobileGridEl = document.getElementById(mobileGridEl);
        this._data = data;
        this._playerEl = this._playerTemplateEl.querySelector('#player');
        this._songProgress = 0;
        this._discBanner = document.querySelector('#discBanner');
        this._progressBar = this._playerTemplateEl.querySelector('.song-bar-container');
        this._volumeBar = this._playerTemplateEl.querySelector('.volume-bar-container');
        this._volIcon = document.querySelector('#vol-icon');
        this._interval;
        this._random;
        this._defaultVolume = 0.50;
        this._maxVolume = 1.0;

        this.init();
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

    get data(){
        return this._data;
    }
    set data(data){
        this._data = data;
    }

    get playerEl(){
        return this._playerEl;
    }
    set playerEl(playerEl){
        this._playerEl = playerEl;
    }

    get songProgress(){
        return this._songProgress;
    }
    set songProgress(songProgress){
        this._songProgress = songProgress;
    }

    get discBanner(){
        return this._discBanner;
    }
    set discBanner(discBanner){
        this._discBanner = discBanner;
    }

    get progressBar(){
        return this._progressBar;
    }
    set progressBar(progressBar){
        this._progressBar = progressBar;
    }

    get volumeBar(){
        return this._volumeBar;
    }
    set volumeBar(volumeBar){
        this._volumeBar = volumeBar;
    }

    get volIcon(){
        return this._volIcon;
    }
    set volIcon(volIcon){
        this._volIcon = volIcon;
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

    get defaultVolume(){
        return this._defaultVolume;
    }
    set defaultVolume(defaultVolume){
        this._defaultVolume = defaultVolume;
    }

    get maxVolume(){
        return this._maxVolume;
    }
    set maxVolume(maxVolume){
        this._maxVolume = maxVolume;
    }

    init(){

        this.render().then(() =>{

            this.addPlayerEvents();
            this.addKeyboardEvents();
            this.updateTemplate();
            this.initControls();
            this.addSongBarEvents();
            this.setVolume(this.getVolume());

        });

        this.playerEl.addEventListener('songchange', (e) =>{

            if(this.getSelectedRow()){

                this._playerTemplateEl.style.display = 'flex';
                this._discBanner.style.display = 'block';
            }

        });

        this.playerEl.addEventListener('progress', (e) =>{

            let progress = (this.playerEl.currentTime / this.playerEl.duration) * 100;

            this._songProgress = parseInt(progress);
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
                    <td id="song" class="table-data-song">${music.id}</td>
                    <td id="title" class="table-data-title">${music.title}</td>
                    <td id="author" class="table-data-author">${music.author}</td>
                    <td id="singer" class="table-data-singer">${music.singer}</td>
                    <td id="duration" class="table-data-duration">${music.duration}</td>
                </tr>`

                div.innerHTML = `
                <div class="song-grid-mobile">
                    <img class="mobile-song-icon" src="assets/images/${music.image}" alt="${music.title} disc">
                    <div class="song-info">
                        <p class="song-name">
                            ${music.title}
                        </p>
                        <p class="song-author">
                            ${music.author}
                        </p>
                    </div>
                </div>`

                tr.dataset.id = music.id;
                tr.dataset.song = JSON.stringify(music);
                this.addDesktopEvents(tr);
                
                div.dataset.id = music.id;
                div.dataset.song = JSON.stringify(music);
                this.addMobileEvents(div);

                tbody.append(tr);
                this._mobileGridEl.append(div);
            });

            if(this.getUserPreferences().lastSongPlaying){

                this.setSelectedRow(tbody.querySelector(`tr[data-id="${this.getUserPreferences().lastSongPlaying}"]`));
            }

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

        let lastPlayedSong = document.querySelectorAll(".song-playing");

        if(this.getSelectedRow()){

            [...lastPlayedSong].forEach((val) =>{

                val.classList.remove("song-playing");
            });
        }

        let song = document.querySelectorAll(`[data-id='${el.dataset.id}']`);

        [...song].forEach((val) =>{

            val.classList.add("song-playing");
        });

        this.setSelectedSong(JSON.parse(el.dataset.song));
        this.setUserPreferences("lastSongPlaying", JSON.parse(el.dataset.song).id);
        this._playerEl.dispatchEvent(this.onsongchange);
    }

    setSelectedSong(song){

        this.setPhoto(song.image);
        this.setDescription(song.title, song.author);
        this.setFile(song.file);
    }
    
    setPhoto(file){
        
        this.discBanner.setAttribute('src', `./assets/images/${file}`);
    }
    
    setDescription(title, author){
        
        this.playerTemplateEl.querySelector('.song-description').innerHTML = `${title}<span>${author}</span>`;

    }

    setFile(file){

        this._playerEl.setAttribute('src', `./assets/music/${file}`);
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

        this.createProgressBar(volumeBar, this.maxVolume, true, true);

        this.playerEl.addEventListener('play', (e) =>{

            clearInterval(this._interval);
            this.startInterval();

            this._playerTemplateEl.querySelector('#btn-play-pause').classList.remove('fa-circle-play');
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.add('fa-circle-pause');
        });
        
        this.playerEl.addEventListener('pause', (e) =>{
            
            clearInterval(this._interval);
            
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.remove('fa-circle-pause');
            this._playerTemplateEl.querySelector('#btn-play-pause').classList.add('fa-circle-play');
        });

        this.playerEl.addEventListener('loadedmetadata', (e) =>{

            this.setSongLenght();
            this.updatePlayerData();

        });
        
        this.playerEl.addEventListener('timeupdate', (e) =>{

            this._playerEl.dispatchEvent(this.onprogress);
            this.updatePlayerData();
        });
        
        this.playerEl.addEventListener('ended', (e) =>{
            
            if(!this.inLoop()){
                
                this.stepFoward();

            }
        });

        this.playerEl.addEventListener('volumechange', (e) =>{

            this.changeVolIcon();
        });
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

        let progressBar = this._progressBar.querySelector('.song-progress-bar');

        this.playerEl.onloadeddata = () =>{

            this.createProgressBar(progressBar, this.playerEl.duration, true, true);
        }
    }
    
    play(){
            
        this._playerEl.play();
    }

    pause(){

        this._playerEl.pause();
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

                let previousSong = this.getSelectedRow().previousSibling;

                this.setSelectedRow(previousSong);
                
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

            let nextSong = this.getSelectedRow().nextSibling;

            this.setSelectedRow(nextSong);
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
        this.updateTemplate();
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
        this.updateTemplate();
    }

    getVolume(){

        let volume;

        if(this.getUserPreferences().playerVolume || this.getUserPreferences().playerVolume >= 0){

            volume = this.getUserPreferences().playerVolume;
        }else{

            volume = this._defaultVolume;
        }

        return volume;
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

        let controls = this._playerTemplateEl.querySelectorAll(".section-middle button");

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

        let songProgression = this._progressBar.querySelector('#song-progression');

        let currentMinute = Utils.toMinutes(this.playerEl.currentTime);
        let currentSecond = Utils.toSeconds(currentMinute, this.playerEl.currentTime);

        songProgression.innerHTML = `${currentMinute}:${Utils.padTo2Digits(currentSecond)}`;

        let progressBarElements = document.querySelectorAll("div.progress");

        progressBarElements.forEach((val) =>{

            let barWidth = val.parentElement.offsetWidth;
            val.style.width = ((this._songProgress * barWidth) / 100) + 'px';
        });
    }

    updateTemplate(){

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

    startInterval(){

        this._interval = setInterval(() =>{

            this.updatePlayerData();

        }, 1000);
    }

    setSongLenght(){

        let songLenght = this._progressBar.querySelector('#song-lenght');

        let durationMinute = Utils.toMinutes(this.playerEl.duration);
        let durationSecond = Utils.toSeconds(durationMinute, this.playerEl.duration);

        songLenght.innerHTML = `${durationMinute}:${Utils.padTo2Digits(durationSecond)}`;
    }

    getUserPreferences(){

        let preferences = JSON.parse(localStorage.getItem('userPreferences'));

        if(!preferences){

            preferences = {};
        }else{

            if(preferences.lastSongPlaying){

                this._playerEl.dispatchEvent(this.onsongchange);
            }

            preferences.playerVolume = preferences.playerVolume;
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

    createProgressBar(el, maxValue, clickEvent = false, dragEvent = false){

        let barType = el.classList.contains('song-progress-bar') ? "song" : "volume";

        if(clickEvent){

            el.addEventListener('click', (e) =>{
    
                // barxAxis inform the width of the bar on the x-axis
                let barxAxis = ((e.layerX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth) * 100;
    
                // barProgress inform the current value of max
                let value = (barxAxis * maxValue) / 100;
    
                e.currentTarget.firstElementChild.style.width = (e.layerX - e.currentTarget.offsetLeft) + 'px';
    
                barType == "song" ? this.playerEl.currentTime = value : this.setVolume(value);
            });
        }

        if(dragEvent){

            el.addEventListener('dragstart', (e) =>{
    
                e.dataTransfer.setDragImage(el, -99999, -99999);
    
                barType == "song" ? this.pause() : null;
            });
    
            el.addEventListener('drag', (e) =>{
    
                let barxAxis = ((e.layerX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth) * 100;
                let value = (barxAxis * maxValue) / 100;
    
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

    changeVolIcon(){

        if(this.getVolume() <= 0){

            this.volIcon.classList.add('fa-volume-xmark');
            this.volIcon.classList.remove('fa-volume-off');
            this.volIcon.classList.remove('fa-volume-low');
            this.volIcon.classList.remove('fa-volume-high');
            
        }else if(this.getVolume() > 0 && this.getVolume() <= 0.25){
            
            this.volIcon.classList.remove('fa-volume-xmark');
            this.volIcon.classList.add('fa-volume-off');
            this.volIcon.classList.remove('fa-volume-low');
            this.volIcon.classList.remove('fa-volume-high');
        }else if(this.getVolume() > 0.26 && this.getVolume() <= 0.7){

            this.volIcon.classList.remove('fa-volume-xmark');
            this.volIcon.classList.remove('fa-volume-off');
            this.volIcon.classList.add('fa-volume-low');
            this.volIcon.classList.remove('fa-volume-high');
        }else if(this.getVolume() > 0.71 && this.getVolume() <= 1.0){

            this.volIcon.classList.remove('fa-volume-xmark');
            this.volIcon.classList.remove('fa-volume-off');
            this.volIcon.classList.remove('fa-volume-low');
            this.volIcon.classList.add('fa-volume-high');
        }

    }
}