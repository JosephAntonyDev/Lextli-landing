// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeech } from "./useSpeech";

class Utterance {
  text: string;
  voice: unknown;
  lang = "";
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
const localVoice = { lang: "en-US", localService: true, name: "Local English" };
let voices: (typeof localVoice)[];
let spoken: Utterance[];
let events: EventTarget;
let synth: SpeechSynthesis;

beforeEach(() => {
  vi.useFakeTimers();
  voices = [localVoice];
  spoken = [];
  events = new EventTarget();
  synth = {
    getVoices: vi.fn(() => voices),
    speak: vi.fn((utterance: Utterance) => spoken.push(utterance)),
    cancel: vi.fn(),
    resume: vi.fn(),
    paused: false,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  } as unknown as SpeechSynthesis;
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Speech lifecycle", () => {
  it("waits for lazy voices and clears loading on playback, without a false error", () => {
    voices = [];
    const { result } = renderHook(useSpeech);
    act(() => result.current.speak("Little by little, we grow."));
    expect(result.current.status).toBe("loading");
    expect(spoken).toHaveLength(0);
    act(() => {
      voices = [localVoice];
      events.dispatchEvent(new Event("voiceschanged"));
    });
    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice).toBe(localVoice);
    act(() => spoken[0].onstart?.());
    expect(result.current.status).toBe("playing");
    act(() => spoken[0].onend?.());
    expect(result.current.status).toBe("idle");
    act(() => vi.advanceTimersByTime(31000));
    expect(result.current.status).toBe("idle");
  });
  it("ignores delayed cancellation errors from a previous utterance", () => {
    const { result } = renderHook(useSpeech);
    act(() => result.current.speak("First."));
    const staleError = spoken[0].onerror;
    act(() => result.current.speak("Second."));
    act(() => {
      staleError?.({ error: "interrupted" });
      spoken[1].onstart?.();
    });
    expect(result.current.status).toBe("playing");
    act(() => spoken[1].onend?.());
    expect(result.current.status).toBe("idle");
  });
  it("falls back to the default voice after a bounded wait and allows retry after failure", () => {
    voices = [];
    const { result } = renderHook(useSpeech);
    act(() => result.current.speak("Hello."));
    act(() => vi.advanceTimersByTime(1200));
    expect(spoken).toHaveLength(1);
    act(() => spoken[0].onerror?.({ error: "network" }));
    expect(result.current.status).toBe("error");
    voices = [localVoice];
    act(() => result.current.speak("Hello."));
    expect(result.current.status).toBe("loading");
    act(() => spoken[1].onstart?.());
    expect(result.current.status).toBe("playing");
  });
  it("unlocks after silent startup failure and cleans up when navigating away", () => {
    const { result, unmount } = renderHook(useSpeech);
    act(() => result.current.speak("Hello."));
    act(() => vi.advanceTimersByTime(12000));
    expect(result.current.status).toBe("error");
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    act(() => result.current.speak("Again."));
    unmount();
    expect(spoken[1].onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
