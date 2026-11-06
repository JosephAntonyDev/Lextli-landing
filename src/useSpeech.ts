import { useEffect, useRef, useState } from "react";

export type SpeechStatus =
  "idle" | "loading" | "playing" | "unavailable" | "error";

/** Own one utterance, including delayed callbacks from cancelled requests. */
export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const sequence = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const cleanup = useRef<() => void>(() => {});

  function stop() {
    sequence.current += 1;
    cleanup.current();
    cleanup.current = () => {};
    if (utterance.current) {
      utterance.current.onstart = null;
      utterance.current.onend = null;
      utterance.current.onerror = null;
      utterance.current = null;
    }
    window.speechSynthesis?.cancel();
  }

  useEffect(() => {
    // Voice enumeration is lazy in several browsers. Warm it up before a tap.
    window.speechSynthesis?.getVoices();
    return stop;
  }, []);

  function reset() {
    stop();
    setStatus("idle");
  }

  function speak(text: string) {
    stop();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setStatus("unavailable");
      return;
    }
    const synth = window.speechSynthesis;
    const id = sequence.current;
    setStatus("loading");
    let launched = false;
    let voiceTimer: ReturnType<typeof setTimeout>;
    let startTimer: ReturnType<typeof setTimeout>;
    let endTimer: ReturnType<typeof setTimeout>;
    const clear = () => {
      clearTimeout(voiceTimer);
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      synth.removeEventListener("voiceschanged", voicesReady);
    };
    cleanup.current = clear;
    const finish = (result: SpeechStatus) => {
      if (sequence.current !== id) return;
      clear();
      utterance.current = null;
      setStatus(result);
    };
    const launch = () => {
      if (launched || sequence.current !== id) return;
      launched = true;
      clearTimeout(voiceTimer);
      synth.removeEventListener("voiceschanged", voicesReady);
      const speech = new SpeechSynthesisUtterance(text);
      const voices = synth
        .getVoices()
        .filter((voice) => /^en(?:-|_)/i.test(voice.lang));
      // Prefer a local voice: no network startup delay and no remote voice outage.
      const voice =
        voices.find((item) => item.localService && item.lang === "en-US") ??
        voices.find((item) => item.localService) ??
        voices[0];
      if (voice) speech.voice = voice;
      speech.lang = voice?.lang ?? "en-US";
      speech.rate = 0.85;
      utterance.current = speech; // Keep alive until the browser finishes.
      const timeout = () => {
        if (sequence.current !== id) return;
        stop();
        setStatus("error");
      };
      speech.onstart = () => {
        if (sequence.current !== id) return;
        clearTimeout(startTimer);
        setStatus("playing");
        endTimer = setTimeout(timeout, 30000);
      };
      speech.onend = () => finish("idle");
      speech.onerror = (event) => {
        if (sequence.current !== id) return;
        finish(
          event.error === "canceled" || event.error === "interrupted"
            ? "idle"
            : "error",
        );
      };
      startTimer = setTimeout(timeout, 12000);
      try {
        if (synth.paused) synth.resume();
        synth.speak(speech);
      } catch {
        finish("error");
      }
    };
    function voicesReady() {
      if (synth.getVoices().length) launch();
    }
    // Use the current gesture immediately when voices have already loaded.
    if (synth.getVoices().length) launch();
    else {
      synth.addEventListener("voiceschanged", voicesReady);
      voiceTimer = setTimeout(launch, 1200);
    }
  }
  return { status, speak, reset };
}
