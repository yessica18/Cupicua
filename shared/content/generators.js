// Registro único de generadores de ejercicios de CAPICÚA.
import { RNG } from './gen-core.js';
import { arith } from './gen-arith.js';
import { algebra } from './gen-algebra.js';
import { geometry } from './gen-geometry.js';
import { stats, linear } from './gen-stats-linear.js';
import { calculus } from './gen-calc.js';
import { physics, electro, projects } from './gen-physics.js';
import { CONCEPT_BANK } from './concept-bank.js';

export const GENS = { ...arith, ...algebra, ...geometry, ...stats, ...linear, ...calculus, ...physics, ...electro };

/** Preguntas conceptuales redactadas a mano (para niveles abstractos). */
for (const key of Object.keys(CONCEPT_BANK)) {
  GENS[`concept:${key}`] = (r) => {
    const item = CONCEPT_BANK[key][r.int(0, CONCEPT_BANK[key].length - 1)];
    const order = r.shuffle(item.choices.map((c, i) => i));
    return {
      difficulty: 1, type: 'choice', prompt: item.q, choices: order.map((i) => item.choices[i]), answer: order.indexOf(item.answer),
      hints: item.hints || ['Piensa en la definición.', 'Descarta lo que sabes que es falso.', 'Relaciona con un ejemplo concreto.'],
      steps: [item.explain], why: item.why || '',
    };
  };
}

export const hasGen = (id) => Boolean(GENS[id]);

/** Genera una pregunta determinista (misma semilla → mismo ejercicio). */
export function makeQuestion(gen, seed = 1, difficulty = 1) {
  const fn = GENS[gen];
  if (!fn) throw new Error(`Generador desconocido: ${gen}`);
  const q = fn(new RNG(seed * 7919 + difficulty * 104729), difficulty);
  q.gen = gen; q.seed = seed; q.difficulty = difficulty;
  while (q.hints.length < 3) q.hints.push(q.hints[q.hints.length - 1] || 'Relee el enunciado y escribe lo que sabes.');
  return q;
}

export function makeProject(id, seed = 1) {
  const fn = projects[id];
  if (!fn) throw new Error(`Proyecto desconocido: ${id}`);
  const p = fn(new RNG(seed * 31337));
  p.id = id; p.seed = seed;
  p.parts.forEach((q, i) => { q.gen = `project:${id}`; q.seed = seed; q.part = i; while (q.hints.length < 3) q.hints.push('Usa el resultado de la parte anterior.'); });
  return p;
}

export const PROJECT_IDS = Object.keys(projects);
