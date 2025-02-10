import {Functions} from "../utils/Functions.js";
import { ProgressBarController } from "./ProgressBarController.js";

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
    this._playBtnEl = document.querySelector("#play-btn");
    this._pauseBtnEl = document.querySelector("#pause-btn");
    this._skipBackBtnEl = document.querySelector("#skip-back-btn");
    this._skipForwardBtnEl = document.querySelector("#skip-forward-btn");
    this._setShuffleBtnEl = document.querySelector("button#shuffle-btn");
    this._setLoopBtnEl = document.querySelector("button#repeat-btn");
    this._audioEl = document.querySelector("#song-audio");
    this._volumeProgressBarEl = document.querySelector("progress#desktop-volume-progress-bar");
    
    this._songsData;
    this._currentSongPlaying;
    this._playerInterval;
    this._songPlayerInShuffle = false;
    this._lastRandomSong;
    this._mainSongProgressBar = new ProgressBarController(this._songProgressBarEl, true);
    this._mainVolumeProgressBar = new ProgressBarController(this._volumeProgressBarEl, true);

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

  get lastRandomSong(){
    return this._lastRandomSong;
  }
  set lastRandomSong(lastRandomSong){
    this._lastRandomSong = lastRandomSong;
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

  // rendering songs on table
  render(){

    // counter
    let orderCounter = 1;

    this.songsData.map(song =>{

      let trContent = `
        <tr data-id="${song.id}" class="data-row">
          <td><div class="data-cell">${orderCounter}</div></td>
          <td><div class="data-cell" title="${song.title}">${song.title}</div></td>
          <td><div class="data-cell" title="${song.author}">${song.author}</div></td>
          <td><div class="data-cell" title="${song.singer}">${song.singer}</div></td>
          <td><div class="data-cell" title="${song.duration}">${song.duration}</div></td>
        </tr>
      `;
      this._tableBodyEl.innerHTML += trContent;
      orderCounter++;
    });
  }

  addGridEvents(){
    // rows events
    [...document.querySelectorAll("tr.data-row")].map(row =>{

        row.addEventListener('dblclick', (e) =>{
          this.setSelectedSong(row.dataset.id);
          this.startSong();
        });
      }
  )};

  addPlayerEvents(){

    document.body.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

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
      this.setCurrentTimeProgress("0:00");
      this._mainSongProgressBar.setProgressValue(0);
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

    this._songProgressBarEl.addEventListener("jump", (e) =>{
      this.setCurrentProgress(e.detail.progress);
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

      const response = await fetch('./data.json');

      if (!response.ok) {
        throw new Error('Error to get songs data');
      }
  
      const data = await response.json(); 
      return data;

    }catch(error){
      console.error(error.message);
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
    if(parseInt(this.getSongProgress()) <= 2){
      this.skip("backward");
    }else{
      this.restartSong();
    }
  }

  skipForward(){
    this.skip();
  }

  skip(action){

    let index;
    let songId;

    if(action == "backward"){

        index = this.songsData.findIndex(song => song.id === this.currentSongPlaying) - 1;
        index = index < 0 ? 0 : index;
        songId = this.songsData[index].id;
      
      }else{

        if(this.songPlayerInShuffle){

          index = this.getRandomSong();
          songId = this.songsData[index].id;
        }else{

          index = this.songsData.findIndex(song => song.id === this.currentSongPlaying) + 1;
          index = index > this.songsData.length ? this.songsData.length : index;
          songId = this.songsData[index].id;
        }
      }

    this.setSelectedSong(songId);
    this.startSong();
  }

  startSong(){
    this.preparePlayerData();
    this.play();
  }

  restartSong(){
    this._audioEl.currentTime = 0;
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
    const progress = this.getSongProgress();
    const currentTime = this.getFormattedSongTime();

    this._songCurrentTimeEl.innerText = currentTime;
    this._mainSongProgressBar.setProgressValue(progress);
  }

  getSongProgress(){
    return ((this._audioEl.currentTime / this._audioEl.duration) * 100);
  }

  getFormattedSongTime(){
    let minutes = Functions.toMinutes(this._audioEl.currentTime);
    let seconds = Functions.toSeconds(minutes, this._audioEl.currentTime);
    let formatedCurrentTime = `${minutes}:${Functions.padTo2Digits(seconds)}`;

    return formatedCurrentTime;
  }

  setCurrentProgress(progress){
    progress = ((progress / 100) * this._audioEl.duration);
    this._audioEl.currentTime = progress;
  }

  setCurrentTimeProgress(time){
    this._songCurrentTimeEl.innerText = time;
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
    }else{
      this._audioEl.loop = false;
      this._setLoopBtnEl.classList.remove("active");
    }
  }
  
  toggleShuffle(boolean){
    
    if(boolean){
      this.songPlayerInShuffle = true;
      this._setShuffleBtnEl.classList.add("active");
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

  getRandomSong(){

    let randomSong = parseInt(Math.random() * ((this.songsData.length - 1) - 0) + 0);
    
    if(randomSong === this.lastRandomSong){
      return this.getRandomSong();
    }
    
    this.lastRandomSong = randomSong;
    return this.lastRandomSong;
  }
}