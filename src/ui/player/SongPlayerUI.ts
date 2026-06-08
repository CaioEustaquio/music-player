import { Song } from "@appTypes/song";

type SongPlayerState = {
  paused: boolean;
  shuffleActive: boolean;
  loopActive: boolean;
}

export class SongPlayerUI {
  private _playerContainerEl: HTMLElement;
  private _songThumbnailEl: HTMLImageElement;
  private _songTitleEl: HTMLHeadingElement;
  private _songAuthorEl: HTMLHeadingElement;
  private _songCurrentTimeEl: HTMLParagraphElement;
  private _songDurationEl: HTMLParagraphElement;
  private _songProgressBarEl: HTMLProgressElement;
  private _playBtnEl: HTMLButtonElement;
  private _pauseBtnEl: HTMLButtonElement;
  private _backwardBtnEl: HTMLButtonElement;
  private _forwardBtnEl: HTMLButtonElement;
  private _setShuffleBtnEl: HTMLButtonElement;
  private _setLoopBtnEl: HTMLButtonElement;
  private _volumeProgressBarEl: HTMLProgressElement;
  private _songPlayerState: SongPlayerState;
  // private _mainSongProgressBar: ProgressBarController;
  // private _mainVolumeProgressBar: ProgressBarController;

  // events
  private _playBtnEvent = new Event("player-controls-play");
  private _pauseBtnEvent = new Event("player-controls-pause");
  private _shuffleBtnEvent = new Event("player-controls-shuffle");
  private _loopBtnEvent = new Event("player-controls-loop");
  private _backwardBtnEvent = new Event("player-controls-backward");
  private _forwardBtnEvent = new Event("player-controls-forward");

  constructor() {
    // capturing elements
    this._playerContainerEl = document.querySelector("#player-controls") as HTMLElement;
    this._songThumbnailEl = document.querySelector("img#song-thumbnail") as HTMLImageElement;
    this._songTitleEl = document.querySelector("h2#song-title") as HTMLHeadingElement;
    this._songAuthorEl = document.querySelector("h2#song-author") as HTMLHeadingElement;
    this._songCurrentTimeEl = document.querySelector("p span#current-time") as HTMLParagraphElement;
    this._songDurationEl = document.querySelector("p span#total-time") as HTMLParagraphElement;
    this._songProgressBarEl = document.querySelector("progress#progress-bar") as HTMLProgressElement;
    this._playBtnEl = document.querySelector("#play-btn") as HTMLButtonElement;
    this._pauseBtnEl = document.querySelector("#pause-btn") as HTMLButtonElement;
    this._backwardBtnEl = document.querySelector("#skip-back-btn") as HTMLButtonElement;
    this._forwardBtnEl = document.querySelector("#skip-forward-btn") as HTMLButtonElement;
    this._setShuffleBtnEl = document.querySelector("button#shuffle-btn") as HTMLButtonElement;
    this._setLoopBtnEl = document.querySelector("button#repeat-btn") as HTMLButtonElement;
    this._volumeProgressBarEl = document.querySelector("progress#volume-progress-bar") as HTMLProgressElement;

    // player state
    this._songPlayerState = {
      paused: false,
      shuffleActive: false,
      loopActive: false
    }
    // this._mainSongProgressBar = new ProgressBarController(this._songProgressBarEl, true);
    // this._mainVolumeProgressBar = new ProgressBarController(this._volumeProgressBarEl, true, true);

    this.init();
  }

  public get songPlayerState(): SongPlayerState {
    return this._songPlayerState;
  }

  init() {
    this.addPlayerEvents();
  }
  addPlayerEvents(): void {
    this._playBtnEl.addEventListener("click", () => {
      document.dispatchEvent(this._playBtnEvent);
    })
    this._pauseBtnEl.addEventListener("click", () => {
      document.dispatchEvent(this._pauseBtnEvent);
    });
    this._setShuffleBtnEl.addEventListener("click", (): void => {
      document.dispatchEvent(this._shuffleBtnEvent);
    });
    this._setLoopBtnEl.addEventListener("click", (): void => {
      document.dispatchEvent(this._loopBtnEvent);
    });
    this._backwardBtnEl.addEventListener("click", (): void => {
      document.dispatchEvent(this._backwardBtnEvent);
    });
    this._forwardBtnEl.addEventListener("click", (): void => {
      document.dispatchEvent(this._forwardBtnEvent);
    });
  }
  togglePlayer(showUI: boolean = true) {
    if (showUI) {
      this._playerContainerEl.classList.add("active");
    } else {
      this._playerContainerEl.classList.remove("active");
    }
    this.togglePause(false)
  }

  async setPlayerData(data: Song): Promise<void> {
    if (!data) return;
    this._songThumbnailEl.src = data.image;
    this._songTitleEl.innerText = data.title;
    this._songAuthorEl.innerText = data.author;
  }

  togglePause(paused: boolean): void {
    this._playBtnEl.style.display = paused ? "block" : "none";
    this._pauseBtnEl.style.display = paused ? "none" : "block";
    this._songPlayerState.paused = paused;
  }
  setCurrentTimeProgress(time: string) {
    this._songCurrentTimeEl.innerText = time;
  }
  public toggleShuffle(value: boolean): void {
    if (value) {
      this._setShuffleBtnEl.classList.add("active");
    } else {
      this._setShuffleBtnEl.classList.remove("active");
    }
    this._songPlayerState.shuffleActive = value;
  }
  public toggleLoop(value: boolean): void {
    if (value) {
      this._setLoopBtnEl.classList.add("active");
    } else {
      this._setLoopBtnEl.classList.remove("active");
    }
    this._songPlayerState.loopActive = value;
  }
}