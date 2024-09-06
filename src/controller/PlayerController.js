import Fetch from "./../utils/Fetch.js";

class PlayerController{

  constructor(){

      this._data;
      this._tableBodyEl = document.querySelector("#desktop-songs-table tbody");

      this.init();
  }

  get data(){
      return this._data;
  }
  set data(data){
      this._data = data;
      return this;
  }

  async init(){

    const songs = await this.getSongs();
    this._data = songs;

    this.render();

  }

  render(){

    // rendering songs on table
    this._data.map(song =>{

      let trContent = `
        <tr class="data-row">
          <td>${song.id}</td>
          <td>${song.title}</td>
          <td>${song.author}</td>
          <td>${song.singer}</td>
          <td>${song.duration}</td>
        </tr>`;

      this._tableBodyEl.innerHTML += trContent;
    });
  }

  async getSongs(){

      try{

          const songs = await Fetch.get("data.json");

          return songs;

      }catch(error){
        return [];
      };
  }
}

export default PlayerController;