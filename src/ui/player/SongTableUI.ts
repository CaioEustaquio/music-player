import { Song } from "@appTypes/song";

type SongTableState = {
  rowSelected: boolean;
}

export class SongTableUI {
  private _body: HTMLTableElement;
  private _selectedRowEl: HTMLTableRowElement | null;
  private _selectedRowEvent: Event;
  private _allRowElements: HTMLTableRowElement[];
  private _songTableState: SongTableState;

  constructor() {
    this._body = document.querySelector("#songs-table tbody") as HTMLTableElement;
    this._selectedRowEl = null;
    this._selectedRowEvent = new Event("song-selected");
    this._allRowElements = [];
    this._songTableState = {
      rowSelected: false
    }
  }
  get selectedRowEl(): HTMLTableRowElement | null {
    return this._selectedRowEl;
  }
  public get songTableState(): SongTableState {
    return this.songTableState;
  }

  render(songs: Song[]) {
    songs.map((song, idx) => {
      this._body.appendChild(this.createRowEl(song, idx + 1));
    });
    this._allRowElements = [...this._body.querySelectorAll<HTMLTableRowElement>("tr.data-row")];
  }

  createRowEl(song: Song, order: number): HTMLTableRowElement {
    const newRowEl = document.createElement("tr");
    newRowEl.innerHTML = `
      <tr>
        <td><div class="data-cell">${order}</div></td>
        <td><div class="data-cell" title="${song.title}">${song.title}</div></td>
        <td><div class="data-cell" title="${song.author}">${song.author}</div></td>
        <td><div class="data-cell" title="${song.singer}">${song.singer}</div></td>
        <td><div class="data-cell" title="${song.duration}">${song.duration}</div></td>
      </tr>
    `;
    newRowEl.classList.add("data-row");
    newRowEl.setAttribute("data-id", song.id);
    this.addTableRowEvents(newRowEl);
    return newRowEl;
  }

  addTableRowEvents(tableRowEl: HTMLTableRowElement): void {
    // rows events
    tableRowEl.addEventListener('dblclick', (e: MouseEvent) => {
      const target = e.target as HTMLTableRowElement;
      const clickedRow = target.closest("tr");
      if (!clickedRow || !tableRowEl.dataset.id) return;
      const id = clickedRow.dataset.id;
      if (!id) return;
      this.setSelectedRow(id);
    });
  };

  applySelectedStyle(selectedRowEl: HTMLTableRowElement) {
    this._body.querySelector<HTMLTableRowElement>(`tr.song-playing`)
      ?.classList
      .remove("song-playing");
    selectedRowEl.classList.add("song-playing");
  }

  setSelectedRow(
    songId: string,
  ): void {
    let targetRow: HTMLTableRowElement;
    let index: number = this._allRowElements.findIndex((trEl: HTMLTableRowElement) => {
      return trEl.dataset.id === songId
    });
    targetRow = this._allRowElements[index];
    this._selectedRowEl = targetRow;
    this.applySelectedStyle(this._selectedRowEl);
    this._songTableState.rowSelected = true;
    document.dispatchEvent(this._selectedRowEvent);
  }
}