export namespace AudioUtils {
    export const isPlaying = (audioElement: HTMLAudioElement) =>
        !!audioElement && !audioElement.paused && !audioElement.ended && audioElement.readyState > 2;
}
