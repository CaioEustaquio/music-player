import { IProgressBar } from "src/interfaces/IProgressBar";
import { VolumeBarUI } from "@ui/player/VolumeBarUI";

export class VolumeBarController implements IProgressBar {
  private _volumeBarUI: VolumeBarUI;

  constructor(songProgressBarUI: VolumeBarUI) {
    this._volumeBarUI = songProgressBarUI;
  }
  public setBarProgress(value: number): void {
    this._volumeBarUI.setProgress(value);
  }
}