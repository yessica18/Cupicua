import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS, ALL_LEVELS, LEVEL_BY_ID } from '../shared/content/regions.js';
import { makeQuestion, parseGenSpec, GENS, PROJECT_IDS } from '../shared/content/generators.js';
import { checkAnswer } from '../shared/math/check.js';

test('12 regiones con 16 niveles y un jefe final cada una', () => {
  assert.equal(REGIONS.length, 12);
  for (const r of REGIONS) {
    assert.equal(r.levels.length, 16, r.id);
    assert.ok(r.levels[15].boss, `${r.id} jefe`);
    assert.ok(r.boss.name && r.weapon && r.landmark);
  }
});

test('requisitos válidos y sin ciclos', () => {
  for (const lv of ALL_LEVELS) for (const q of lv.req) {
    assert.ok(LEVEL_BY_ID[q], `${lv.id} requiere ${q}`);
    assert.ok(LEVEL_BY_ID[q].n < lv.n, `${lv.id} requiere un nivel posterior ${q}`);
  }
});

test('todos los niveles tienen generadores resolubles', () => {
  for (const lv of ALL_LEVELS) {
    assert.ok(lv.idea && lv.idea.length > 20, lv.id);
    for (const spec of lv.gens) {
      if (spec.startsWith('project:')) { assert.ok(PROJECT_IDS.includes(spec.slice(8)), `${lv.id} ${spec}`); continue; }
      const { gen } = parseGenSpec(spec);
      assert.ok(GENS[gen], `${lv.id}: generador ${gen} no existe`);
      for (let s = 1; s <= 25; s++) {
        const q = makeQuestion(spec, s, lv.baseDiff);
        assert.ok(q.prompt, `${lv.id} ${spec}`);
      }
    }
  }
});
