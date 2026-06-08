import { Song } from "@appTypes/song";
import mockSongs from "@data/mockSongs.json"

export class SongService {
  private _allSongs: Song[];

  constructor() {
    this._allSongs = [];
  }

  get allSongs(): Song[] {
    return this._allSongs;
  }

  public async fetchSongs(): Promise<void> {
    try {
      this._allSongs = mockSongs as Song[];
    } catch (error: any) {
      console.error(error.message);
    };
  }

  public async getOne(id: string): Promise<Song> {
    try {
      const song = await this.allSongs.find(song => song.id === id);
      if (!song) {
        throw new Error("Song not found");
      }
      return song;
    } catch (error: any) {
      console.error(error.message);
      return {} as Song;
    }
  }

  public async getRandom(currentSongId: string): Promise<Song> {
    let randomSong: Song;
    do {
      const randomId = await Math.floor(Math.random() * this.allSongs.length);
      randomSong = this.allSongs[randomId];
    } while (randomSong.id === currentSongId);
    return randomSong;
  }

  public async getPreviousSong(currentSongId: string): Promise<Song> {
    let index = await this.allSongs.findIndex(song => song.id === currentSongId) - 1;
    index = index < 0 ? 0 : index;
    return this.allSongs[index];
  }
  public async getNextSong(currentSongId: string): Promise<Song> {
    let index = await this.allSongs.findIndex(song => song.id === currentSongId) + 1;
    const songsLength = this.allSongs.length - 1;
    index = index > songsLength ? songsLength : index;
    return this.allSongs[index];
  }
}