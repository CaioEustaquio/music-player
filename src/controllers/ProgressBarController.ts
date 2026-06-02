import { SongProgressBarUI } from "@ui/player/SongProgressBarUI";

export class ProgressBarController {
  private _songProgressBarUI: SongProgressBarUI;

  constructor(songProgressBarUI: SongProgressBarUI) {
    this._songProgressBarUI = songProgressBarUI;
  }
  public setBarProgress(value: number) {
    this._songProgressBarUI.setProgress(value);
  }
  public setTimeProgress(time: string) {
    this._songProgressBarUI.setCurrentDuration(time);
  }
  public setTimeDuration(time: string) {
    this._songProgressBarUI.setTotalDuration(time);
  }
}