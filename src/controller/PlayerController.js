import {Fetch} from "./../utils/Fetch.js";
import {Functions} from "./../utils/Functions.js";

export class PlayerController{

  constructor(){

    // capturingelements
    this._tableBodyEl = document.querySelector("#desktop-songs-table tbody");
    this._playerContainerEl = document.querySelector("#desktop-player-controls");
    this._songThumbnailEl = document.querySelector("img#song-thumbnail");
    this._songTitleEl = document.querySelector("h2#song-title");
    this._songAuthorEl = document.querySelector("h2#song-author");
    this._songCurrentTimeEl = document.querySelector("p span#current-time");
    this._songDurationEl = document.querySelector("p span#total-time");
    this._songProgressBarEl = document.querySelector("progress#desktop-progress-bar");
    this._playBtnEl = document.querySelector("#play-btn")
    this._pauseBtnEl = document.querySelector("#pause-btn")
    this._skipBackBtnEl = document.querySelector("#skip-back-btn")
    this._skipForwardBtnEl = document.querySelector("#skip-forward-btn")
    this._setShuffleBtnEl = document.querySelector("button#shuffle-btn");
    this._setLoopBtnEl = document.querySelector("button#repeat-btn");
    this._audioEl = document.querySelector("#song-audio");
    
    this._songsData;
    this._currentSongPlaying;
    this._playerInterval;
    this._songPlayerInShuffle = false;

    this.init();
  }

  get songsData(){
    return this._songsData;
  }
  set songsData(songsData){
    this._songsData = songsData;
    return this;
  }

  get currentSongPlaying(){
    return this._currentSongPlaying;
  }
  set currentSongPlaying(currentSongPlaying){
    this._currentSongPlaying = currentSongPlaying;
    return this;
  }

  get playerInterval(){
    return this._playerInterval;
  }
  set playerInterval(playerInterval){
    this._playerInterval = playerInterval;
    return this;
  }

  get songPlayerInShuffle(){
    return this._songPlayerInShuffle;
  }
  set songPlayerInShuffle(songPlayerInShuffle){
    this._songPlayerInShuffle = songPlayerInShuffle;
    return this;
  }

  async init(){

    const songs = await this.getSongs();
    this.songsData = songs;

    this.render();
    this.addGridEvents();
    this.addPlayerEvents();
    this.addKeyboardEvents();
  }

  render(){

    // rendering songs on table

    // counter
    let orderCounter = 1;

    this.songsData.map(song =>{

      let trContent = `
        <tr data-id="${song.id}" class="data-row">
          <td>${orderCounter}</td>
          <td>${song.title}</td>
          <td>${song.author}</td>
          <td>${song.singer}</td>
          <td>${song.duration}</td>
        </tr>
      `;
      this._tableBodyEl.innerHTML += trContent;
      orderCounter++;
    });
  }

  addGridEvents(){

    // rows events
    [...document.querySelectorAll("tr.data-row")].map(row =>{

      // clone and replace the element to remove all listeners 
      const clonedRow = row.cloneNode(true);
      row.replaceWith(clonedRow);

      // validate user screen, if mobile add click else dblclick
      if(window.matchMedia('(max-width: 450px)').matches){
        
        clonedRow.addEventListener('click', () =>{
          this.setSelectedSong(row.dataset.id);
          this.startSong();
        });
      }else{
        clonedRow.addEventListener('dblclick', (e) =>{

          this.setSelectedSong(row.dataset.id);
          this.startSong();
        });
      }
    });
  }

  addPlayerEvents(){

    this._audioEl.addEventListener("play", () =>{

      this.togglePlayerVisible(true);

      this.changeSongStateIcon();
      this.clearPlayerInterval();
      this.setPlayerInterval();
    });

    this._audioEl.addEventListener("pause", () =>{

      this.changeSongStateIcon();
      this.clearPlayerInterval();
    });

    this._audioEl.addEventListener("emptied", () =>{
      this.setSongProgress(0, "0:00");
    });

    this._audioEl.addEventListener("ended", () =>{
      this.skipForward();
    });

    this._playBtnEl.addEventListener("click", () =>{
      this.play();
    });

    this._pauseBtnEl.addEventListener("click", () =>{
      this.pause();
    });

    this._skipBackBtnEl.addEventListener("click", () =>{
      this.skipBackward();
    });

    this._skipForwardBtnEl.addEventListener("click", () =>{
      this.skipForward();
    });

    this._setShuffleBtnEl.addEventListener("click", () =>{

      if(this.songPlayerInShuffle){
        this.toggleShuffle(false);
      }else{
        this.toggleShuffle(true);
      }
    });
    
    this._setLoopBtnEl.addEventListener("click", () =>{

      if(this._audioEl.loop){
        this.toggleLoop(false);
      }else{
        this.toggleLoop(true);
      }
    });
  }

  addKeyboardEvents(){
    
    document.addEventListener("keypress", (e) =>{

      e.preventDefault();

      switch(e.code){

        case("Space"):
          if(this.hasSelectedSong()) this.isPaused() ? this.play() : this.pause();
          break;
        default:
          break;
      }

    });
  }

  async getSongs(){

    try{

      const songs = await Fetch.get("data.json");

      return songs;

    }catch(error){
      return [];
    };
  }

  play(){
    this._audioEl.play();
  }

  pause(){
    this._audioEl.pause();
  }

  skipBackward(){
    let index = this.songsData.findIndex(song => song.id === this.currentSongPlaying) - 1;
    index = index < 0 ? 0 : index;
    const {id} = this.songsData[index];

    this.setSelectedSong(id);
    this.startSong();
  }

  skipForward(){
    
    let index = this.songsData.findIndex(song => song.id === this.currentSongPlaying) + 1;
    index = index > this.songsData.length ? this.songsData.length : index;

    const {id} = this.songsData[index];

    if(!this.itInLoop()){
      this.setSelectedSong(id);
    }

    this.startSong();
  }

  startSong(){
    this.preparePlayerData();
    this.play();
  }

  getSelectedSong(){
    return this.songsData.find(song => song.id === this.currentSongPlaying);
  }

  setSelectedSong(songId){
    this.applySelectedStyle(songId)
    this.currentSongPlaying = songId;
  }

  applySelectedStyle(songId){

    [...this._tableBodyEl.querySelectorAll(`tr.song-playing`)].map(el =>{
      el.classList.remove("song-playing");
    });

    this._tableBodyEl.querySelector(`tr[data-id="${songId}"]`).classList.add("song-playing")
  }

  togglePlayerVisible(value){

    if(value){
      this._playerContainerEl.classList.add("active");
    }else{
      this._playerContainerEl.classList.remove("active");
    }

    this.changeSongStateIcon()
  }

  preparePlayerData(){
    this._songThumbnailEl.src = this.getSelectedSong().image;
    this._songTitleEl.innerText = this.getSelectedSong().title;
    this._songAuthorEl.innerText = this.getSelectedSong().author;
    this._songDurationEl.innerText = this.getSelectedSong().duration;
    this._audioEl.src = this.getSelectedSong().file;
  }

  updateSongProgressUi(){

    let {
      progress,
      currentTime
    } = this.getSongProgress();

    console.log(progress);

    this._songCurrentTimeEl.innerText = currentTime;
    this._songProgressBarEl.value = progress;
  }

  getSongProgress(){

    let minutes = Functions.toMinutes(this._audioEl.currentTime);
    let seconds = Functions.toSeconds(minutes, this._audioEl.currentTime);
    let formatedCurrentTime = `${minutes}:${Functions.padTo2Digits(seconds)}`

    return {
      progress: ((this._audioEl.currentTime / this._audioEl.duration) * 100),
      currentTime: formatedCurrentTime
    };
  }

  setSongProgress(progress, time){

    this._songCurrentTimeEl.innerText = time;
    this._songProgressBarEl.value = progress;
  }

  setPlayerInterval(){

    this._playerInterval = setInterval(() =>{

      this.updateSongProgressUi();
    }, 1000);
  }

  clearPlayerInterval(){
    clearInterval(this._playerInterval);
  }

  toggleLoop(boolean){

    if(boolean){
      this._audioEl.loop = true;
      this._setLoopBtnEl.classList.add("active");
      this.toggleShuffle(false);
    }else{
      this._audioEl.loop = false;
      this._setLoopBtnEl.classList.remove("active");
    }
  }
  
  toggleShuffle(boolean){
    
    if(boolean){
      this.songPlayerInShuffle = true;
      this._setShuffleBtnEl.classList.add("active");
      this.toggleLoop(false);
    }else{
      this.songPlayerInShuffle = false;
      this._setShuffleBtnEl.classList.remove("active");
    }
  }

  isPaused(){
    return this._audioEl.paused;
  }

  changeSongStateIcon(){

    if(this.isPaused()){
      this._pauseBtnEl.style.display = "none";
      this._playBtnEl.style.display = "block";
    }else{
      this._playBtnEl.style.display = "none";
      this._pauseBtnEl.style.display = "block";
    }
  }

  hasSelectedSong(){
    return this.currentSongPlaying ? true : false
  }

  itInLoop(){
    return this._audioEl.loop;
  }
}