import {Functions} from "../utils/Functions.js";
import { ProgressBarController } from "./ProgressBarController.js";

interface Song {
  id:string,
  title:string,
  author:string,
  singer:string,
  duration:string,
  image:string,
  file:string
}

export class PlayerController{

  private _tableBodyEl: HTMLTableSectionElement | null;
  private _playerContainerEl: HTMLElement | null;
  private _songThumbnailEl: HTMLImageElement | null;
  private _songTitleEl: HTMLHeadingElement | null;
  private _songAuthorEl: HTMLHeadingElement | null;
  private _songCurrentTimeEl: HTMLSpanElement | null;
  private _songDurationEl: HTMLSpanElement | null;
  private _songProgressBarEl: HTMLProgressElement | null;
  private _playBtnEl: HTMLElement | null;
  private _pauseBtnEl: HTMLElement | null;
  private _skipBackBtnEl: HTMLElement | null;
  private _skipForwardBtnEl: HTMLElement | null;
  private _setShuffleBtnEl: HTMLButtonElement | null;
  private _setLoopBtnEl: HTMLButtonElement | null;
  private _audioEl: HTMLAudioElement | null;
  private _volumeProgressBarEl: HTMLProgressElement | null;

  private _songsData: any;
  private _currentSongPlaying: any;
  private _playerInterval: NodeJS.Timeout | null;
  private _songPlayerInShuffle: boolean;
  private _lastRandomSong: number;
  private _mainSongProgressBar: ProgressBarController;
  private _mainVolumeProgressBar: ProgressBarController;

  constructor() {

    // Capturing elements
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

    this._songsData = null;
    this._currentSongPlaying = null;
    this._playerInterval = null;
    this._songPlayerInShuffle = false;
    this._lastRandomSong = 0;
    this._mainSongProgressBar = new ProgressBarController(this._songProgressBarEl!, true);
    this._mainVolumeProgressBar = new ProgressBarController(this._volumeProgressBarEl!, true);

    this.init();
  }

  async init(){

    const songs = await this.getSongs();
    this._songsData = songs;

    this.render();
    this.addGridEvents();
    this.addPlayerEvents();
    this.addKeyboardEvents();
  }

  // rendering songs on table
  render(): void {
    // counter
    let orderCounter: number = 1;
  
    this._songsData.map((song: any) => {
      let trContent: string = `
        <tr data-id="${song.id}" class="data-row">
          <td>${orderCounter}</td>
          <td>${song.title}</td>
          <td>${song.author}</td>
          <td>${song.singer}</td>
          <td>${song.duration}</td>
        </tr>
      `;

      this._tableBodyEl!.innerHTML += trContent;
      orderCounter++;
    });
  }

  addGridEvents(): void {
    // row events
    const rows: NodeListOf<HTMLTableRowElement> = document.querySelectorAll("tr.data-row");
  
    rows.forEach((row) => {
      const clonedRow: HTMLTableRowElement = row.cloneNode(true) as HTMLTableRowElement;
      row.replaceWith(clonedRow);

      let songId:string = row.dataset.id!;
  
      if (window.matchMedia('(max-width: 450px)').matches) {
        clonedRow.addEventListener('click', () => {

          this.setSelectedSong(songId);
          this.startSong();
        });
      } else {
        clonedRow.addEventListener('dblclick', () => {

          this.setSelectedSong(songId);
          this.startSong();
        });
      }
    });
  }
  
  addPlayerEvents(): void {
    document.body.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });
  
    this._audioEl?.addEventListener("play", () => {
      this.togglePlayerVisible(true);
      this.changeSongStateIcon();
      this.clearPlayerInterval();
      this.setPlayerInterval();
    });
  
    this._audioEl?.addEventListener("pause", () => {
      this.changeSongStateIcon();
      this.clearPlayerInterval();
    });
  
    this._audioEl!.addEventListener("emptied", () => {
      this.setCurrentTimeProgress("0:00");
      this._mainSongProgressBar.setProgressValue(0);
    });
  
    this._audioEl!.addEventListener("ended", () => {
      this.skipForward();
    });
  
    this._playBtnEl!.addEventListener("click", () => {
      this.play();
    });
  
    this._pauseBtnEl!.addEventListener("click", () => {
      this.pause();
    });
  
    this._skipBackBtnEl!.addEventListener("click", () => {
      this.skipBackward();
    });
  
    this._skipForwardBtnEl!.addEventListener("click", () => {
      this.skipForward();
    });
  
    this._setShuffleBtnEl!.addEventListener("click", () => {
      if (this._songPlayerInShuffle) {
        this.toggleShuffle(false);
      } else {
        this.toggleShuffle(true);
      }
    });
  
    this._setLoopBtnEl!.addEventListener("click", () => {
      if (this._audioEl!.loop) {
        this.toggleLoop(false);
      } else {
        this.toggleLoop(true);
      }
    });
  
    this._songProgressBarEl!.addEventListener("jump", (e: Event) => {
      const customEvent = e as CustomEvent;
      this.setCurrentProgress(customEvent.detail.progress);
    });
  }
  
  addKeyboardEvents():void{
    
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

      const response = await fetch('data.json');

      if (!response.ok) {
        throw new Error('Error to get songs data');
      }
  
      const data = await response.json(); 

      return data;

    }catch(error:any){
      console.error(error.message);
      return [];
    };
  }

  play():void{
    this._audioEl?.play();
  }

  pause():void{
    this._audioEl?.pause();
  }

  skipBackward():void{

    if(Number(this.getSongProgress().toFixed(2)) <= 2){
      this.skip("backward");
    }else{
      this.restartSong();
    }
  }

  skipForward():void{
    this.skip("foward");
  }

  skip(action:string):void{

    let index;
    let songId;

    if(action == "backward"){

        index = this._songsData.findIndex((song: Song) => song.id === this._currentSongPlaying) - 1;
        index = index < 0 ? 0 : index;
        songId = this._songsData[index].id;
      
      }else{

        if(this._songPlayerInShuffle){

          index = this.getRandomSong();
          songId = this._songsData[index].id;
        }else{

          index = this._songsData.findIndex((song: Song) => song.id === this._currentSongPlaying) + 1;
          index = index > this._songsData.length ? this._songsData.length : index;
          songId = this._songsData[index].id;
        }
      }

    this.setSelectedSong(songId);
    this.startSong();
  }

  startSong():void{
    this.preparePlayerData();
    this.play();
  }

  restartSong():void{
    this._audioEl!.currentTime = 0;
  }

  getSelectedSong(){
    return this._songsData.find((song: Song) => song.id === this._currentSongPlaying);
  }

  setSelectedSong(songId:string):void{
    this.applySelectedStyle(songId)
    this._currentSongPlaying = songId;
  }

  applySelectedStyle(songId: string):void{
    const playingElements = Array.from(this._tableBodyEl!.querySelectorAll(`tr.song-playing`));
  
    playingElements.forEach(el => {
      el.classList.remove("song-playing");
    });
  
    const selectedElement = this._tableBodyEl!.querySelector(`tr[data-id="${songId}"]`);
    if (selectedElement) {
      selectedElement.classList.add("song-playing");
    }
  }
  

  togglePlayerVisible(value:boolean):void{

    if(value){
      this._playerContainerEl?.classList.add("active");
    }else{
      this._playerContainerEl?.classList.remove("active");
    }
    this.changeSongStateIcon();
  }

  preparePlayerData():void{
    this._songThumbnailEl!.src = this.getSelectedSong().image;
    this._songTitleEl!.innerText = this.getSelectedSong().title;
    this._songAuthorEl!.innerText = this.getSelectedSong().author;
    this._songDurationEl!.innerText = this.getSelectedSong().duration;
    this._audioEl!.src = this.getSelectedSong().file;
  }

  updateSongProgressUi():void{

    let progress:number = this.getSongProgress(),
        currentTime:string = this.getSongTime();

    this._songCurrentTimeEl!.innerText = currentTime;
    this._mainSongProgressBar.setProgressValue(progress);
  }

  getSongProgress():number{
    return ((this._audioEl!.currentTime / this._audioEl!.duration) * 100);
  }

  getSongTime():string{

    let minutes = Functions.toMinutes(this._audioEl!.currentTime);
    let seconds = Functions.toSeconds(minutes, this._audioEl!.currentTime);
    let formatedCurrentTime = `${minutes}:${Functions.padTo2Digits(seconds)}`

    return formatedCurrentTime;
  }

  setCurrentProgress(progress:number):void{
    progress = ((progress / 100) * this._audioEl!.duration);
    this._audioEl!.currentTime = progress;
  }

  setCurrentTimeProgress(time: string):void{
    this._songCurrentTimeEl!.innerText = time;
  }

  setPlayerInterval():void{

    this._playerInterval = setInterval(() =>{

      this.updateSongProgressUi();
    }, 1000);
  }

  clearPlayerInterval():void{
    if(this._playerInterval !== null){
      clearInterval(this._playerInterval);
    }
  }

  toggleLoop(boolean: boolean):void{

    if(boolean){
      this._audioEl!.loop = true;
      this._setLoopBtnEl!.classList.add("active");
    }else{
      this._audioEl!.loop = false;
      this._setLoopBtnEl!.classList.remove("active");
    }
  }
  
  toggleShuffle(boolean: boolean):void{
    
    if(boolean){
      this._songPlayerInShuffle = true;
      this._setShuffleBtnEl!.classList.add("active");
    }else{
      this._songPlayerInShuffle = false;
      this._setShuffleBtnEl!.classList.remove("active");
    }
  }

  isPaused():boolean{
    return this._audioEl!.paused;
  }

  changeSongStateIcon():void{

    if(this.isPaused()){
      this._pauseBtnEl!.style.display = "none";
      this._playBtnEl!.style.display = "block";
    }else{
      this._playBtnEl!.style.display = "none";
      this._pauseBtnEl!.style.display = "block";
    }
  }

  hasSelectedSong():boolean{
    return this._currentSongPlaying ? true : false
  }

  itInLoop(): boolean{
    return this._audioEl!.loop;
  }

  getRandomSong():number{

    let randomSong:number = Math.floor(Math.random() * ((this._songsData.length - 1) - 0) + 0);

    if(randomSong === this._lastRandomSong){
      return this.getRandomSong();
    }
    
    this._lastRandomSong = randomSong;
    return this._lastRandomSong;
  }
}