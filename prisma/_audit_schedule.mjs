/**
 * Audita prisma/seed.ts: bloques de 30 franjas, horas por asignatura y solapes de profesor.
 */
import fs from 'fs';

const seed = fs.readFileSync('prisma/seed.ts', 'utf8');

// --- subjects (orden de inserción = id 1..N) ---
const subjStart = seed.indexOf('prisma.subject.createMany');
const subjEnd = seed.indexOf('// Crear grupos', subjStart);
const subjects = [];
for (const m of seed.slice(subjStart, subjEnd).matchAll(/hours:\s*(\d+)/g)) {
  subjects.push({ id: subjects.length + 1, hours: +m[1] });
}

// --- assignments ---
const asgStart = seed.indexOf('teacherOnSubjectOnGroup.createMany');
const asgEnd = seed.indexOf('//Creando horarios', asgStart);
const assignments = [];
for (const m of seed
  .slice(asgStart, asgEnd)
  .matchAll(/idTeacher:\s*(\d+),\s*\n\s*idSubject:\s*(\d+),\s*\n\s*idGroup:\s*(\d+)/g)) {
  assignments.push({
    id: assignments.length + 1,
    teacher: +m[1],
    subject: +m[2],
    group: +m[3],
  });
}

// --- weekSchedule entries (orden) ---
const wsStart = seed.indexOf('prisma.weekSchedule.createMany');
const wsEnd = seed.indexOf('//CLASS SESSIONS', wsStart);
const slots = [];
for (const m of seed
  .slice(wsStart, wsEnd)
  .matchAll(
    /idTeacherAssignment:\s*(\d+),[\s\S]*?weekDay:\s*'(\w+)',[\s\S]*?startTime:\s*'([^']+)'/g,
  )) {
  slots.push({ assignmentId: +m[1], day: m[2], start: m[3] });
}

const BLOCK_NAMES = [
  '1 DAM mañana',
  '1 DAM tarde',
  '1 DAW mañana',
  '1 ASIR mañana',
  '1 SMR mañana',
  '1 DAW tarde',
  '1 IT mañana',
  '1 ME mañana',
  '2 DAM mañana',
  '2 DAM tarde',
  '2 DAW mañana',
  '2 DAW tarde',
  '2 ASIR mañana',
  '2 SMR mañana',
  '2 IT mañana',
  '2 ME mañana',
];

console.log('=== RESUMEN ===');
console.log(`Asignaturas: ${subjects.length}`);
console.log(`Assignments: ${assignments.length}`);
console.log(`Franjas weekSchedule: ${slots.length}`);
console.log(`Bloques esperados (×30): ${slots.length / 30}`);
console.log('');

// --- 1) Bloques de 30 ---
console.log('=== BLOQUES (30 franjas cada uno) ===');
let blockOk = true;
if (slots.length % 30 !== 0) {
  console.log(`❌ Total ${slots.length} no es múltiplo de 30`);
  blockOk = false;
}
for (let b = 0; b < Math.ceil(slots.length / 30); b++) {
  const chunk = slots.slice(b * 30, b * 30 + 30);
  const name = BLOCK_NAMES[b] ?? `bloque ${b + 1}`;
  const ok = chunk.length === 30;
  if (!ok) blockOk = false;
  const aids = [...new Set(chunk.map((s) => s.assignmentId))].sort((a, b) => a - b);
  console.log(
    `${ok ? '✓' : '❌'} ${name}: ${chunk.length} franjas | assignments ${aids[0]}–${aids[aids.length - 1]} (${aids.length} distintos)`,
  );
}
console.log('');

// --- 2) Horas por assignment dentro de cada bloque ---
console.log('=== HORAS POR ASIGNATURA (por bloque) ===');
let hoursOk = true;
for (let b = 0; b < Math.floor(slots.length / 30); b++) {
  const chunk = slots.slice(b * 30, b * 30 + 30);
  const name = BLOCK_NAMES[b] ?? `bloque ${b + 1}`;
  const counts = new Map();
  for (const s of chunk) {
    counts.set(s.assignmentId, (counts.get(s.assignmentId) ?? 0) + 1);
  }
  const issues = [];
  for (const [aid, cnt] of counts) {
    const a = assignments[aid - 1];
    const expected = subjects[a.subject - 1]?.hours;
    if (expected === undefined) {
      issues.push(`asig.${aid} subject ${a.subject} sin horas`);
    } else if (cnt !== expected) {
      issues.push(
        `asig.${aid} (subj ${a.subject}, prof ${a.teacher}): ${cnt} franjas, esperadas ${expected}`,
      );
    }
  }
  // assignments del bloque que deberían estar pero tienen 0
  const inBlock = new Set(chunk.map((s) => s.assignmentId));
  const blockAids = [...counts.keys()];
  const minA = Math.min(...blockAids);
  const maxA = Math.max(...blockAids);
  for (let aid = minA; aid <= maxA; aid++) {
    if (!inBlock.has(aid)) {
      const a = assignments[aid - 1];
      const expected = subjects[a.subject - 1]?.hours;
      if (expected > 0)
        issues.push(`asig.${aid} (subj ${a.subject}): 0 franjas, esperadas ${expected}`);
    }
  }
  if (issues.length) {
    hoursOk = false;
    console.log(`❌ ${name}:`);
    for (const i of issues) console.log(`   - ${i}`);
  } else {
    const sum = [...counts.values()].reduce((a, b) => a + b, 0);
    console.log(`✓ ${name}: ${sum} franjas, horas OK`);
  }
}
console.log('');

// --- 3) Solapes globales de profesor ---
console.log('=== SOLAPES DE PROFESOR (misma hora) ===');
const busy = new Map(); // teacher|day|start -> [{aid, block}]
for (let i = 0; i < slots.length; i++) {
  const s = slots[i];
  const a = assignments[s.assignmentId - 1];
  const blockIdx = Math.floor(i / 30);
  const key = `${a.teacher}|${s.day}|${s.start}`;
  if (!busy.has(key)) busy.set(key, []);
  busy.get(key).push({
    assignmentId: s.assignmentId,
    block: BLOCK_NAMES[blockIdx] ?? `bloque ${blockIdx + 1}`,
    teacher: a.teacher,
    subject: a.subject,
  });
}

let overlapCount = 0;
for (const [key, entries] of busy) {
  if (entries.length < 2) continue;
  overlapCount++;
  const [teacher, day, start] = key.split('|');
  const blocks = [...new Set(entries.map((e) => e.block))];
  const aids = entries.map((e) => e.assignmentId).join(', ');
  console.log(
    `❌ Prof ${teacher} | ${day} ${start} | ${entries.length} clases | asig [${aids}] | ${blocks.join(' + ')}`,
  );
}
if (overlapCount === 0) console.log('✓ Ningún profesor en dos sitios a la misma hora');
else console.log(`\nTotal solapes: ${overlapCount}`);
console.log('');

// --- 4) Assignments con franjas fuera de su bloque esperado (heurística) ---
console.log('=== FRANJAS CON ASSIGNMENT FUERA DEL RANGO DEL BLOQUE ===');
let crossBlock = 0;
for (let b = 0; b < Math.floor(slots.length / 30); b++) {
  const chunk = slots.slice(b * 30, b * 30 + 30);
  const aids = chunk.map((s) => s.assignmentId);
  const minA = Math.min(...aids);
  const maxA = Math.max(...aids);
  const outliers = aids.filter((id) => id < minA || id > maxA);
  if (outliers.length) {
    crossBlock++;
    console.log(`❌ ${BLOCK_NAMES[b]}: assignment fuera de rango ${minA}-${maxA}`);
  }
}
if (crossBlock === 0) console.log('✓ Cada bloque solo usa su rango contiguo de assignments');

process.exit(blockOk && hoursOk && overlapCount === 0 ? 0 : 1);
