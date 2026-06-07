#!/usr/bin/env node
/**
 * 지식베이스 온톨로지 + 그래프 분석.
 *   - docs/ 의 모든 문서를 노드로, 내부 마크다운 링크를 엣지로 그래프 구성
 *   - 노드 유형/Part/Phase/태그를 온톨로지(Turtle + JSON)로 출력
 *   - 응집도(intra-section), 연결성(orphan/dead-end/components/degree) 분석 출력
 * 사용: node scripts/analyze-graph.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(ROOT, 'analysis');

// Phase ← Part ← section dir 매핑 (사이드바 구조와 일치)
const PHASE = {
  foundations: '기초',
  'identity-access': '예방', 'infrastructure-network': '예방', 'data-protection': '예방', 'application-workload': '예방',
  'detection-response': '운영', resilience: '운영',
  'governance-compliance': '거버넌스', advanced: '거버넌스',
  solutions: '솔루션', references: '부록',
};
const TOP = {
  intro: '홈', 'common-problems': '문제', 'security-journey': '여정',
};

function walk(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), path.join(rel, e.name)));
    else if (e.name.endsWith('.md')) out.push(path.join(rel, e.name));
  }
  return out;
}

// 파일 rel경로 → 노드 id (index/foldername 은 폴더로 접기, 최상위 슬러그 유지)
function toId(rel) {
  let id = rel.replace(/\\/g, '/').replace(/\.md$/, '');
  id = id.replace(/\/index$/, '');
  return id;
}
function section(id) {
  if (TOP[id]) return id;
  return id.split('/')[0];
}
function nodeType(id) {
  if (id === 'intro') return 'Home';
  if (id === 'common-problems') return 'ProblemCatalog';
  if (id === 'security-journey') return 'SecurityJourney';
  if (id === 'foundations/well-architected-alignment') return 'WAFAlignment';
  if (id.startsWith('solutions')) return id === 'solutions' ? 'SectionIndex' : 'Solution';
  if (id.startsWith('references')) return 'Reference';
  if (/(^|\/)[^/]+$/.test(id) && isIndexId.has(id)) return 'SectionIndex';
  return 'KnowledgeDoc';
}

function parseFront(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return {title: null, tags: [], body: txt};
  const fm = m[1];
  let title = (fm.match(/^title:\s*(.+)$/m) || [])[1];
  if (title) title = title.trim().replace(/^["']|["']$/g, '');
  const tags = [];
  const blk = fm.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m);
  if (blk) blk[1].split('\n').forEach((l) => {const t = l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''); if (t) tags.push(t);});
  const inl = fm.match(/^tags:\s*\[(.*)\]/m);
  if (inl) inl[1].split(',').forEach((t) => {t = t.trim().replace(/^["']|["']$/g, ''); if (t) tags.push(t);});
  return {title, tags, body: m[2]};
}

const files = walk(DOCS);
const isIndexId = new Set(files.filter((f) => /(^|\/)index\.md$/.test(f)).map(toId));

const nodes = new Map(); // id → {title, tags, type, section, phase, out:Set, in:Set, headings}
for (const rel of files) {
  const id = toId(rel);
  const txt = fs.readFileSync(path.join(DOCS, rel), 'utf8');
  const {title, tags, body} = parseFront(txt);
  const headings = (body.match(/^#{2,3}\s+/gm) || []).length;
  nodes.set(id, {id, title: title || id, tags, type: nodeType(id), section: section(id), phase: PHASE[section(id)] || TOP[id] || '기타', out: new Set(), in: new Set(), headings, rel});
}

// 엣지: 내부 .md 링크
const edges = [];
let externalLinks = 0;
for (const rel of files) {
  const id = toId(rel);
  const txt = fs.readFileSync(path.join(DOCS, rel), 'utf8');
  const dir = path.dirname(rel);
  const re = /\[[^\]]+\]\(([^)]+?)\)/g;
  let m;
  while ((m = re.exec(txt))) {
    let href = m[1].split('#')[0];
    if (/^https?:/.test(href)) {externalLinks++; continue;}
    if (!href.endsWith('.md')) continue;
    const targetRel = path.normalize(path.join(dir, href));
    const tid = toId(targetRel);
    if (tid === id) continue;
    if (nodes.has(tid)) {
      if (!nodes.get(id).out.has(tid)) {
        nodes.get(id).out.add(tid);
        nodes.get(tid).in.add(id);
        edges.push([id, tid]);
      }
    }
  }
}

// ── 분석 ──
const N = nodes.size, E = edges.length;
const arr = [...nodes.values()];
const entry = new Set(['intro', 'common-problems', 'security-journey']);
const orphans = arr.filter((n) => n.in.size === 0 && !entry.has(n.id) && n.type !== 'Home');
const deadends = arr.filter((n) => n.out.size === 0 && n.type !== 'Reference');
const hubs = [...arr].sort((a, b) => (b.in.size + b.out.size) - (a.in.size + a.out.size)).slice(0, 10);
const topIn = [...arr].sort((a, b) => b.in.size - a.in.size).slice(0, 8);

// 섹션 내부/교차 엣지
let intra = 0, inter = 0;
const secEdges = {};
for (const [s, t] of edges) {
  const ss = nodes.get(s).section, ts = nodes.get(t).section;
  if (ss === ts) intra++; else {inter++; const k = `${ss} → ${ts}`; secEdges[k] = (secEdges[k] || 0) + 1;}
}

// 약연결 컴포넌트
const seen = new Set(); let components = 0; let largest = 0;
for (const n of arr) {
  if (seen.has(n.id)) continue;
  components++; let size = 0; const stack = [n.id];
  while (stack.length) {
    const cur = stack.pop(); if (seen.has(cur)) continue; seen.add(cur); size++;
    for (const x of [...nodes.get(cur).out, ...nodes.get(cur).in]) if (!seen.has(x)) stack.push(x);
  }
  largest = Math.max(largest, size);
}

// 섹션별 응집도
const bySection = {};
for (const n of arr) {(bySection[n.section] ||= []).push(n);}
const cohesion = Object.entries(bySection).map(([s, ns]) => {
  const ids = new Set(ns.map((n) => n.id));
  let internal = 0, outward = 0;
  for (const n of ns) for (const t of n.out) (ids.has(t) ? internal++ : outward++);
  return {section: s, nodes: ns.length, internal, outward, ratio: (internal / (internal + outward || 1)).toFixed(2)};
}).sort((a, b) => b.nodes - a.nodes);

// ── 출력: 콘솔 리포트 ──
const L = (s) => console.log(s);
L(`\n=== 그래프 개요 ===`);
L(`노드 ${N} · 내부 엣지 ${E} · 외부 링크 ${externalLinks} · 평균 out-degree ${(E / N).toFixed(2)}`);
L(`약연결 컴포넌트 ${components}개 (최대 ${largest}/${N}, 연결률 ${(largest / N * 100).toFixed(0)}%)`);
L(`\n=== 연결성 ===`);
L(`고아(inbound 0, 진입점 제외): ${orphans.length}개`);
orphans.forEach((n) => L(`  - ${n.id} [${n.type}]`));
L(`막다른 노드(outbound 0, References 제외): ${deadends.length}개`);
deadends.slice(0, 20).forEach((n) => L(`  - ${n.id} [${n.type}]`));
L(`\n=== 허브 (in+out 상위) ===`);
hubs.forEach((n) => L(`  ${n.id}  (in ${n.in.size}, out ${n.out.size})`));
L(`\n=== 인기 대상 (inbound 상위) ===`);
topIn.forEach((n) => L(`  ${n.id}  ← ${n.in.size}`));
L(`\n=== 응집도 (섹션 내부 링크 비율) ===`);
cohesion.forEach((c) => L(`  ${c.section.padEnd(22)} 노드 ${String(c.nodes).padStart(2)} · 내부 ${String(c.internal).padStart(3)} · 외부 ${String(c.outward).padStart(3)} · 응집 ${c.ratio}`));
L(`\n전체 intra/inter 엣지: ${intra}/${inter} (intra 비율 ${(intra / (intra + inter) * 100).toFixed(0)}%)`);
L(`\n=== 주요 교차 흐름 (섹션 간 엣지 상위) ===`);
Object.entries(secEdges).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, v]) => L(`  ${k}: ${v}`));

// ── 출력: 온톨로지(Turtle) + JSON ──
fs.mkdirSync(OUT, {recursive: true});
const esc = (s) => String(s).replace(/"/g, '\\"');
let ttl = `@prefix sl: <https://securitylab/ontology#> .\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n`;
ttl += `# Classes\n`;
['Document','KnowledgeDoc','Solution','ProblemCatalog','SecurityJourney','WAFAlignment','SectionIndex','Reference','Home','Phase','Part','Tag']
  .forEach((c) => {ttl += `sl:${c} a rdfs:Class .\n`;});
ttl += `\n# Properties\n`;
['partOf','inPhase','hasTag','relatesTo'].forEach((p) => {ttl += `sl:${p} a rdf:Property .\n`;});
ttl += `\n# Instances\n`;
for (const n of arr) {
  const iri = `sl:${n.id.replace(/[^A-Za-z0-9_/-]/g, '_').replace(/[/]/g, '.')}`;
  ttl += `${iri} a sl:${n.type} ;\n  rdfs:label "${esc(n.title)}" ;\n  sl:partOf "${n.section}" ;\n  sl:inPhase "${n.phase}"`;
  for (const t of n.tags) ttl += ` ;\n  sl:hasTag "${esc(t)}"`;
  for (const o of n.out) ttl += ` ;\n  sl:relatesTo sl:${o.replace(/[^A-Za-z0-9_/-]/g, '_').replace(/[/]/g, '.')}`;
  ttl += ` .\n`;
}
fs.writeFileSync(path.join(OUT, 'knowledge-graph.ttl'), ttl);
fs.writeFileSync(path.join(OUT, 'knowledge-graph.json'), JSON.stringify({
  nodes: arr.map((n) => ({id: n.id, title: n.title, type: n.type, section: n.section, phase: n.phase, tags: n.tags, inDeg: n.in.size, outDeg: n.out.size})),
  edges: edges.map(([s, t]) => ({from: s, to: t})),
}, null, 2));
L(`\n온톨로지 출력: analysis/knowledge-graph.ttl, analysis/knowledge-graph.json`);
