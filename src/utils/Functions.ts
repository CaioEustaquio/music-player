export class Functions {
  
    static toMinutes(time: number): number {
        return Math.floor(time / 60);
    }

    static toSeconds(minutes: number, time: number): number {
        return Math.floor(time - minutes * 60);
    }

    static padTo2Digits(num: number): string {
        return num.toString().padStart(2, '0');
    }
}