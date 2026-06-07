---
title: AWS 클라우드 보안 가이드
sidebar_label: 시작하기
sidebar_position: 0
slug: /
---

# AWS 클라우드 보안 가이드

클라우드와 기본 인프라 IT 보안을 **원리부터 실무 적용까지** 다루는 가이드입니다.
보안 기초 위에서 AWS 환경의 자격증명·네트워크·데이터·워크로드·운영·거버넌스를 어떻게 설계하는지 설명합니다.

이 가이드는 두 축으로 구성됩니다 — **보안 지식베이스**(원리)와 **솔루션 패키지**(운영 배포).

:::info 이 가이드의 관점
"어떤 AWS 서비스를 켜라"가 아니라 **"왜 그렇게 설계하는가"**, 그리고 **"운영 환경에 어떻게 배포하는가"** 에 초점을 둡니다.
기초(암호·인증·위협모델)는 클라우드 사업자에 무관한 일반 원리이며, 그 위에 AWS 구현과 배포 가능한 솔루션을 얹는 구조입니다.
:::

## 누구를 위한 가이드인가

| 대상 독자 | 이 가이드에서 얻는 것 |
| --- | --- |
| **클라우드 보안 아키텍트 · 엔지니어** *(주 대상)* | 원리 + AWS 메커니즘 + 설계 패턴 — 옳게 설계·구현 |
| **보안 책임자 · GRC · 심사 대응** | 한국 규제(ISMS-P/FSI/CSAP/PIPA) 매핑, 리스크·태세 점검 |
| **플랫폼 · DevOps 엔지니어** | 배포 가능한 솔루션 패키지 · 진단 자동화 |

## 어디서 시작할까

**역할별**
- 🏗 **설계·구현 담당** → [기초](./foundations/index.md)부터, 또는 필요한 영역으로 바로
- 🛡 **보안 책임자·GRC** → [거버넌스 & 컴플라이언스](./governance-compliance/index.md) · [한국 FSI 규제](./governance-compliance/korea-fsi-regulations.md)
- ⚙️ **플랫폼·DevOps** → [솔루션 패키지](./solutions/index.md)

**목표별**
- 🧭 *"내 고민이 무엇인지부터 보고 싶다"* → **[자주 겪는 보안 문제](./common-problems.md)** (문제 → 진단 → 솔루션 → 지식)
- 🔍 *"우리 계정 보안 상태부터 진단하고 싶다"* → [AWS SRA 진단(SRA Verify)](./solutions/sra-verify.md)
- 📐 *"AWS 보안을 처음 설계한다"* → [보안 여정](./security-journey.md) 흐름을 따라가기
- 📋 *"규제(ISMS-P/FSI)를 준수·증빙해야 한다"* → [거버넌스 & 컴플라이언스](./governance-compliance/index.md)
- 🚀 *"특정 역량을 바로 배포하고 싶다"* → [솔루션 패키지](./solutions/index.md)

> 처음 방문하셨다면 **[보안 여정](./security-journey.md)** — *진단 → 우선순위 → 설계 → 배포 → 증빙* 흐름을 먼저 보시길 권합니다.

## 🚀 솔루션 패키지

기본 보안 설정 소개에 그치지 않고, 고객이 **운영 환경에서 바로 배포**할 수 있는 솔루션 패키지를 제공합니다. 각 솔루션은 관련 보안 영역과 정렬되어 있습니다.

- **[AWS SRA 진단 (SRA Verify)](./solutions/sra-verify.md)** — 조직 전 계정을 AWS 보안 모범사례(SRA) 기준으로 자동 진단
- **[AppSec 보안 에이전트](./solutions/appsec-security-agent.md)** — 설계·코드·침투 테스트를 에이전트로 자동화
- **[AWS 리소스 시각화](./solutions/aws-resource-visualization.md)** — Config 데이터를 SQL·대시보드로 시각화 (자산 인벤토리·컴플라이언스)
- **[AI 자동화 보안 알림](./solutions/ai-automated-security-alerts.md)** *(출시 예정)* · **[Claude Code 프라이빗 네트워킹](./solutions/claude-code-private-networking.md)** *(출시 예정)*

→ [전체 솔루션 카탈로그](./solutions/index.md)

## 어떻게 읽으면 좋을까

- **클라우드 보안이 처음이라면** → Part 1(보안 기초) → Part 2(접근 관리) → Part 3(네트워크) 순서를 권장합니다.
- **특정 주제가 필요하다면** → 아래 목차에서 바로 진입하세요. 각 페이지 하단의 *관련 문서* 로 연결을 따라갈 수 있습니다.
- 모든 페이지는 [책임 공유 모델](./foundations/shared-responsibility-model.md)을 전제로 합니다 — *클라우드의 보안*은 AWS가, *클라우드 내 보안*은 고객이 책임집니다.

## 📚 보안 지식베이스

### 기초
- **[Part 1 · 보안 기초](./foundations/index.md)** — 보안 원칙, 암호, PKI/TLS, 인증·인가, 위협 모델링

### 예방 (Protect)
- **[Part 2 · 자격증명 & 접근 관리](./identity-access/index.md)** — IAM, 정책 평가, 페더레이션, 멀티 계정, 권한 접근 관리
- **[Part 3 · 인프라 & 네트워크 보안](./infrastructure-network/index.md)** — 네트워크 세분화, VPC, 경계(WAF/Shield), DDoS, 하이브리드 연결
- **[Part 4 · 데이터 보호](./data-protection/index.md)** — 암호화, KMS, 시크릿 관리, 데이터 분류/DLP, Confidential Computing
- **Part 5 · 애플리케이션 & 워크로드** — [애플리케이션 보안](./application-workload/appsec/index.md) · [AI/ML 보안](./application-workload/ai-ml/index.md)

### 운영 (Detect · Respond · Recover)
- **Part 6 · 탐지 & 대응** — [탐지 & 모니터링](./detection-response/detection/index.md) · [인시던트 대응](./detection-response/incident-response/index.md)
- **[Part 7 · 복원력 & 랜섬웨어](./resilience/index.md)** — 랜섬웨어 방어, 불변 백업, 격리 복구

### 거버넌스
- **[Part 8 · 거버넌스 & 컴플라이언스](./governance-compliance/index.md)** — 글로벌 프레임워크, 한국 규제(ISMS-P/FSI/CSAP/PIPA), Landing Zone
- **[Part 9 · 고급 & 신기술](./advanced/index.md)** — 양자내성 암호, SBOM/공급망, 멀티클라우드, Cedar

### 부록
- **[참고자료](./references/reference-links.md)** — 표준·화이트페이퍼 링크
