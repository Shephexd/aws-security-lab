---
title: "데이터 분류 & 탐지 — Macie"
sidebar_label: "데이터 분류 & 탐지 — Macie"
sidebar_position: 1
tags:
  - "데이터보호"
---
# 데이터 분류 & 탐지

:::info[한 줄 정의]
보호하려면 먼저 *무엇이 어디에 있는지* 알아야 한다. **Amazon Macie**가 S3의 민감정보를 자동 발견·분류한다. 데이터 거버넌스(ISMS-P/PIPA)의 출발점.
:::

## 1. Macie 탐지 방식 (두 가지)
| 방식 | 동작 | 용도 |
|---|---|---|
| **자동 민감데이터 탐지(automated discovery)** | S3 버킷 인벤토리를 *매일* 평가 + **샘플링**으로 대표 객체 분석 → 어디에 민감데이터가 있을 가능성이 높은지 광범위 가시성 | 상시·저비용 전체 조망 |
| **탐지 작업(discovery job)** | 지정 버킷/객체를 *전수* 심층 분석 | 특정 대상 정밀 검사 |

## 2. 데이터 식별자
- **관리형 식별자(managed data identifiers)**: **150종 이상** 내장 — 신용카드번호, AWS 비밀 액세스키, 여권/국가별 PII·PHI·금융정보 등.
- **커스텀 식별자(custom data identifiers)**: **정규식(regex)** + 근접 규칙으로 조직 고유 데이터 탐지.
  - 한국 특화: **주민등록번호·계좌·운전면허·여권** 패턴을 커스텀 식별자로(또는 관리형 지원 여부 확인).
- 둘을 조합 가능. → [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](../governance-compliance/pipa-privacy.md)

## 3. 발견 → 대응 파이프라인
- Macie finding → **EventBridge → Lambda/SSM** → 자동 격리(버킷 비공개화·태깅·알림). → [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](../detection-response/incident-response/automation-orchestration.md)
- finding은 Security Hub로 집계. → [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection-response/detection/threat-detection-guardduty.md)

## 4. 데이터 분류 체계 & 태깅
- 공개/내부/기밀/극비 등 분류 라벨 → 리소스 태그 → ABAC 접근통제 연계. → [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md)

## 5. 자주 받는 질문
- "민감정보가 어디 있는지 모름" → 자동 탐지로 전체 조망 → 핫스팟에 정밀 job → 분류·통제.
- "비용이 걱정" → 전수 job 대신 automated discovery(샘플링)로 시작.
- ISMS-P/PIPA: 개인정보 처리 현황 파악·분류의 근거 자료. → [ISMS-P 통제항목 ↔ AWS 매핑](../governance-compliance/ismsp-aws-control-mapping.md)

## 관련
- [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](./dlp.md) · [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](../governance-compliance/pipa-privacy.md) · [KMS & Envelope Encryption](./kms-envelope-encryption.md)

### References
- [Macie — 자동 민감데이터 탐지](https://docs.aws.amazon.com/macie/latest/user/discovery-asdd.html) · [관리형 데이터 식별자](https://docs.aws.amazon.com/macie/latest/user/managed-data-identifiers.html)

