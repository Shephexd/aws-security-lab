---
title: "멀티 계정 전략 — Organizations / SCP / RCP / Control Tower"
sidebar_label: "멀티 계정 전략 — Organizations / SCP / RCP / Control Tower"
sidebar_position: 4
tags:
  - "자격증명"
---
# 멀티 계정 전략

:::info[한 줄 정의]
계정은 가장 강력한 격리 경계(blast radius). OU 구조 + 권한 가드레일(SCP/RCP) + 구성 강제(Declarative) + 자동화(Control Tower)가 거버넌스의 뼈대.
:::

## 1. 권장 계정 구조 (AWS SRA 기반)
```
Root(Management) — 결제·Organizations만, 워크로드 금지
 ├─ Security OU
 │   ├─ Log Archive (중앙 로그, Object Lock) → logging-auditing
 │   └─ Security Tooling (GuardDuty/Security Hub 위임관리자)
 ├─ Infrastructure OU (Network / Shared Services)
 ├─ Workloads OU (Prod / Non-Prod)
 └─ Sandbox OU
```

## 2. Organizations 정책 4종
| 정책 | 통제 대상 | 성격 | 예 |
|---|---|---|---|
| **SCP** (Service Control Policy) | **내 조직의 principal**(사용자/역할)의 *최대 권한* | 권한 가드레일(부여X) | 특정 리전 외 거부, 루트 행위 차단 |
| **RCP** (Resource Control Policy, 2024 말) | **내 조직의 resource**에 접근하는 *모든 principal(외부 포함)* | 리소스 접근 가드레일 | "조직 외부(`aws:PrincipalOrgID`≠) 는 S3 접근 불가" |
| **Declarative Policies** (2024) | AWS 서비스 *구성 상태* | 구성 강제(권한X) | "EBS 기본 암호화 강제", "IMDSv2 강제" |
| **Tag Policy** | 태그 표준 | 거버넌스 | 필수 태그 키/값 강제 |

> **SCP vs RCP 핵심**: SCP는 "내부 사람을 보는 경비"(내 principal만), RCP는 "문 밖에서 들어오는 자를 보는 경비"(외부 principal까지). **SCP는 외부 계정이 내 퍼블릭 버킷에 접근하는 걸 못 막지만, RCP는 막는다** — 개발자가 버킷을 퍼블릭으로 만들어도 조직 차원에서 차단. → 데이터 유출 방어 [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../data-protection/dlp.md)
> Declarative Policies는 *권한이 아니라 설정*을 강제하며, 미래 API 변경에도 구성이 유지됨(예방통제). → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md)

## 3. Cross-account 접근
- 역할 신뢰(AssumeRole) + `ExternalId`, **AWS RAM**으로 서브넷/리소스 공유.
- 평가 시 양쪽(주체 identity + 리소스/신뢰) 모두 Allow 필요. → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](./iam-policy-evaluation-logic.md)

## 4. Control Tower
- **Landing Zone 자동화** + 가드레일(controls) 카탈로그 + **Account Factory**(표준 계정 발급).
- 가드레일: Preventive(SCP) / Detective(Config) / Proactive(CloudFormation Hook). → [Landing Zone & Control Tower — Preventive / Detective](../governance-compliance/landing-zone-control-tower.md)
- 위임 관리자(delegated admin)로 보안 서비스를 Security Tooling 계정에 집중.

## 5. 자주 받는 질문
- "계정 하나에 다 넣었어요" → 침해 시 전사 확산. 계정 분리 + 중앙 로깅으로 blast radius 축소. → [Defense in Depth (심층 방어)](../foundations/defense-in-depth.md)
- "퍼블릭 버킷 사고가 반복" → BPA + **RCP로 조직 차원 외부 접근 차단**(개발자 실수 무력화).
- 한국 FSI/규제: 운영/개발 분리, 중앙 감사 계정 요구와 정합. → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 관련
- [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](./iam-policy-evaluation-logic.md) · [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](./privileged-access-management.md) · [Landing Zone & Control Tower — Preventive / Detective](../governance-compliance/landing-zone-control-tower.md)

### References
- [AWS — RCP 소개(2024)](https://aws.amazon.com/blogs/aws/introducing-resource-control-policies-rcps-a-new-authorization-policy/) · [Organizations 인가 정책](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_authorization_policies.html)
- AWS SRA(Security Reference Architecture), Control Tower 문서

