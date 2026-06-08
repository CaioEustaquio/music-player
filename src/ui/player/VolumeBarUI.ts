import { ProgressBarComponent } from "./components/ProgressBarComponent";

type VolumeIcons = {
  muted: string;
  low: string;
  medium: string;
  high: string;
}

export class VolumeBarUI {
  private _volumeProgressBarEl: HTMLProgressElement;
  private _progressBarComponent: ProgressBarComponent;
  private _volumeBtn: HTMLButtonElement;
  private _volumeIcon: HTMLImageElement;

  constructor() {
    this._volumeProgressBarEl = document.querySelector("progress#volume-progress-bar") as HTMLProgressElement;
    this._progressBarComponent = new ProgressBarComponent(this._volumeProgressBarEl, "volume-progress-jump", true);
    this._volumeBtn = document.querySelector("#volume-button") as HTMLButtonElement;
    this._volumeIcon = this._volumeBtn.querySelector("img") as HTMLImageElement;

  }
  setProgress(value: number) {
    this._progressBarComponent.setProgressValue(value);
    this.updateVolumeIcon(value);
  }

  private updateVolumeIcon(volume: number): void {
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