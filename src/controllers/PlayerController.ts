import { Functions } from "@utils/Functions";
import { ProgressBarController } from "src/controllers/ProgressBarController";
import { Song } from "@appTypes/song";
import mockSongs from "@data/mockSongs.json"

type VolumeIcons = {
  muted: string;
  low: string;
  medium: string;
  high: string;
}

export class PlayerController {

  private _tableBodyEl: HTMLTableSectionElement;
  private _playerContainerEl: HTMLElement;
  private _songThumbnailEl: HTMLImageElement;
  private _songTitleEl: HTMLHeadingElement;
  private _songAuthorEl: HTMLHeadingElement;
  private _songCurrentTimeEl: HTMLParagraphElement;
  private _songDurationEl: HTMLParagraphElement;
  private _songProgressBarEl: HTMLProgressElement;
  private _playBtnEl: HTMLButtonElement;
  private _pauseBtnEl: HTMLButtonElement;
  private _skipBackBtnEl: HTMLButtonElement;
  private _skipForwardBtnEl: HTMLButtonElement;
  private _setShuffleBtnEl: HTMLButtonElement;
  private _setLoopBtnEl: HTMLButtonElement;
  private _audioEl: HTMLAudioElement;
  private _volumeProgressBarEl: HTMLProgressElement;
  private _volumeBtn: HTMLButtonElement;
  private _volumeIcon: HTMLImageElement;
  private _songsData: Song[];
  private _currentSongPlaying: string;
  private _playerInterval: ReturnType<typeof setInterval> | null = null;
  private _songPlayerInShuffle: boolean;
  private _mainSongProgressBar: ProgressBarController;
  private _mainVolumeProgressBar: ProgressBarController;
  private _lastRandomSong: number;

  constructor() {

    // capturing elements
    this._tableBodyEl = document.querySelector("#desktop-songs-table tbody") as HTMLTableSectionElement;
    this._playerContainerEl = document.querySelector("#desktop-player-controls") as HTMLElement;
    this._songThumbnailEl = document.querySelector("img#song-thumbnail") as HTMLImageElement;
    this._songTitleEl = document.querySelector("h2#song-title") as HTMLHeadingElement;
    this._songAuthorEl = document.querySelector("h2#song-author") as HTMLHeadingElement;
    this._songCurrentTimeEl = document.querySelector("p span#current-time") as HTMLParagraphElement;
    this._songDurationEl = document.querySelector("p span#total-time") as HTMLParagraphElement;
    this._songProgressBarEl = document.querySelector("progress#desktop-progress-bar") as HTMLProgressElement;
    this._playBtnEl = document.querySelector("#play-btn") as HTMLButtonElement;
    this._pauseBtnEl = document.querySelector("#pause-btn") as HTMLButtonElement;
    this._skipBackBtnEl = document.querySelector("#skip-back-btn") as HTMLButtonElement;
    this._skipForwardBtnEl = document.querySelector("#skip-forward-btn") as HTMLButtonElement;
    this._setShuffleBtnEl = document.querySelector("button#shuffle-btn") as HTMLButtonElement;
    this._setLoopBtnEl = document.querySelector("button#repeat-btn") as HTMLButtonElement;
    this._audioEl = document.querySelector("#song-audio") as HTMLAudioElement;
    this._volumeProgressBarEl = document.querySelector("progress#desktop-volume-progress-bar") as HTMLProgressElement;
    this._volumeBtn = document.querySelector("#volume-button") as HTMLButtonElement;
    this._volumeIcon = this._volumeBtn.querySelector("img") as HTMLImageElement;

    this._songsData = [];
    this._currentSongPlaying = "";
    this._songPlayerInShuffle = false;
    this._mainSongProgressBar = new ProgressBarController(this._songProgressBarEl, true);
    this._mainVolumeProgressBar = new ProgressBarController(this._volumeProgressBarEl, true, true);
    this._lastRandomSong = 0;

    this.init();
  }

  get songsData(): Song[] {
    return this._songsData;
  }
  set songsData(songsData) {
    this._songsData = songsData;
  }

  get currentSongPlaying(): string {
    return this._currentSongPlaying;
  }
  set currentSongPlaying(currentSongPlaying: string) {
    this._currentSongPlaying = currentSongPlaying;
  }

  get playerInterval(): ReturnType<typeof setInterval> | null {
    return this._playerInterval;
  }
  set playerInterval(playerInterval) {
    this._playerInterval = playerInterval;
  }

  get songPlayerInShuffle(): boolean {
    return this._songPlayerInShuffle;
  }
  set songPlayerInShuffle(songPlayerInShuffle) {
    this._songPlayerInShuffle = songPlayerInShuffle;
  }

  get lastRandomSong(): number {
    return this._lastRandomSong;
  }
  set lastRandomSong(lastRandomSong) {
    this._lastRandomSong = lastRandomSong;
  }

  async init() {

    const songs: Song[] = await this.fetchSongs();
    this.songsData = songs;

    this.render();
    this.addGridEvents();
    this.addPlayerEvents();
    this.addKeyboardEvents();
  }

  // rendering songs on table
  render(): void {

    // counter
    let orderCounter = 1;

    this.songsData.map(song => {

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

  addGridEvents(): void {
    // rows events
    [...document.querySelectorAll<HTMLTableRowElement>("tr.data-row")].map((row) => {

      row.addEventListener('dblclick', () => {
        if (!row.dataset.id) return
        this.setSelectedSong(row.dataset.id);
        this.startSong();
      });
    }
    )
  };

  addPlayerEvents() {

    document.body.addEventListener('dragover', (e: MouseEvent) => {
      e.preventDefault();
    });

    this._audioEl.addEventListener("play", () => {

      this.togglePlayerVisible(true);

      this.changeSongStateIcon();
      this.clearPlayerInterval();
      this.setPlayerInterval();
    });

    this._audioEl.addEventListener("pause", () => {

      this.changeSongStateIcon();
      this.clearPlayerInterval();
    });

    this._audioEl.addEventListener("emptied", () => {
      this.setCurrentTimeProgress("0:00");
      this._mainSongProgressBar.setProgressValue(0);
    });

    this._audioEl.addEventListener("ended", () => {
      this.skipForward();
    });

    this._playBtnEl.addEventListener("click", () => {
      this.play();
    });

    this._pauseBtnEl.addEventListener("click", () => {
      this.pause();
    });

    this._skipBackBtnEl.addEventListener("click", () => {
      this.skipBackward();
    });

    this._skipForwardBtnEl.addEventListener("click", () => {
      this.skipForward();
    });

    this._setShuffleBtnEl.addEventListener("click", () => {

      if (this.songPlayerInShuffle) {
        this.toggleShuffle(false);
      } else {
        this.toggleShuffle(true);
      }
    });

    this._setLoopBtnEl.addEventListener("click", () => {

      if (this._audioEl.loop) {
        this.toggleLoop(false);
      } else {
        this.toggleLoop(true);
      }
    });

    this._songProgressBarEl.addEventListener("jump", (e: CustomEventInit) => {
      this.setCurrentProgress(e.detail.progress);
    });

    this._volumeProgressBarEl.addEventListener("jump", (e: CustomEventInit) => {
      this.updateVolumeImage(e.detail.progress);
      this.setPlayerVolume(e.detail.progress);
    });
  }

  addKeyboardEvents() {

    document.addEventListener("keypress", (e) => {
      e.preventDefault();
      switch (e.code) {

        case ("Space"):
          if (this.hasSelectedSong()) this.isPaused() ? this.play() : this.pause();
          break;
        default:
          break;
      }
    });
  }

  async fetchSongs(): Promise<Song[]> {
    try {
      return mockSongs as Song[];

    } catch (error: any) {
      console.error(error.message);
      return [];
    };
  }

  play(): void {
    try {
      if (!this.hasSelectedSong) {
        throw new Error("Song not selected")
      }
      this._audioEl.play();
    } catch (err) {
      console.error(err)
    }
  }


  pause(): void {
    this._audioEl.pause();
  }

  skipBackward(): void {
    if (this.getSongProgress() <= 2) {
      this.skip("backward");
    } else {
      this.restartSong();
    }
  }

  skipForward(): void {
    this.skip("forward");
  }

  skip(action: 'backward' | 'forward') {

    let index;
    let songId;

    if (action == "backward") {

      index = this.songsData.findIndex((song: Song) => song.id === this.currentSongPlaying) - 1;
      index = index < 0 ? 0 : index;
      songId = this.songsData[index].id;

    } else {

      if (this.songPlayerInShuffle) {

        index = this.getRandomSong();
        songId = this.songsData[index].id;
      } else {

        index = this.songsData.findIndex((song: Song) => song.id === this.currentSongPlaying) + 1;
        index = index > this.songsData.length ? this.songsData.length : index;
        songId = this.songsData[index].id;
      }
    }

    this.setSelectedSong(songId);
    this.startSong();
  }

  async startSong() {
    await this.preparePlayerData();
    this.play();
  }

  restartSong() {
    this._audioEl.currentTime = 0;
  }

  async getSelectedSong(): Promise<Song | null> {
    const song = await this.songsData.find((song: Song) => {
      return song.id === this.currentSongPlaying;
    });

    return song ?? null;
  }


  setSelectedSong(songId: string) {
    this.applySelectedStyle(songId)
    this.currentSongPlaying = songId;
  }

  applySelectedStyle(songId: string) {

    [...this._tableBodyEl.querySelectorAll<HTMLTableRowElement>(`tr.song-playing`)].map(el => {
      el.classList.remove("song-playing");
    });

    this._tableBodyEl.querySelector<HTMLTableRowElement>(`tr[data-id="${songId}"]`)
      ?.classList
      .add("song-playing")
  }

  togglePlayerVisible(value: boolean = true) {

    if (value) {
      this._playerContainerEl.classList.add("active");
    } else {
      this._playerContainerEl.classList.remove("active");
    }

    this.changeSongStateIcon()
  }

  async preparePlayerData(): Promise<void> {
    const song = await this.getSelectedSong();
    if (song) {
      this._songThumbnailEl.src = song.image;
      this._songTitleEl.innerText = song.title;
      this._songAuthorEl.innerText = song.author;
      this._songDurationEl.innerText = song.duration;
      this._audioEl.src = song.file;
    }
  }

  updateSongProgressUi(): void {
    const progress = this.getSongProgress();
    const currentTime = this.getFormattedSongTime();

    this._songCurrentTimeEl.innerText = currentTime;
    this._mainSongProgressBar.setProgressValue(progress);
  }

  getSongProgress(): number {
    return ((this._audioEl.currentTime / this._audioEl.duration) * 100);
  }

  getFormattedSongTime() {
    let minutes = Functions.toMinutes(this._audioEl.currentTime);
    let seconds = Functions.toSeconds(minutes, this._audioEl.currentTime);
    let formatedCurrentTime = `${minutes}:${Functions.padTo2Digits(seconds)}`;

    return formatedCurrentTime;
  }

  setCurrentProgress(progress: number) {
    progress = ((progress / 100) * this._audioEl.duration);
    this._audioEl.currentTime = progress;
  }

  setCurrentTimeProgress(time: string) {
    this._songCurrentTimeEl.innerText = time;
  }

  setPlayerInterval(): void {

    this._playerInterval = setInterval(() => {

      this.updateSongProgressUi();
    }, 1000);
  }

  clearPlayerInterval(): void {
    if (this._playerInterval !== null) {
      clearInterval(this._playerInterval);
      this._playerInterval = null;
    }
  }


  toggleLoop(value: boolean): void {

    if (value) {
      this._audioEl.loop = true;
      this._setLoopBtnEl.classList.add("active");
    } else {
      this._audioEl.loop = false;
      this._setLoopBtnEl.classList.remove("active");
    }
  }

  toggleShuffle(value: boolean): void {

    if (value) {
      this.songPlayerInShuffle = true;
      this._setShuffleBtnEl.classList.add("active");
    } else {
      this.songPlayerInShuffle = false;
      this._setShuffleBtnEl.classList.remove("active");
    }
  }

  isPaused(): boolean {
    return this._audioEl.paused;
  }

  changeSongStateIcon(): void {

    if (this.isPaused()) {
      this._pauseBtnEl.style.display = "none";
      this._playBtnEl.style.display = "block";
    } else {
      this._playBtnEl.style.display = "none";
      this._pauseBtnEl.style.display = "block";
    }
  }

  hasSelectedSong(): boolean {
    return this.currentSongPlaying ? true : false
  }

  itInLoop() {
    return this._audioEl.loop;
  }

  getRandomSong(): number {

    let randomSong = Math.floor(
      Math.random() * this.songsData.length
    );

    if (randomSong === this.lastRandomSong) {
      return this.getRandomSong();
    }

    this.lastRandomSong = randomSong;
    return this.lastRandomSong;
  }

  getPlayerVolume(): number {
    return this._audioEl.volume;
  }

  setPlayerVolume(volume: number) {
    volume = (volume / 100);
    this._audioEl.volume = volume;
  }

  updateVolumeImage(volume: number): void {
    if (volume < 0 || volume > 100) {
      return;
    }

    const volumeIcons: VolumeIcons = {
      muted: 'volume-x.svg',
      low: 'volume.svg',
      medium: 'volume-1.svg',
      high: 'volume-2.svg',
    };

    let state: keyof VolumeIcons;
    if (volume === 0) {
      state = 'muted';
    } else if (volume <= 25) {
      state = 'low';
    } else if (volume <= 50) {
      state = 'medium';
    } else {
      state = 'high';
    }

    const path = '/public/images/icons';
    this._volumeIcon.src = `${path}/${volumeIcons[state]}`;
  }
}