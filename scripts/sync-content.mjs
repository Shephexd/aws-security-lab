#!/usr/bin/env node
/**
 * Obsidian 볼트(Security-SA) → Docusaurus docs/ 변환 + 고객용 재구성 파이프라인.
 *
 * 볼트는 SA 개인 학습 KB(원본)로 두고, 이 스크립트가 *고객용 부분집합*을 생성한다.
 *   1. 내부 전용 섹션 제외 (Customer-Engagement, Certifications, 최상위 학습 MOC)
 *   2. 고객 여정 기준 9-Part 로 재그룹/재정렬 (학습 번호 01~99 → 고객 목차)
 *   3. 내부 학습 화법 정리(scrub): "마스터하면 답할 질문/핵심역량" 제거,
 *      "면접·단골" 접미사 제거, "고객 대화 포인트"→"핵심 고려사항", L5 프레이밍 제거
 *   4. Obsidian 콜아웃/위키링크/프론트매터 → Docusaurus 호환 변환
 *   5. content-overrides/ 오버레이로 고객용 홈 등 페이지 덮어쓰기(원본 무수정)
 *
 * 사용:  npm run sync   (소스 경로는 CONTENT_DIR 환경변수로 변경 가능, 기본 ../Security-SA)
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import GithubSlugger from 'github-slugger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.resolve(PROJECT_ROOT, process.env.CONTENT_DIR || '../Security-SA');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const OVERRIDES_DIR = path.join(PROJECT_ROOT, 'content-overrides');

// 소스 볼트가 없으면(CI 등) 커밋된 docs/ 를 유지하고 종료.
if (!fs.existsSync(CONTENT_DIR)) {
  console.log(`ℹ️  소스 볼트 없음(${CONTENT_DIR}) — 기존 docs/ 유지, 변환 건너뜀.`);
  process.exit(0);
}

// ───────────────────────── 고객용 목차 정의 (9-Part) ─────────────────────────
// 단일 섹션 Part → 평탄화(Part 라벨이 곧 카테고리). 복수 섹션 Part → 중첩 카테고리.
const GUIDE = [
  {num: 1, slug: 'foundations', label: '1 · 보안 기초', sections: [{src: '01-Foundations'}]},
  {num: 2, slug: 'identity-access', label: '2 · 자격증명 & 접근 관리', sections: [{src: '02-IAM-Identity'}]},
  {num: 3, slug: 'infrastructure-network', label: '3 · 인프라 & 네트워크 보안', sections: [{src: '03-Network-Infra'}]},
  {num: 4, slug: 'data-protection', label: '4 · 데이터 보호', sections: [{src: '04-Data-Protection'}]},
  {num: 5, slug: 'application-workload', label: '5 · 애플리케이션 & 워크로드', sections: [
    {src: '09-AppSec-Workload', slug: 'appsec', label: '애플리케이션 보안'},
    {src: '10-AI-ML-Security', slug: 'ai-ml', label: 'AI/ML 보안'},
  ]},
  {num: 6, slug: 'detection-response', label: '6 · 탐지 & 대응', sections: [
    {src: '05-Detection-Monitoring', slug: 'detection', label: '탐지 & 모니터링'},
    {src: '06-Incident-Response', slug: 'incident-response', label: '인시던트 대응'},
  ]},
  {num: 7, slug: 'resilience', label: '7 · 복원력 & 랜섬웨어', sections: [{src: '07-Resilience-Ransomware'}]},
  {num: 8, slug: 'governance-compliance', label: '8 · 거버넌스 & 컴플라이언스', sections: [{src: '08-Compliance-Governance'}]},
  {num: 9, slug: 'advanced', label: '9 · 고급 & 신기술', sections: [{src: '11-Advanced-Emerging'}]},
];
const APPENDIX = {slug: 'references', label: '부록 · 참고자료', position: 90, sections: [{src: '99-References'}]};

// 고객 문서에서 제외 (내부 전용)
const EXCLUDE_SECTIONS = new Set(['20-Customer-Engagement', '90-Certifications']);
const EXCLUDE_DIRS = new Set(['_templates', '.obsidian', '.git']);
const isExcludedFile = (name) => name.endsWith('.base') || name.startsWith('.');

// 소스 폴더 → 배치 정보 / 카테고리 스펙 구성
const placement = new Map(); // srcFolder → {baseDir}
const categories = []; // {dir, label, position, generatedIndex}
for (const part of GUIDE) {
  const nested = part.sections.length > 1;
  // position +1: 0=시작하기, 1=솔루션 패키지(오버레이), 2~ = 지식베이스 Part
  categories.push({dir: part.slug, label: part.label, position: part.num + 1});
  part.sections.forEach((s, i) => {
    const baseDir = nested ? `${part.slug}/${s.slug}` : part.slug;
    placement.set(s.src, {baseDir});
    if (nested) categories.push({dir: baseDir, label: s.label, position: i + 1});
  });
}
placement.set(APPENDIX.sections[0].src, {baseDir: APPENDIX.slug});
categories.push({dir: APPENDIX.slug, label: APPENDIX.label, position: APPENDIX.position});

// Obsidian 콜아웃 → Docusaurus admonition 타입
const CALLOUT_MAP = {
  note: 'note', info: 'info', summary: 'info', abstract: 'info', tldr: 'info',
  tip: 'tip', hint: 'tip', important: 'tip', success: 'tip',
  warning: 'warning', caution: 'warning', attention: 'warning',
  danger: 'danger', error: 'danger', failure: 'danger', bug: 'danger',
};

let unresolvedLinks = 0;
const unresolvedSamples = [];

// ───────────────────────── 유틸 ─────────────────────────
function slugifyHeading(s) {
  return GithubSlugger.slug(s.trim());
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return {title: null, tags: [], body: content};
  const fm = m[1];
  const body = m[2];
  let title = null;
  const tm = fm.match(/^title:\s*(.+)$/m);
  if (tm) title = tm[1].trim().replace(/^["']|["']$/g, '');
  let tags = [];
  const inline = fm.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (inline) {
    tags = inline[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  } else {
    const block = fm.match(/^tags:\s*\r?\n((?:\s*-\s*.+\r?\n?)+)/m);
    if (block) {
      tags = block[1].split(/\r?\n/).map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }
  return {title, tags, body};
}

function splitByCodeFences(text) {
  const parts = [];
  const lines = text.split('\n');
  let buf = [];
  let inFence = false;
  let fenceToken = '';
  for (const line of lines) {
    const fenceMatch = line.match(/^(\s*)(```+|~~~+)/);
    if (fenceMatch) {
      const token = fenceMatch[2];
      if (!inFence) {
        parts.push({code: false, text: buf.join('\n')});
        buf = [line];
        inFence = true;
        fenceToken = token[0];
      } else if (token[0] === fenceToken) {
        buf.push(line);
        parts.push({code: true, text: buf.join('\n')});
        buf = [];
        inFence = false;
      } else {
        buf.push(line);
      }
      continue;
    }
    buf.push(line);
  }
  parts.push({code: inFence, text: buf.join('\n')});
  return parts;
}

/** 헤딩으로 구분된 섹션 통째 제거 (제목이 re에 매치되면 다음 동급/상위 헤딩까지 삭제) */
function removeSection(text, re) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const h = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (h && re.test(h[2])) {
      const level = h[1].length;
      i++;
      while (i < lines.length) {
        const h2 = lines[i].match(/^(#{1,6})\s/);
        if (h2 && h2[1].length <= level) break;
        i++;
      }
      while (out.length && out[out.length - 1].trim() === '') out.pop();
      out.push('');
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

// 본문 내 SA/학습/시험 관점 화법 → 고객 중립 화법 (순서대로 적용)
const PHRASE_FIXES = [
  // 위협모델링 §1 내부 프레이밍 문장
  [/서비스 나열형 SA와 컨설팅형 SA의 차이가 여기서 갈린다\.\s*고객 화이트보드 앞에서/g, '아키텍처를 마주했을 때'],
  // SA 관점 주어/소유격 치환 (구체적인 것 먼저)
  [/SA가 고객 대화에 쓰는 구조/g, '이해를 돕는 구조'],
  [/SA의 가치는/g, '핵심은'],
  [/SA의 핵심 도구/g, '핵심 도구'],
  [/SA의 역할/g, '핵심'],
  // 학습/시험 화법
  [/\s*SCS 시험 단골이자\s*/g, ' '],
  [/,?\s*SCS 시험 단골\.?/g, '.'],
  // SA 주어 제거 ("RSA는/ECDSA는" 등은 ASCII \b 덕분에 영향 없음)
  [/\bSA는\s*/g, ''],
  [/\bSA가\s*/g, ''],
  // 제외 섹션(고객 대면/자격증 도구)으로 향하는 화살표 참조 제거
  [/\s*→[^→\n]*\[\[(?:20-Customer-Engagement|90-Certifications)\/[^\]]*\]\]/g, ''],
];

/** 내부 학습 화법 정리 (코드 밖 텍스트에만 적용) */
function scrubInternalVoice(text) {
  // 1) 내부 전용 섹션 제거
  text = removeSection(text, /마스터하면 답할 수 있는 질문/);
  text = removeSection(text, /^핵심 역량\s*$/);
  // 2) 헤딩 정리 — 학습/시험/훈계 접미사(괄호·대시) 제거, 섹션명/FAQ 통일
  const HEAD_KW =
    '면접|단골|L5|고객 대면|시험·실무|SCS 시험|시험 단골|숙지|설명할 수 있어야|보드 레벨 안건|보드 안건|지금 알아둘|반드시 구분';
  const paren = new RegExp(`\\s*[（(][^()（）]*(${HEAD_KW})[^()（）]*[)）]\\s*$`, 'g');
  const dash = new RegExp(`\\s*[—-]\\s*[^—\\-\\n]*(${HEAD_KW})[^—\\-\\n]*$`, 'g');
  text = text.split('\n').map((line) => {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (!h) return line;
    let t = h[2].replace(paren, '').replace(dash, '');
    if (/^노트\s*$/.test(t.trim())) t = '세부 섹션';
    if (/^Dive Deeper\s*$/i.test(t.trim())) t = '관련';
    if (/^핵심 질문\s*$/.test(t.trim())) t = '자주 받는 질문';
    t = t.replace(/고객 대화 포인트/g, '자주 받는 질문');
    if (/함정$/.test(t) && !/흔한 함정$/.test(t)) t = t.replace(/함정$/, '흔한 함정');
    return `${h[1]} ${t}`;
  }).join('\n');
  // 3) 내부 학습 프레이밍 인용줄 제거 (콜아웃은 '> [!' 이라 영향 없음)
  text = text.split('\n').filter((line) => !/^>\s.*L5\s*차별점/.test(line)).join('\n');
  // 4) 본문 화법 치환 (SA 관점/시험/제외 참조) + 강조 기호 정리
  for (const [re, rep] of PHRASE_FIXES) text = text.replace(re, rep);
  text = text.replace(/면접·/g, '');
  text = text.replace(/★\s?/g, ''); // 내부 "심화" 강조 마커 제거
  return text;
}

function makeWikiLinkConverter(currentOut, linkMap) {
  return (text) =>
    text.replace(/\[\[([^\]]+)\]\]/g, (full, inner) => {
      let [target, alias] = inner.split('|');
      let [pathPart, heading] = target.split('#');
      pathPart = pathPart.trim();
      const base = pathPart.split('/').pop();
      if (!pathPart && heading) {
        return `[${(alias || heading).trim()}](#${slugifyHeading(heading)})`;
      }
      const entry = linkMap.byBase.get(base) || linkMap.byPath.get(pathPart);
      const display = (alias || (entry && entry.title) || base).trim();
      if (!entry) {
        unresolvedLinks++;
        if (unresolvedSamples.length < 20) unresolvedSamples.push(target);
        return display;
      }
      let rel = path.relative(path.dirname(currentOut), entry.out).split(path.sep).join('/');
      if (!rel.startsWith('.')) rel = './' + rel;
      if (heading) rel += '#' + slugifyHeading(heading);
      return `[${display}](${rel})`;
    });
}

/** 코드 블록 내 위키링크: 공백 없는 노트링크 형태만 표시텍스트로(실제 코드 보존) */
function stripWikiLinksInCode(text) {
  return text.replace(/\[\[([\w./-]+)(?:\|([^\]\n]+))?\]\]/g, (m, p, alias) => (alias ? alias.trim() : p.split('/').pop()));
}

function convertCallouts(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^>\s*\[!([a-zA-Z]+)\]([+-]?)\s?(.*)$/);
    if (m) {
      const type = CALLOUT_MAP[m[1].toLowerCase()] || 'note';
      const title = m[3].trim();
      const content = [];
      i++;
      while (i < lines.length && /^>/.test(lines[i])) {
        content.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      while (content.length && content[0].trim() === '') content.shift();
      while (content.length && content[content.length - 1].trim() === '') content.pop();
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      out.push(title ? `:::${type}[${title}]` : `:::${type}`);
      out.push(...content);
      out.push(':::');
      out.push('');
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

function transformBody(body, currentOut, linkMap) {
  const convertLinks = makeWikiLinkConverter(currentOut, linkMap);
  return splitByCodeFences(body)
    .map((part) =>
      part.code
        ? stripWikiLinksInCode(part.text)
        : convertLinks(convertCallouts(scrubInternalVoice(part.text))),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function yamlStr(s) {
  return JSON.stringify(s);
}

// 내부 분류 태그 정리 → 고객용 주제 태그
const TAG_MAP = {
  'domain/foundations': '기초', 'domain/network': '네트워크', 'domain/data': '데이터보호',
  'domain/detection': '탐지·대응', 'domain/ir': '탐지·대응', 'domain/resilience': '복원력',
  'domain/compliance': '거버넌스', 'domain/appsec': '워크로드', 'domain/aiml': 'AI보안',
  'domain/advanced': '고급', 'domain/iam': '자격증명', 'domain/identity': '자격증명',
  'korea/isms-p': '한국규제', 'korea/fsi': '한국규제', 'korea/csap': '한국규제', 'korea/pipa': '한국규제',
  'war': 'well-architected',
};
// 가독성을 위해 매핑된 주제 태그만 유지(granular 영문 태그 난립 방지)
function normalizeTags(tags) {
  const out = new Set();
  for (const t of tags) {
    if (TAG_MAP[t]) out.add(TAG_MAP[t]);
  }
  return [...out];
}

// ───────────────────── 1단계: 수집 + 출력 경로 결정 ─────────────────────
function collectFiles(dir, rel = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name) || EXCLUDE_SECTIONS.has(entry.name)) continue;
      files.push(...collectFiles(path.join(dir, entry.name), path.join(rel, entry.name)));
    } else if (entry.name.endsWith('.md') && !isExcludedFile(entry.name)) {
      files.push(path.join(rel, entry.name));
    }
  }
  return files;
}

/** 소스 상대경로 → 출력 정보(또는 null=제외) */
function planOutput(relPath) {
  const dir = path.dirname(relPath);
  const base = path.basename(relPath, '.md');
  if (dir === '.') return null; // 최상위 학습 MOC 등 → 고객 홈은 오버레이로 대체
  const place = placement.get(dir);
  if (!place) return null;
  if (/^00-.*MOC$/i.test(base)) return {outRel: `${place.baseDir}/index.md`, baseDir: place.baseDir, isIndex: true};
  return {outRel: `${place.baseDir}/${base}.md`, baseDir: place.baseDir, isIndex: false};
}

const linkMap = {byBase: new Map(), byPath: new Map()};
const plans = [];
for (const rel of collectFiles(CONTENT_DIR)) {
  const plan = planOutput(rel);
  if (!plan) continue;
  const src = path.join(CONTENT_DIR, rel);
  const raw = fs.readFileSync(src, 'utf8');
  const {title, tags, body} = parseFrontmatter(raw);
  const outAbs = path.join(DOCS_DIR, plan.outRel);
  const base = path.basename(rel, '.md');
  const entry = {out: outAbs, title: title || base};
  linkMap.byBase.set(base, entry);
  linkMap.byPath.set(rel.replace(/\.md$/, ''), entry);
  plans.push({rel, title, tags, body, plan, outAbs});
}

// ───────────────────── 2단계: 변환 + 출력 ─────────────────────
fs.rmSync(DOCS_DIR, {recursive: true, force: true});
fs.mkdirSync(DOCS_DIR, {recursive: true});

// baseDir 별 비-index 문서 정렬 → sidebar_position
const byBaseDir = new Map();
for (const p of plans) {
  if (p.plan.isIndex) continue;
  if (!byBaseDir.has(p.plan.baseDir)) byBaseDir.set(p.plan.baseDir, []);
  byBaseDir.get(p.plan.baseDir).push(p);
}
const positionOf = new Map();
for (const [, docs] of byBaseDir) {
  docs.sort((a, b) => path.basename(a.outAbs).localeCompare(path.basename(b.outAbs)));
  docs.forEach((d, idx) => positionOf.set(d.outAbs, idx + 1));
}

// 섹션 인덱스(MOC) 제목을 고객용 한국어 라벨로(번호 prefix 제거)
const labelOf = new Map(categories.map((c) => [c.dir, c.label.replace(/^\d+\s*·\s*/, '')]));

for (const p of plans) {
  let newBody = transformBody(p.body, p.outAbs, linkMap);
  let title = p.title || path.basename(p.rel, '.md');
  const fm = ['---'];
  if (p.plan.isIndex) {
    // MOC 인덱스: 제목을 한국어 섹션명으로, 본문 첫 H1(영문/이모지) 제거 → 제목이 H1이 됨
    title = labelOf.get(p.plan.baseDir) || title;
    newBody = newBody.replace(/^\s*#\s+[^\n]*\n+/, '');
    fm.push(`title: ${yamlStr(title)}`);
    fm.push('sidebar_label: ' + yamlStr('개요'), 'sidebar_position: 0');
  } else {
    fm.push(`title: ${yamlStr(title)}`);
    fm.push('sidebar_label: ' + yamlStr(title));
    const pos = positionOf.get(p.outAbs);
    if (pos) fm.push(`sidebar_position: ${pos}`);
  }
  const tags = normalizeTags(p.tags || []);
  if (tags.length) {
    fm.push('tags:');
    for (const t of tags) fm.push(`  - ${yamlStr(t)}`);
  }
  fm.push('---', '');
  fs.mkdirSync(path.dirname(p.outAbs), {recursive: true});
  fs.writeFileSync(p.outAbs, fm.join('\n') + newBody.replace(/^\s+/, '') + '\n', 'utf8');
}

// _category_.json 생성 (index.md 가 곧 카테고리 링크가 되므로 link 불필요)
for (const c of categories) {
  const dir = path.join(DOCS_DIR, c.dir);
  if (!fs.existsSync(dir)) continue;
  const json = {label: c.label, position: c.position, collapsible: true, collapsed: true};
  fs.writeFileSync(path.join(dir, '_category_.json'), JSON.stringify(json, null, 2) + '\n', 'utf8');
}

// index.md 가 없는 카테고리에 개요 페이지 합성
// (멀티 섹션 Part 부모, 부록 등 — 클릭 시 404 방지 + 실제 랜딩 제공)
function ensureIndex(dir, title, links) {
  const idx = path.join(dir, 'index.md');
  if (!fs.existsSync(dir) || fs.existsSync(idx)) return;
  const body =
    `---\ntitle: ${yamlStr(title)}\nsidebar_label: ${yamlStr('개요')}\nsidebar_position: 0\n---\n\n` +
    `# ${title}\n\n이 영역은 다음 세부 섹션으로 구성됩니다.\n\n${links.join('\n')}\n`;
  fs.writeFileSync(idx, body, 'utf8');
}
for (const part of GUIDE) {
  if (part.sections.length < 2) continue;
  ensureIndex(
    path.join(DOCS_DIR, part.slug),
    part.label,
    part.sections.map((s) => `- [${s.label}](./${s.slug}/index.md)`),
  );
}
// 부록: 단일 문서로 구성 → 개요에서 연결
ensureIndex(path.join(DOCS_DIR, APPENDIX.slug), APPENDIX.label, ['- [참고 링크 모음](./reference-links.md)']);

// ───────────────────── 3단계: 오버레이 적용 (원본 무수정 고객용 페이지) ─────────────────────
function applyOverrides(srcDir, relBase = '') {
  if (!fs.existsSync(srcDir)) return 0;
  let n = 0;
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    const srcPath = path.join(srcDir, entry.name);
    const relPath = path.join(relBase, entry.name);
    if (entry.isDirectory()) {
      n += applyOverrides(srcPath, relPath);
    } else if (!entry.name.startsWith('.')) {
      const dest = path.join(DOCS_DIR, relPath);
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      fs.copyFileSync(srcPath, dest);
      n++;
    }
  }
  return n;
}
const overlaid = applyOverrides(OVERRIDES_DIR);

// ───────────────────── 리포트 ─────────────────────
console.log(`✅ 고객용 변환 완료: ${plans.length}개 문서 → docs/`);
console.log(`   Part: ${GUIDE.length}개 + 부록 / 제외 섹션: ${[...EXCLUDE_SECTIONS].join(', ')}`);
console.log(`   오버레이 적용: ${overlaid}개 (content-overrides/)`);
if (unresolvedLinks) {
  console.log(`ℹ️  텍스트 처리된 링크(제외 섹션 등 가리킴): ${unresolvedLinks}개`);
  console.log(`    예: ${[...new Set(unresolvedSamples)].slice(0, 8).join(', ')}`);
} else {
  console.log('   위키링크: 전부 해결됨');
}
