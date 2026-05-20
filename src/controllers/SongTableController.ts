import { Song } from "@appTypes/song";
import mockSongs from "@data/mockSongs.json"

export class SongTableController {
  private _body: HTMLTableElement;
  private _songsData: Song[]
  private _selectedRowEl: HTMLTableRowElement | null;
  private _allRowElements: HTMLTableRowElement[];
  private _selectedSongEvent: Event;
  private _lastRandomSongId: string;

  constructor() {
    this._body = document.querySelector("#desktop-songs-table tbody") as HTMLTableElement;
    this._songsData = []
    this._selectedRowEl = null;
    this._allRowElements = [];
    this._selectedSongEvent = new Event("song-selected");
    this._lastRandomSongId = "";
    this.init();
  }

  get body() {
    return this._body;
  }

  get songsData(): Song[] {
    return this._songsData;
  }
  set songsData(songsData) {
    this._songsData = songsData;
  }

  get selectedRowEl(): HTMLTableRowElement | null {
    return this._selectedRowEl;
  }

  set selectedRowEl(selectedRowEl: HTMLTableRowElement | null) {
    this._selectedRowEl = selectedRowEl;
  }

  get selectedRowEvent(): Event {
    return this._selectedSongEvent;
  }

  async init() {
    this.songsData = await this.fetchSongs();
    await this.renderRows();
    this._allRowElements = [...this.body.querySelectorAll<HTMLTableRowElement>("tr.data-row")];
  }

  // rendering row on table
  async renderRows(): Promise<void> {
    await this.songsData.map((song, idx) => {
      this.body.appendChild(this.createRowEl(song, idx + 1));
    });
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
    newRowEl.setAttribute("data-image", song.image);
    newRowEl.setAttribute("data-title", song.title);
    newRowEl.setAttribute("data-author", song.author);
    newRowEl.setAttribute("data-duration", song.duration);
    newRowEl.setAttribute("data-file", song.file);
    this.addTableRowEvents(newRowEl);
    return newRowEl;
  }

  addTableRowEvents(tableRowEl: HTMLTableRowElement): void {
    // rows events
    tableRowEl.addEventListener('dblclick', (e: MouseEvent) => {
      const target = e.target as HTMLTableRowElement;
      const clickedRow = target.closest("tr");
      if (!clickedRow || !tableRowEl.dataset.id) return;
      this.selectedRowEl = clickedRow as HTMLTableRowElement;
      this.applySelectedStyle(this.selectedRowEl);
      this.body.dispatchEvent(this.selectedRowEvent);
    });
  };

  private async fetchSongs(): Promise<Song[]> {
    try {
      return mockSongs as Song[];

    } catch (error: any) {
      console.error(error.message);
      return [];
    };
  }
  applySelectedStyle(selectedRowEl: HTMLTableRowElement) {
    this.body.querySelector<HTMLTableRowElement>(`tr.song-playing`)
      ?.classList
      .remove("song-playing");
    selectedRowEl.classList.add("song-playing");
  }

  getSelectedSongData(): Song {
    const id = this.selectedRowEl?.dataset.id;
    return this.songsData.find(song => song.id === id)!;
  }

  // skip(action: 'backward' | 'forward') {
  //   let index: number;
  //   let songId: string;
  //   // console.log(this.selectedRowEl)
  //   // console.log(this._allRowElements);
  //   console.log(this._allRowElements.findIndex((trEl:) => trEl.dataset === this.selectedRowEl))
  //   if (action == "backward") {
  //     index = this.songsData.findIndex((song: Song) => song.id === this.currentSongPlayingId) - 1;
  //     index = index < 0 ? 0 : index;
  //     songId = this._songTable.songsData[index].id;
  //   } else {
  //     if (this.songPlayerInShuffle) {
  //       index = this.getRandomSong();
  //       songId = this._songTable.songsData[index].id;
  //     } else {

  //       index = this._songTable.songsData.findIndex((song: Song) => song.id === this.currentSongPlayingId) + 1;
  //       index = index > this._songTable.songsData.length ? this._songTable.songsData.length : index;
  //       songId = this._songTable.songsData[index].id;
  //     }
  //   }
  //   this.selectedRowEl = clickedRow as HTMLTableRowElement;
  //   this.applySelectedStyle(this.selectedRowEl);
  //   // this.setSelectedSong(songId);
  //   // this.startSong();
  // }

  skip(
    action: 'backward' | 'forward',
    playerInShuffle: boolean = false
  ): void {
    if (!this.selectedRowEl) return;

    let targetRow: HTMLTableRowElement;
    if (!playerInShuffle) {
      let index: number = this._allRowElements.findIndex((trEl: HTMLTableRowElement) => {
        return trEl.dataset.id === this.selectedRowEl?.dataset.id
      });
      if (action === "backward") {
        index = Math.max(0, index - 1);
      } else {
        index = Math.min(this._allRowElements.length - 1, index + 1);
      }
      targetRow = this._allRowElements[index];
    } else {
      targetRow = this.getRandomRow();
    }

    this.selectedRowEl = targetRow;
    this.applySelectedStyle(this.selectedRowEl);
    this.body.dispatchEvent(this.selectedRowEvent);
  }

  getRandomRow(): HTMLTableRowElement {
    const randomSong = Math.floor(Math.random() * this._allRowElements.length);
    const randomRowEl = this._allRowElements[randomSong];
    if (randomRowEl.dataset.id === this._lastRandomSongId) {
      return this.getRandomRow();
    } else if (this._allRowElements.length <= 1) {
      return this._allRowElements[0];
    }
    this._lastRandomSongId = randomRowEl.dataset.id!;
    return randomRowEl;
  }
};