class Utils{

    static toMinutes(time){
        return Math.floor(time / 60);
    }

    static toSeconds(minutes, time){
        return Math.floor(time - minutes * 60);
    }

    static padTo2Digits(num){
        return num.toString().padStart(2, '0');
    }
}