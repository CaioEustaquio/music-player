export const toMinutes = (time: number): number => {
    return Math.floor(time / 60);
}
export const toSeconds = (minutes: number, time: number): number => {
    return Math.floor(time - minutes * 60);
}
export const padTo2Digits = (num: number): string => {
    return num.toString().padStart(2, '0');
}