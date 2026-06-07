---
title: "지속 모니터링 — Config Rules / Conformance Pack"
sidebar_label: "지속 모니터링 — Config Rules / Conformance Pack"
sidebar_position: 1
tags:
  - "탐지·대응"
---
# 지속 모니터링 (Continuous Monitoring)

:::info[한 줄 정의]
규정 준수를 *감사 시즌에 한 번* 이 아니라 **상시** 코드로 측정하고, 위반을 자동 교정한다. AWS Config가 엔진, Conformance Pack이 묶음, Security Hub가 점수판.
:::

## 1. Preventive vs Detective (먼저 정리)
- **Preventive(예방)**: 애초에 못 하게 — SCP/RCP, Declarative Policies, 권한 경계. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../../identity-access/multi-account-organizations.md)
- **Detective(탐지)**: 했으면 알아챔 — **Config Rules**, Security Hub.
- 둘 다 필요. 예방으로 막고, 탐지로 빠진 것을 잡는다. → [Defense in Depth (심층 방어)](../../foundations/defense-in-depth.md)

## 2. AWS Config Rules
- **Managed rules**: AWS 제공(예: `s3-bucket-public-read-prohibited`, `encrypted-volumes`, `iam-password-policy`).
- **Custom rules**: **Lambda** 또는 **CloudFormation Guard(정책-as-code)** 로 조직 고유 규칙.
- 평가 시점: 구성 변경 시(트리거) 또는 주기적.
- **자동 교정(remediation)**: Config + **SSM Automation** 런북으로 위반을 자동 수정(예: 퍼블릭 버킷 차단).

## 3. Conformance Pack — 규칙 묶음
- CIS / PCI / NIST / 운영 베스트프랙티스 규칙을 **하나의 패키지로 일괄 배포**, 준수율 대시보드.
- 조직 차원 배포(delegated admin) + **Config aggregator**로 멀티 계정/리전 통합 뷰.

## 4. Config ↔ Security Hub 관계
- Config Rules는 *구성 준수*를 평가하고, **Security Hub**가 그 결과 + GuardDuty/Inspector finding을 ASFF로 통합해 *보안 점수*로. → [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](./threat-detection-guardduty.md)
- 규제 매핑(ISMS-P/전자금융감독규정 통제 → Config 규칙)으로 *상시 증빙* 자동화. → [ISMS-P 통제항목 ↔ AWS 매핑](../../governance-compliance/ismsp-aws-control-mapping.md)

## 5. 실시간 알림
- Config/Security Hub finding → **EventBridge → SNS/Lambda/SSM** → 알림·자동 대응. → [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](../incident-response/automation-orchestration.md)

## 6. 자주 받는 질문
- "규정 준수를 매번 수동 점검" → Conformance Pack으로 상시 측정 + 대시보드 + 자동 교정.
- "감사 때마다 증거 수집 부담" → Config 기록 + Audit Manager로 증거 자동화. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](../../governance-compliance/aws-compliance-services.md)
- "위반을 발견만 하고 못 고친다" → SSM 자동 remediation(고확신 항목부터).

## 관련
- [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](./threat-detection-guardduty.md) · [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](./logging-auditing.md) · [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](../../governance-compliance/aws-compliance-services.md) · [Landing Zone & Control Tower — Preventive / Detective](../../governance-compliance/landing-zone-control-tower.md)

### References
- [AWS Config Rules / Conformance Packs](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config.html) · [CloudFormation Guard](https://docs.aws.amazon.com/cfn-guard/latest/ug/what-is-guard.html)
- [Security Hub CSPM 표준](https://docs.aws.amazon.com/securityhub/latest/userguide/standards-reference.html)

