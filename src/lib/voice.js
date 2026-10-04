// Voz de CAPIA (síntesis del navegador) y reconocimiento de voz. Sin servidores: todo local.
const cfg = { on: true, rate: 1, volume: 0.8, pitch: 1.12 };
export const setVoice = (o) => Object.assign(cfg, o);
let voices = [];
const load = () => { voices = speechSynthesis?.getVoices?.() || []; };
if ('speechSynthesis' in window) { load(); speechSynthesis.onvoiceschanged = load; }
const FEMALE = /(helena|sabina|paulina|monica|mónica|laura|lucia|lucía|elvira|dalia|camila|female|femenin|google español|google us español|salome|paloma|marisol|esperanza|sofia|sofía)/i;
function bestVoice() {
  const es = voices.filter((v) => /^es/i.test(v.lang));
  return es.find((v) => FEMALE.test(v.name)) || es.find((v) => /natural|online|neural/i.test(v.name)) || es[0] || voices[0];
}
export const voiceAvailable = () => 'speechSynthesis' in window;
export const clean = (t) => String(t).replace(/\$\$?([^$]+)\$\$?/g, (_, m) => ' ' + m.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 sobre $2').replace(/\\sqrt\{([^}]*)\}/g, 'raíz de $1').replace(/\\[a-z]+/gi, ' ').replace(/[{}^_]/g, ' ') + ' ').replace(/\*\*/g, '').replace(/`/g, '').replace(/[•→]/g, ',').replace(/\s+/g, ' ').trim();

let queue = [];
export function speak(text, { force = false, onend } = {}) {
  if (!voiceAvailable() || (!cfg.on && !force)) return;
  stopSpeaking();
  const parts = clean(text).match(/[^.!?¡¿:;\n]+[.!?:;]?/g) || [];
  queue = parts.map((p) => p.trim()).filter(Boolean);
  const next = () => {
    const s = queue.shift(); if (!s) { onend?.(); return; }
    const u = new SpeechSynthesisUtterance(s); const v = bestVoice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-ES';
    u.rate = cfg.rate; u.pitch = cfg.pitch; u.volume = cfg.volume; u.onend = next; u.onerror = next;
    speechSynthesis.speak(u);
  };
  next();
}
export function stopSpeaking() { queue = []; if (voiceAvailable()) speechSynthesis.cancel(); }
export const pauseSpeaking = () => speechSynthesis?.pause?.();
export const resumeSpeaking = () => speechSynthesis?.resume?.();
export const isSpeaking = () => voiceAvailable() && speechSynthesis.speaking;

export const listenAvailable = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export function listen({ onresult, onend, onerror }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { onerror?.(new Error('Tu navegador no ofrece reconocimiento de voz. Usa Chrome.')); return null; }
  stopSpeaking(); // interrupción de voz: si hablas, CAPIA se calla
  const r = new SR(); r.lang = 'es-ES'; r.interimResults = true; r.continuous = false;
  r.onresult = (e) => { const t = [...e.results].map((x) => x[0].transcript).join(' '); onresult?.(t, e.results[e.results.length - 1].isFinal); };
  r.onend = () => onend?.(); r.onerror = (e) => onerror?.(new Error(e.error === 'not-allowed' ? 'Permite el micrófono para hablar con CAPIA.' : 'No te escuché bien, intenta de nuevo.'));
  r.start(); return r;
}
