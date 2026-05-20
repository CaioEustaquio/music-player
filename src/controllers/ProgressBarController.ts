export class ProgressBarController {

  constructor(
    private _progressBarEl: HTMLProgressElement,
    private _draggable: boolean = false,
    private _changeValueWhileDrag: boolean = false,
    private _customDragImg: HTMLImageElement = new Image(),
    private _jumpEvent: CustomEvent = new CustomEvent("jump", { detail: {} }),
  ) {

    this._progressBarEl.setAttribute(
      'draggable',
      _draggable ? 'true' : 'false'
    );
    this._customDragImg = new Image();
    this.init();
  }

  init() {
    this.addEvents();
  }

  addEvents(): void {
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

      if (this._changeValueWhileDrag) {
        this._progressBarEl.dispatchEvent(this._jumpEvent);
      }
    });

    this._progressBarEl.addEventListener("dragend", (e) => {
      this._progressBarEl.classList.remove("dragging");
      this._progressBarEl.dispatchEvent(this._jumpEvent);
    });
  }

  getCurrentBarValue(offsetX: number): number {
    const width = this._progressBarEl
      .getBoundingClientRect()
      .width;

    let progress = parseFloat(
      ((offsetX / width) * 100).toFixed(2)
    );
    progress = Math.min(100, Math.max(0, progress));
    return progress;
  }

  setProgressValue(value: number) {
    if (!this.itsDragging()) {
      this._progressBarEl.value = value;
    }
  }

  itsDragging(): boolean {
    return this._progressBarEl.classList.contains("dragging");
  }
}