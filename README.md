# Security Lab Guide

AWS · 클라우드 · 코어 보안 **고객용 가이드**. [Docusaurus](https://docusaurus.io/) 기반 정적 사이트로 **GitHub Pages**에 배포됩니다.

두 축으로 구성됩니다:

1. **보안 지식베이스** (9-Part) — 원리 중심 콘텐츠. 출처는 Obsidian 학습 볼트(`../Security-SA`)이며 sync로 고객용 부분집합을 생성.
2. **솔루션 패키지** (`content-overrides/solutions/`) — 운영 환경에 배포 가능한 패키지. 각 솔루션은 관련 보안 영역(Part)과 정렬.

## 콘텐츠 소스 — 2종

| 소스 | 위치 | 성격 | docs/ 반영 |
| --- | --- | --- | --- |
| **학습 볼트** | `../Security-SA` (Obsidian) | SA 개인 KB(원본) | sync가 *고객용 필터·재구성*해서 생성 |
| **오버레이** | `content-overrides/` (이 저장소) | 발행 전용 고객 콘텐츠(홈·솔루션) | sync 마지막에 그대로 덮어씀 |

`docs/` 는 두 소스에서 생성되는 산출물이며, CI 배포를 위해 **커밋**합니다.

```
Obsidian 볼트(../Security-SA)   ──  npm run sync  ──▶   docs/   ──  build  ──▶  GitHub Pages
  · [[위키링크]]                      (변환)              · 마크다운 링크
  · > [!callout]                                          · :::admonition
```

변환 스크립트(`scripts/sync-content.mjs`)가 하는 일:

- Obsidian 콜아웃 `> [!type] 제목` → Docusaurus admonition `:::type[제목]`
- 위키링크 `[[note]]` / `[[path|별칭]]` / `[[note#heading]]` → 상대경로 마크다운 링크 (앵커는 github-slugger로 정확히 계산)
- 프론트매터를 Docusaurus 호환(`title`/`tags`/`sidebar_*`)으로 정리
- 학습 번호(01~99) 폴더를 **고객 여정 9-Part**로 재그룹·재정렬, 깔끔한 slug(`/foundations`)로
- **내부 전용 섹션 제외**: `20-Customer-Engagement`, `90-Certifications`, 최상위 학습 MOC
- **내부 학습 화법 정리(scrub)**: "마스터하면 답할 질문/핵심 역량" 섹션 제거, "면접·단골" 접미사 제거, "고객 대화 포인트"→"핵심 고려사항"
- 마지막에 `content-overrides/` 오버레이를 덮어써 고객용 홈·솔루션 페이지 반영
- `_templates/`, `*.base`, `.obsidian/` 등 볼트 전용 파일은 제외

### 솔루션 패키지 추가

1. `templates/solution-template.md` → `content-overrides/solutions/<slug>.md` 복사
2. 섹션을 채우고 **관련 보안 영역**에서 지식베이스 Part로 링크, 배포 에셋(IaC/스크립트) 링크 연결
3. `content-overrides/solutions/index.md` 카탈로그 표에 한 줄 추가
4. `npm run sync && npm run build`

> 볼트(`../Security-SA`)가 없는 환경(예: CI)에서는 sync가 자동으로 건너뛰고 커밋된 `docs/` 를 그대로 빌드합니다.
> 소스 경로는 `CONTENT_DIR` 환경변수로 변경할 수 있습니다.

### 문서 수정 절차

1. **Obsidian 볼트에서** 노트를 편집 (`../Security-SA`).
2. `npm run sync` (또는 `npm start`) 로 `docs/` 재생성.
3. `docs/` 변경분을 함께 커밋 후 푸시 → CI가 자동 빌드·배포.

## 다이어그램 추가

정책: **간단한 플로우는 Mermaid, 복잡한 AWS 아키텍처는 draw.io → PNG**.

| 유형 | 방법 |
| --- | --- |
| 간단한 플로우·시퀀스·계정구조·데이터흐름 | **Mermaid**(내장) — 본문에 ` ```mermaid ` 코드블럭. 다크모드 자동, 버전관리 용이 |
| 복잡한 AWS 아이콘 아키텍처 | **draw.io**(diagrams.net)로 그려 **PNG export**(2x 권장) → `static/img/diagrams/<name>.png` 에 두고 `![설명](/img/diagrams/<name>.png)` 로 임베드. 편집 가능하도록 **원본 `.drawio` 도 같은 폴더에 커밋** |
| AWS 공식 발행 다이어그램(SRA/ASR 등) | 원본 이미지에 **출처 표기**하여 `static/img/diagrams/` 임베드 |

Mermaid 예시(코드블럭 안에 작성):

```
flowchart LR
  A["클라이언트"] --> B["API Gateway"] --> C["Lambda"] --> D[("DynamoDB")]
```

> 검색 기능: **오프라인 로컬 검색**(`@easyops-cn/docusaurus-search-local`, 한/영) — 외부 서비스 없이 GitHub Pages에서 동작.
> 태그: 문서 프론트매터의 태그가 `/tags` 페이지로 자동 노출되며, sync가 내부 분류 태그를 고객용 주제 태그로 정리합니다.

## 로컬 개발

```bash
npm install      # 최초 1회
npm start        # 볼트 동기화 후 http://localhost:3000 개발 서버
npm run sync     # docs/ 만 재생성
npm run build    # 동기화 후 정적 빌드 → build/
npm run serve    # 빌드 결과 로컬 미리보기
```

## 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포합니다.

### 최초 설정 (1회)

1. **GitHub 저장소 생성** 후 코드 푸시 (`docs/` 포함).
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
3. `docusaurus.config.ts` 상단의 값 확인:
   - `ORG` — GitHub 사용자명/조직명 (현재: `shephexd`)
   - `REPO` — 저장소 이름 (현재: `securitylab-gitpage`)
   - 사용자 페이지(`<user>.github.io` 저장소)로 배포한다면 `baseUrl` 을 `/` 로 변경.

배포 후 주소: `https://<ORG>.github.io/<REPO>/`

## 구조

```
.
├── docs/                    # 생성된 문서 (커밋 대상, 직접 편집 금지)
│   ├── intro.md             # 홈 (볼트 00-MOC.md 에서 생성)
│   ├── foundations/         # 01-Foundations
│   ├── iam-identity/        # 02-IAM-Identity
│   └── ...                  # 그 외 섹션
├── scripts/sync-content.mjs # Obsidian → Docusaurus 변환기
├── src/css/custom.css       # 테마 색상
├── static/                  # 정적 자산 (logo.svg, .nojekyll)
├── docusaurus.config.ts     # 사이트 설정
├── sidebars.ts              # 폴더 구조 자동 사이드바
└── .github/workflows/       # GitHub Pages 배포
```
