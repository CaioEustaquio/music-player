export class ProgressBarController {
  private _progressBarEl: HTMLInputElement | HTMLProgressElement; // Tipo do elemento
  private _progressBarWidth: number;
  private _barDraggable: string;
  private _customDragImg: HTMLImageElement;
  private _jumpEvent: CustomEvent;

  constructor(progressBarEl: HTMLInputElement | HTMLProgressElement, draggable = false) {
    this._progressBarEl = progressBarEl;
    this._progressBarWidth = Number(progressBarEl.style.width.replace("px", ""));
    this._barDraggable = draggable ? 'true' : 'false';
    this._progressBarEl.setAttribute('draggable', this._barDraggable);
    this._customDragImg = new Image();

    // events
    this._jumpEvent = new CustomEvent("jump", { detail: {} });

    this.init();
  }

  init() {
    this.addEvents();
  }

  addEvents() {
    this._progressBarEl!.addEventListener("click", (e) => this.handleClick(e as MouseEvent));
    this._progressBarEl!.addEventListener("dragstart", (e) => this.handleDragStart(e as DragEvent));
    this._progressBarEl!.addEventListener("drag", (e) => this.handleDrag(e as DragEvent));
    this._progressBarEl!.addEventListener("dragend", () => this.handleDragEnd());
  }

  private handleClick(e: MouseEvent) {
    const progress = this.getCurrentBarValue(e.offsetX);
    
    this._progressBarEl!.value = progress.toString();

    this._jumpEvent.detail.progress = progress;
    this._progressBarEl!.dispatchEvent(this._jumpEvent);
  }

  private handleDragStart(e: DragEvent) {
    this._progressBarEl!.classList.add("dragging");
    this._customDragImg.src = '';

    // this makes the translucent drag image move to a non-visible area
    e.dataTransfer?.setDragImage(this._customDragImg, 0, 0);
  }

  private handleDrag(e: MouseEvent):void {
    const progress = this.getCurrentBarValue(e.offsetX);
    this._progressBarEl!.value = progress.toString();
    this._jumpEvent.detail.progress = progress;
  }

  private handleDragEnd():void {
    this._progressBarEl!.classList.remove("dragging");
    this._progressBarEl!.dispatchEvent(this._jumpEvent);
  }

  getCurrentBarValue(offsetX: number) {
    let progress = parseFloat(((offsetX / this._progressBarWidth) * 100).toFixed(2));

    if (progress >= 100) {
      progress = 100;
    } else if (progress <= 0) {
      progress = 0;
    }

    return progress;
  }

  setProgressValue(value: number) {
    if (!this.itsDragging()) {
      this._progressBarEl!.value = value.toString();
    }
  }

  itsDragging() {
    return this._progressBarEl!.classList.contains("dragging");
  }
}
