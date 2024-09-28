export class ProgressBarController{

  constructor(progressBarEl, draggable = false){

    this._progressBarEl = progressBarEl;
    this._progressBarWidth = Number(progressBarEl.style.width.replace("px", ""));
    this._progressBarEl.setAttribute('draggable', draggable ? 'true' : 'false');
    this._customDragImg = new Image();

    // events
    this._jumpEvent = new CustomEvent("jump", {detail:{} });

    this.init();
  }

  init(){
    this.addEvents();
  }

  addEvents(){

    this._progressBarEl.addEventListener("click", (e) =>{

      const progress = this.getCurrentBarValue(e.offsetX);
      
      this._progressBarEl.value = progress;

      this._jumpEvent.detail.progress = progress;
      this._progressBarEl.dispatchEvent(this._jumpEvent);
    });

    this._progressBarEl.addEventListener("dragstart", (e) =>{
      this._progressBarEl.classList.add("dragging");
      this._customDragImg.src = '';

      // this make the translucent drag image move to not visible area
      e.dataTransfer.setDragImage(this._customDragImg, 0, 0);
    });

    this._progressBarEl.addEventListener("drag", (e) => {

      const progress = this.getCurrentBarValue(e.offsetX);
      this._progressBarEl.value = progress;
      this._jumpEvent.detail.progress = progress;
    });

    this._progressBarEl.addEventListener("dragend", (e) =>{
      this._progressBarEl.classList.remove("dragging");
      this._progressBarEl.dispatchEvent(this._jumpEvent);
    });
  }

  getCurrentBarValue(offsetX){

    let progress = parseFloat(((offsetX / this._progressBarWidth) * 100).toFixed(2));

    if(progress >= 100){
      progress = 100;
    }else if(progress <= 0){
      progress = 0;
    }

    return progress;
  }

  setProgressValue(value){
    if(!this.itsDragging()){
      this._progressBarEl.value = value;
    }
  }

  itsDragging(){
    return this._progressBarEl.classList.contains("dragging");
  }
}