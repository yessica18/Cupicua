import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, recordAttempt, completeLesson, masteryOf, touchStreak, nextExercise, planExam, dayKey, applyDiagnostic, prereqGaps, dailyChallenge, recordRetention, setRestDay, addDays } from '../shared/engine/game.js';
import { checkAchievements, ACHIEVEMENTS } from '../shared/engine/achievements.js';
import { levelMastery } from '../shared/engine/mastery.js';
import { reviewSrs } from '../shared/engine/srs.js';
import { searchAll, encyclopedia } from '../shared/content/encyclopedia.js';
import { makeQuestion } from '../shared/content/generators.js';

test('la maestría exige retención: sin repaso exitoso no pasa de 80%', () => {
  const s = newState();
  for (let i = 0; i < 60; i++) recordAttempt(s, { levelId: 'algebra.10', spec: i % 2 ? 'linear_eq' : 'linear_eq@2', seed: i, difficulty: 1 + (i % 3), correct: true, qType: i % 3 ? 'numeric' : 'choice' });
  s.levels['algebra.10'].app = 3; s.levels['algebra.10'].explain = 3;
  assert.ok(masteryOf(s, 'algebra.10').pct <= 80, 'tope sin repasos');
  recordRetention(s, 'algebra.10', true); recordRetention(s, 'algebra.10', true); recordRetention(s, 'algebra.10', true);
  assert.ok(masteryOf(s, 'algebra.10').pct >= 90, 'con retención sube: ' + masteryOf(s, 'algebra.10').pct);
});

test('el tiempo conectado no sube la maestría', () => {
  const s = newState(); s.stats.minutes = 10000;
  assert.equal(masteryOf(s, 'aritmetica.1').pct, 0);
});

test('equivocarse recompensa el intento y registra el error', () => {
  const s = newState();
  const r = recordAttempt(s, { levelId: 'algebra.10', spec: 'linear_eq', seed: 1, correct: false, msg: 'Olvidaste restar' });
  assert.ok(r.xp > 0); assert.equal(s.errors.length, 1);
  recordAttempt(s, { levelId: 'algebra.10', spec: 'linear_eq', seed: 2, correct: true });
  assert.equal(s.stats.errorsOvercome, 1);
});

test('racha amable: descanso y protección no la rompen', () => {
  const s = newState();
  touchStreak(s, new Date('2026-03-01T10:00:00'));
  assert.equal(s.streak.count, 1);
  setRestDay(s, '2026-03-02');
  touchStreak(s, new Date('2026-03-03T10:00:00'));
  assert.equal(s.streak.count, 2);
  // saltar 2 días: solo 1 protección → se rompe
  touchStreak(s, new Date('2026-03-06T10:00:00'));
  assert.equal(s.streak.count, 1);
  assert.ok(s.streak.lost);
});

test('lección completa da XP/PI y programa un repaso', () => {
  const s = newState();
  const r = completeLesson(s, 'aritmetica.1', { correct: 5, total: 5, errors: 0, hints: 0, kind: 'lesson' });
  assert.ok(r.xp >= 50 && r.pi >= 10);
  assert.ok(s.srs['aritmetica.1'].due > Date.now());
});

test('selección adaptativa nunca repite la misma semilla', () => {
  const s = newState(); const seen = new Set();
  for (let i = 0; i < 50; i++) { const e = nextExercise(s, 'algebra.10'); const k = `${e.spec}|${e.seed}`; assert.ok(!seen.has(k)); seen.add(k); makeQuestion(e.spec, e.seed, e.difficulty); }
});

test('plan de parcial incluye simulacro y descanso', () => {
  const topics = ['Factorización', 'Ecuaciones', 'Funciones', 'Sistemas'].map((name) => ({ name }));
  const p = planExam({ subject: 'Álgebra', topics, date: addDays(dayKey(), 12) });
  assert.equal(p.plan.length, 12);
  assert.ok(p.plan.some((d) => d.items.some((i) => i.type === 'simulacro')));
  assert.ok(p.plan.some((d) => d.items.some((i) => i.type === 'rest')));
});

test('prerrequisitos débiles se recomiendan, no se bloquean', () => {
  const s = newState();
  const gaps = prereqGaps(s, 'algebra.1');
  assert.ok(gaps.length >= 1);
});

test('logros: cientos y se conceden', () => {
  assert.ok(ACHIEVEMENTS.length >= 300);
  const s = newState(); recordAttempt(s, { levelId: 'aritmetica.1', spec: 'place_value', seed: 1, correct: true });
  const fresh = checkAchievements(s);
  assert.ok(fresh.some((a) => a.id === 'primera-pregunta'));
});

test('enciclopedia y buscador interno', () => {
  assert.ok(encyclopedia().length > 250);
  assert.ok(searchAll('derivada').some((r) => r.title.toLowerCase().includes('derivada')));
  assert.ok(searchAll('pitagoras').length > 0);
  assert.ok(searchAll('laboratorio mecanica').length > 0);
});

test('desafío diario es determinista por fecha', () => {
  assert.deepEqual(dailyChallenge('2026-05-05'), dailyChallenge('2026-05-05'));
});

test('SRS: fallar acorta el intervalo, acertar lo alarga', () => {
  let s = reviewSrs(null, 5, 0); s = reviewSrs(s, 5, 1); s = reviewSrs(s, 5, 2);
  assert.ok(s.interval >= 6);
  const f = reviewSrs(s, 1, 3);
  assert.equal(f.interval, 1);
});
