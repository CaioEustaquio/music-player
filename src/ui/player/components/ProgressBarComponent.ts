export class ProgressBarComponent {
  private _progressBarEl: HTMLProgressElement;
  private _draggable: boolean;
  private _changeProgressWhileDragging: boolean;
  private _customDragImg: HTMLImageElement;
  private _jumpEvent: CustomEvent;
  constructor(
    progressBarEl: HTMLProgressElement,
    draggable: boolean,
    changeProgressWhileDragging: boolean = false
  ) {
    this._progressBarEl = progressBarEl;
    this._draggable = draggable;
    this._changeProgressWhileDragging = changeProgressWhileDragging;
    this._customDragImg = new Image();
    this._jumpEvent = new CustomEvent("jump", { detail: {} })
    this.init();
  }
  init() {
    this._progressBarEl.setAttribute(
      'draggable',
      this._draggable ? 'true' : 'false'
    );
    this.addEvents();
  }

  private addEvents(): void {
    this._progressBarEl.addEventListener("click", (e: MouseEvent) => {
      const progress = this.getCurrentBarValue(e.offsetX);
      this._progressBarEl.value = progress;
      this._jumpEvent.detail.progress = progress;
      this._progressBarEl.dispatchEvent(this._jumpEvent);
    });

    this._progressBarEl.addEventListener("dragstart", (e: DragEvent) => {
      this._progressBarEl.classList.add("dragging");
      this._customDragImg.src = '';

      // this make the translucent drag image move to not visible area
      e.dataTransfer?.setDragImage(this._customDragImg, 0, 0);
    });

    this._progressBarEl.addEventListener("drag", (e: DragEvent) => {
      const progress = this.getCurrentBarValue(e.offsetX);
      this._progressBarEl.value = progress;
      this._jumpEvent.detail.progress = progress;

      if (this._changeProgressWhileDragging) {
        this._progressBarEl.dispatchEvent(this._jumpEvent);
      }
    });

    this._progressBarEl.addEventListener("dragend", (e) => {
      this._progressBarEl.classList.remove("dragging");
      this._progressBarEl.dispatchEvent(this._jumpEvent);
    });
  }

  private getCurrentBarValue(offsetX: number): number {
    const width = this._progressBarEl
      .getBoundingClientRect()
      .width;

    let progress = parseFloat(
      ((offsetX / width) * 100).toFixed(2)
    );
    progress = Math.min(100, Math.max(0, progress));
    return progress;
  }
  public setProgressValue(value: number) {
    if (!this.itsDragging()) {
      this._progressBarEl.value = value;
    }
  }
  private itsDragging(): boolean {
    return this._progressBarEl.classList.contains("dragging");
  }
}