import { IProgressBar } from "src/interfaces/IProgressBar";
import { ProgressBarUI } from "@ui/player/ProgressBarUI";

export class ProgressBarController implements IProgressBar {
  private _progressBarUI: ProgressBarUI;

  constructor(songProgressBarUI: ProgressBarUI) {
    this._progressBarUI = songProgressBarUI;
  }
  public setBarProgress(value: number): void {
    this._progressBarUI.setProgress(value);
  }
  public setTimeProgress(time: string) {
    this._progressBarUI.setCurrentDuration(time);
  }
  public setTimeDuration(time: string) {
    this._progressBarUI.setTotalDuration(time);
  }
}