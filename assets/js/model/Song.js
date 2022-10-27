class Song{

    constructor(id, title, author, singer, duration, image, file){

        this._id = id;
        this._title = title;
        this._author = author;
        this._singer = singer;
        this._duration = duration;
        this._image = image;
        this._file = file;
    }

    get id(){
        return this._id;
    }
    set id(id){
        this._id = id;
    }

    get title(){
        return this._title;
    }
    set title(title){
        this._title = title;
    }

    get author(){
        return this._author;
    }
    set author(author){
        this._author = author;
    }

    get singer(){
        return this._singer;
    }
    set singer(singer){
        this._singer = singer;
    }

    get duration(){
        return this._duration;
    }
    set duration(duration){
        this._duration = duration;
    }

    get image(){
        return this._image;
    }
    set image(image){
        this._image = image;
    }

    get file(){
        return this._file;
    }
    set file(file){
        this._file = file;
    }
}