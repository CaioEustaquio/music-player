import { ProgressBarComponent } from "@ui/player/components/ProgressBarComponent";

export class ProgressBarUI {
  private _songCurrentTimeEl: HTMLParagraphElement;
  private _songProgressBarEl: HTMLProgressElement;
  private _progressBarComponent: ProgressBarComponent;
  private _songDurationEl: HTMLParagraphElement;
  constructor() {
    this._songCurrentTimeEl = document.querySelector("p span#current-time") as HTMLParagraphElement;
    this._songProgressBarEl = document.querySelector("progress#progress-bar") as HTMLProgressElement;
    this._songDurationEl = document.querySelector("p span#total-time") as HTMLParagraphElement;
    this._progressBarComponent = new ProgressBarComponent(this._songProgressBarEl, "song-progress-jump", true);
  }
  public setCurrentDuration(time: string): void {
    this._songCurrentTimeEl.innerText = time;
  }
  public setTotalDuration(time: string): void {
    this._songDurationEl.innerText = time;
  }
  public setProgress(value: number) {
    this._progressBarComponent.setProgressValue(value);
  }
}