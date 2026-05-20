import { Functions } from "@utils/Functions";
import { SongTableController } from "@controllers/SongTableController";
import { ProgressBarController } from "@controllers/ProgressBarController";
import { Song } from "@appTypes/song";

type VolumeIcons = {
  muted: string;
  low: string;
  medium: string;
  high: string;
}

export class PlayerController {
  private _songTable: SongTableController;
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
  private _currentSongPlayingId: string;
  private _playerInterval: ReturnType<typeof setInterval> | null = null;
  private _songPlayerInShuffle: boolean;
  private _mainSongProgressBar: ProgressBarController;
  private _mainVolumeProgressBar: ProgressBarController;


  constructor() {

    // capturing elements
    this._songTable = new SongTableController();
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

    this._currentSongPlayingId = "";
    this._songPlayerInShuffle = false;
    this._mainSongProgressBar = new ProgressBarController(this._songProgressBarEl, true);
    this._mainVolumeProgressBar = new ProgressBarController(this._volumeProgressBarEl, true, true);

    this.init();
  }

  get songTable(): SongTableController {
    return this._songTable;
  }

  get currentSongPlayingId(): string {
    return this._currentSongPlayingId;
  }
  set currentSongPlayingId(currentSongPlayingId: string) {
    this._currentSongPlayingId = currentSongPlayingId;
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

  async init(): Promise<void> {
    this.addPlayerEvents();
    this.addKeyboardEvents();
  }

  addPlayerEvents() {
    document.body.addEventListener('dragover', (e: MouseEvent) => e.preventDefault());
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
    this._audioEl.addEventListener("ended", () => this.skipForward());
    this._playBtnEl.addEventListener("click", () => this.play())
    this._pauseBtnEl.addEventListener("click", () => this.pause());
    this._skipBackBtnEl.addEventListener("click", () => this.skipBackward());
    this._skipForwardBtnEl.addEventListener("click", () => this.skipForward());
    this._setShuffleBtnEl.addEventListener("click", () => {
      if (this.songPlayerInShuffle) {
        this.toggleShuffle(false);
      } else {
        this.toggleShuffle(true);
      }
    });

    this._setLoopBtnEl.addEventListener("click", () => {
      if (this.itInLoop()) {
        this.toggleLoop(false);
      } else {
        this.toggleLoop(true);
      }
    });

    this._songProgressBarEl.addEventListener("jump", (e: CustomEventInit) => this.setCurrentProgress(e.detail.progress));
    this._volumeProgressBarEl.addEventListener("jump", (e: CustomEventInit) => {
      this.updateVolumeImage(e.detail.progress);
      this.setPlayerVolume(e.detail.progress);
    });
    this.songTable.body.addEventListener("song-selected", () => {
      this.preparePlayerData(this.songTable.getSelectedSongData());
      this.play();
    })
  }

  addKeyboardEvents() {
    document.addEventListener("keypress", (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case ("Space"):
          console.log("Aqui")
          if (this.songTable.selectedRowEl) this.isPaused() ? this.play() : this.pause();
          break;
        default:
          break;
      }
    });
  }

  play(): void {
    try {
      if (!this.songTable.selectedRowEl) {
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
      this.songTable.skip("backward", this.songPlayerInShuffle);
      this.play();
    } else {
      this.restartSong();
    }
  }

  skipForward(): void {
    this.songTable.skip("forward", this.songPlayerInShuffle);
    this.play();
  }

  restartSong() {
    this._audioEl.currentTime = 0;
  }

  togglePlayerVisible(value: boolean = true) {
    if (value) {
      this._playerContainerEl.classList.add("active");
    } else {
      this._playerContainerEl.classList.remove("active");
    }
    this.changeSongStateIcon()
  }

  async preparePlayerData(data: Song): Promise<void> {
    if (!data) return;
    this._songThumbnailEl.src = data.image;
    this._songTitleEl.innerText = data.title;
    this._songAuthorEl.innerText = data.author;
    this._songDurationEl.innerText = data.duration;
    this._audioEl.src = data.file;
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

  getFormattedSongTime(): string {
    const minutes = Functions.toMinutes(this._audioEl.currentTime);
    const seconds = Functions.toSeconds(minutes, this._audioEl.currentTime);
    const formatedCurrentTime = `${minutes}:${Functions.padTo2Digits(seconds)}`;
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
    const paused = this.isPaused();
    this._playBtnEl.style.display = paused ? "block" : "none";
    this._pauseBtnEl.style.display = paused ? "none" : "block";
  }

  itInLoop() {
    return this._audioEl.loop;
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