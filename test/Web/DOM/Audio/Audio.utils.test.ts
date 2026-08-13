import { describe, expect, it } from "vitest";

import { AudioUtils } from "../../../../src/Web/DOM/Audio/Audio.utils";

const audio = (overrides: Partial<HTMLAudioElement>) =>
    ({ paused: false, ended: false, readyState: 4, ...overrides }) as HTMLAudioElement;

/**
 * `readyState > 2` is `HAVE_CURRENT_DATA`: an element that has been told to play but has not buffered a
 * frame yet is not playing, and treating it as though it were is what makes a switcher swap to a track
 * that is silent.
 */
describe("isPlaying", () => {
    it("is playing when it is running, unfinished and has data", () => {
        expect(AudioUtils.isPlaying(audio({}))).toBe(true);
    });

    it("is not playing when paused", () => {
        expect(AudioUtils.isPlaying(audio({ paused: true }))).toBe(false);
    });

    it("is not playing when it has reached the end", () => {
        expect(AudioUtils.isPlaying(audio({ ended: true }))).toBe(false);
    });

    it("is not playing while it is still buffering", () => {
        expect(AudioUtils.isPlaying(audio({ readyState: 2 as HTMLAudioElement["readyState"] }))).toBe(false);
        expect(AudioUtils.isPlaying(audio({ readyState: 3 as HTMLAudioElement["readyState"] }))).toBe(true);
    });

    it("is not playing when there is no element at all", () => {
        expect(AudioUtils.isPlaying(undefined as unknown as HTMLAudioElement)).toBe(false);
    });
});
