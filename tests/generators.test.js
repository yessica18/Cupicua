// Sistema de calidad: cada generador se ejecuta con cientos de semillas y se verifica
// que (1) no falle, (2) su respuesta se acepte, (3) una respuesta incorrecta se rechace,
// (4) su comprobación numérica independiente (selfcheck) sea verdadera.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GENS, makeQuestion, makeProject, PROJECT_IDS } from '../shared/content/generators.js';
import { checkAnswer } from '../shared/math/check.js';

function canonical(q) {
  switch (q.type) {
    case 'choice': return q.answer;
    case 'tf': return q.answer;
    case 'numeric': return String(q.answer);
    case 'frac': return String(q.answer);
    case 'expr': return q.answer;
    case 'set': return q.answer.join(', ');
    case 'tuple': case 'direction': return q.answer.join(', ');
    case 'matrix': return q.answer.map((r) => r.map(String));
    case 'complex': return `${q.answer.re}${q.answer.im >= 0 ? '+' : '-'}${Math.abs(q.answer.im)}i`;
    case 'primefac': return q.answer.join('*');
    default: throw new Error('tipo: ' + q.type);
  }
}
function wrong(q) {
  switch (q.type) {
    case 'choice': return (q.answer + 1) % q.choices.length;
    case 'tf': return !q.answer;
    case 'numeric': case 'frac': return String(q.answer + Math.max(1, Math.abs(q.answer) * 0.5) + 3);
    case 'expr': return `(${q.answer})+x*x*x+7`;
    case 'set': return q.answer.map((v) => v + 11).join(', ');
    case 'tuple': case 'direction': return q.answer.map((v, i) => (i === 0 ? v + 7 : v)).join(', ') + ',0,0'.slice(0, 0);
    case 'matrix': return q.answer.map((r) => r.map((v) => String(v + 5)));
    case 'complex': return `${q.answer.re + 3}+${q.answer.im + 4}i`;
    case 'primefac': return '2*2*2*2*2*2*2';
    default: return 'x';
  }
}

for (const gen of Object.keys(GENS)) {
  test(`generador ${gen}`, () => {
    for (const d of [1, 2, 3]) {
      for (let seed = 1; seed <= 120; seed++) {
        const q = makeQuestion(gen, seed, d);
        const ctx = `${gen} d${d} seed${seed}: ${q.prompt}`;
        assert.ok(q.prompt && q.prompt.length > 5, ctx);
        assert.ok(q.hints.length >= 3 && q.hints.every((h) => typeof h === 'string' && h.length), 'pistas ' + ctx);
        assert.ok(q.steps.length >= 1, 'pasos ' + ctx);
        const ok = checkAnswer(q, canonical(q));
        assert.ok(ok.ok, `respuesta propia rechazada (${JSON.stringify(canonical(q))}): ${ctx} ${JSON.stringify(ok)}`);
        if (q.selfcheck) assert.ok(q.selfcheck(), 'selfcheck ' + ctx);
        const bad = checkAnswer(q, wrong(q));
        assert.ok(!bad.ok, `respuesta incorrecta aceptada (${wrong(q)}): ${ctx}`);
        if (q.type === 'numeric' || q.type === 'frac') assert.ok(Number.isFinite(q.answer), ctx);
      }
    }
  });
}

test('proyectos multi-parte', () => {
  for (const id of PROJECT_IDS) for (let seed = 1; seed <= 40; seed++) {
    const p = makeProject(id, seed);
    assert.ok(p.parts.length >= 3);
    for (const q of p.parts) { assert.ok(checkAnswer(q, canonical(q)).ok, `${id} ${q.prompt}`); }
  }
});

test('las semillas producen variantes distintas', () => {
  for (const gen of ['linear_eq', 'frac_ops', 'quadratic_eq', 'deriv_poly']) {
    const set = new Set();
    for (let s = 1; s <= 40; s++) set.add(makeQuestion(gen, s, 2).prompt);
    assert.ok(set.size > 20, `${gen} repite demasiado (${set.size})`);
  }
});
