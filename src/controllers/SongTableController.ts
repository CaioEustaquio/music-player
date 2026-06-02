import { Song } from "@appTypes/song";
import { SongTableUI } from "@ui/player/SongTableUI";
import { SongService } from "@service/SongService";

const songService = new SongService();

export class SongTableController {
  private _songTableUI: SongTableUI;

  constructor(
    songTableUI: SongTableUI
  ) {
    this._songTableUI = songTableUI;
    this.init();
  }

  async init() {
    await songService.fetchSongs();
    this._songTableUI.render(songService.allSongs);
  }

  async getSelectedSongData(): Promise<Song | null> {
    try {
      if (!this._songTableUI.selectedRowEl) {
        throw new Error("Song not selected");
      }
      const id = this._songTableUI.selectedRowEl.dataset.id;
      if (!id) {
        throw new Error("Song id invalid")
      }
      const song = await songService.getOne(id);
      return song;

    } catch (err: any) {
      console.error(err.message);
      return null;
    }
  }

  async setRandomSong(currentSongId: string): Promise<void> {
    const randomSong = await songService.getRandom(currentSongId);
    this._songTableUI.setSelectedRow(randomSong.id);
  }
  rowSelected() {
    return this._songTableUI.selectedRowEl ? true : false;
  }
  async skip(
    action: "backward" | "forward",
    currentSongId: string
  ): Promise<void> {
    let song;
    switch (action) {
      case "backward":
        song = await songService.getPreviousSong(currentSongId);
        break;
      default:
        song = await songService.getNextSong(currentSongId);
        break;
    }
    this._songTableUI.setSelectedRow(song.id);
  }
};