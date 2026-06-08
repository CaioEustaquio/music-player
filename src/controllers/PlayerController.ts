import {
  toMinutes,
  toSeconds,
  padTo2Digits
} from "@utils/Functions";
import { SongTableController } from "@controllers/SongTableController";
import { ProgressBarController } from "@controllers/ProgressBarController";
import { SongTableUI } from "@ui/player/SongTableUI";
import { SongPlayerUI } from "@ui/player/SongPlayerUI";
import { ProgressBarUI } from "@ui/player/ProgressBarUI";
import { VolumeBarController } from "./VolumeBarController";
import { VolumeBarUI } from "@ui/player/VolumeBarUI";

export class PlayerController {
  private _songPlayerUI: SongPlayerUI;
  private _songTableController: SongTableController;
  private _progressBarController: ProgressBarController;
  private _volumeBarController: VolumeBarController;
  private _audioEl: HTMLAudioElement;
  private _currentSongPlayingId: string;
  private _playerInterval: ReturnType<typeof setInterval> | null = null;
  private _songPlayerInShuffle: boolean;
  // private _mainVolumeProgressBar: ProgressBarController;

  private _loopChangeEvent: Event;
  private _shuffleChangeEvent: Event;

  constructor(
    songTableUI: SongTableUI,
    songPlayerUI: SongPlayerUI,
    progressBarUI: ProgressBarUI,
    volumeBarUI: VolumeBarUI,
  ) {
    // ui
    this._songPlayerUI = songPlayerUI;
    // capturing elements
    this._songTableController = new SongTableController(songTableUI);
    this._audioEl = document.querySelector("#song-audio") as HTMLAudioElement;
    this._currentSongPlayingId = "";
    this._songPlayerInShuffle = false;
    this._progressBarController = new ProgressBarController(progressBarUI);
    this._volumeBarController = new VolumeBarController(volumeBarUI);
    this._shuffleChangeEvent = new Event("shuffle-change");
    this._loopChangeEvent = new Event("loop-change");

    this.init();
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

  async init(): Promise<void> {
    document.body.addEventListener('dragover', (e: MouseEvent) => e.preventDefault());
    this.addPlayerEvents();
    this.addKeyboardEvents();
  }

  addPlayerEvents() {
    this._audioEl.addEventListener("play", () => {
      this._songPlayerUI.togglePlayer();
      this.clearPlayerInterval();
      this.setPlayerInterval();
    });
    this._audioEl.addEventListener("pause", () => {
      this._songPlayerUI.togglePause(true);
      this.clearPlayerInterval();
    });
    this._audioEl.addEventListener("shuffle-change", () => {
      this._songPlayerUI.toggleShuffle(this.songPlayerInShuffle);
    });
    this._audioEl.addEventListener("loop-change", () => {
      this._songPlayerUI.toggleLoop(this._audioEl.loop);
    });
    this._audioEl.addEventListener("emptied", () => {
      this._songPlayerUI.setCurrentTimeProgress("0:00");
    });
    this._audioEl.addEventListener("ended", async (): Promise<void> => {
      await this.skipForward();
    });
    document.addEventListener("song-progress-jump", (e: CustomEventInit) => {
      this.setCurrentProgress(e.detail.progress);
    });
    document.addEventListener("volume-progress-jump", (e: CustomEventInit) => {
      this._volumeBarController.setBarProgress(e.detail.progress);
      this.setPlayerVolume(e.detail.progress);
    });
    document.addEventListener("song-selected", async (): Promise<void> => {
      const data = await this._songTableController.getSelectedSongData();
      if (!data) return;
      this._songPlayerUI.setPlayerData(data);
      this._currentSongPlayingId = data.id;
      this._audioEl.src = data.file;
      this._progressBarController.setTimeDuration(data.duration)
      this.play();
    })
    document.addEventListener("player-controls-play", () => this.play());
    document.addEventListener("player-controls-pause", () => this.pause());
    document.addEventListener("player-controls-shuffle", (): void => {
      if (!this.songPlayerInShuffle) {
        this.setPlayerInShuffle(true)
        return;
      }
      this.setPlayerInShuffle(false)
    });
    document.addEventListener("player-controls-loop", (): void => {
      if (!this._audioEl.loop) {
        this.setPlayerInLoop(true);
        return;
      }
      this.setPlayerInLoop(false);
    });
    document.addEventListener("player-controls-backward", async (): Promise<void> => {
      await this.skipBackward()
    });
    document.addEventListener("player-controls-forward", async (): Promise<void> => {
      await this.skipForward()
    })
  }

  addKeyboardEvents() {
    document.addEventListener("keypress", (e: KeyboardEvent) => {
      e.preventDefault();
      console.log("Aqui")
      if (e.code === "Space") {
        if (this._songTableController.rowSelected()) {
          this._audioEl.paused ? this.play() : this.pause();
        }
      }
    });
  }

  play(): void {
    try {
      if (!this._songTableController.rowSelected()) {
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

  setPlayerInShuffle(value: boolean) {
    this._songPlayerInShuffle = value;
    this._audioEl.dispatchEvent(this._shuffleChangeEvent);
  }
  setPlayerInLoop(value: boolean) {
    this._audioEl.loop = value;
    this._audioEl.dispatchEvent(this._loopChangeEvent);
  }
  async skipBackward(): Promise<void> {
    await this._songTableController.skip("backward", this._currentSongPlayingId);
  }
  async skipForward(): Promise<void> {
    if (!this._songPlayerInShuffle) {
      await this._songTableController.skip("forward", this._currentSongPlayingId);
      return;
    }
    await this._songTableController.setRandomSong(this._currentSongPlayingId);
  }
  restartSong() {
    this._audioEl.currentTime = 0;
  }

  getSongProgress(): number {
    return ((this._audioEl.currentTime / this._audioEl.duration) * 100);
  }

  getFormattedSongTime(): string {
    const minutes = toMinutes(this._audioEl.currentTime);
    const seconds = toSeconds(minutes, this._audioEl.currentTime);
    const formatedCurrentTime = `${minutes}:${padTo2Digits(seconds)}`;
    return formatedCurrentTime;
  }

  setCurrentProgress(progress: number) {
    progress = ((progress / 100) * this._audioEl.duration);
    this._audioEl.currentTime = progress;
  }

  setPlayerInterval(): void {
    this._playerInterval = setInterval(() => {
      const progress = this.getSongProgress();
      const currentTime = this.getFormattedSongTime();
      this._progressBarController.setTimeProgress(currentTime);
      this._progressBarController.setBarProgress(progress);
    }, 1000);
  }

  clearPlayerInterval(): void {
    if (this._playerInterval !== null) {
      clearInterval(this._playerInterval);
      this._playerInterval = null;
    }
  }
  setPlayerVolume(volume: number) {
    volume = (volume / 100);
    this._audioEl.volume = volume;
  }
}