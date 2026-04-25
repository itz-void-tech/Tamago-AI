'use client';

// Voice hooks: Groq Whisper STT (with Web Speech fallback) + ElevenLabs TTS (with Web Speech fallback)
import { useState, useRef, useCallback } from 'react';

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (speaking || !text) return;
    setSpeaking(true);
    try {
      // Try ElevenLabs first
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok && res.headers.get('content-type')?.includes('audio')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => { setSpeaking(false); fallbackTTS(text); };
        await audio.play();
        return;
      }
      fallbackTTS(text);
    } catch {
      fallbackTTS(text);
    }
  }, [speaking]);

  const fallbackTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.15; u.pitch = 1.6; // high-pitched cute cat voice
      u.volume = 0.9;
      // Try to pick a cute/female voice for cat effect
      const voices = window.speechSynthesis.getVoices();
      const cute = voices.find(v => /zira|hazel|samantha|karen|female|child/i.test(v.name))
        || voices.find(v => v.lang.startsWith('en'));
      if (cute) u.voice = cute;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } else { setSpeaking(false); }
  };

  const stop = () => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return { speak, speaking, stop };
}

export function useSTT() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async (onResult: (text: string) => void) => {
    setListening(true);
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Try Groq Whisper
        try {
          const form = new FormData();
          form.append('audio', blob, 'audio.webm');
          const res = await fetch('/api/stt', { method: 'POST', body: form });
          const data = await res.json();
          if (data.text) { setTranscript(data.text); onResult(data.text); setListening(false); return; }
        } catch { /* fall through */ }
        // Fallback: Web Speech API
        fallbackSTT(onResult);
      };
      recorder.start();
      // Auto-stop after 10 seconds
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 10000);
    } catch {
      fallbackSTT(onResult);
    }
  }, []);

  const stopListening = () => {
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
    else setListening(false);
  };

  const fallbackSTT = (onResult: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setListening(false); return; }
    const recognition = new SR();
    recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onresult = (e: any) => { const t = e.results[0][0].transcript; setTranscript(t); onResult(t); };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  return { listening, transcript, startListening, stopListening };
}
