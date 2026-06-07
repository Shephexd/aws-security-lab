---
title: "특권 접근 관리 — Root 보호 / JIT / Access Analyzer"
sidebar_label: "특권 접근 관리 — Root 보호 / JIT / Access Analyzer"
sidebar_position: 5
tags:
  - "자격증명"
---
# 특권 접근 관리 (PAM)

:::info[한 줄 정의]
가장 강한 권한일수록 **가장 적게(최소), 가장 짧게(JIT), 가장 많이 감시**. Root는 제거·중앙관리, 일상 권한은 임시 승급, 미사용 권한은 상시 정리.
:::

## 1. Root 계정 보호 — 중앙 관리(2024 신규)
- Root는 일부 작업 외 *사용하지 않는* 게 원칙(MFA 하드웨어 키, 연락처/결제 분리, 사용 알림).
- **중앙 root 접근 관리 (IAM, 2024.11)**: AWS Organizations에서
  - **root 자격 관리**: 멤버 계정의 장기 root 자격(비번/액세스키/서명인증서/MFA)을 **중앙에서 제거**·복구 차단 → MFA 준수 부담 격감.
  - **특권 root 작업**: 멤버 계정에서 root가 필요하던 작업(잘못된 S3/SQS 정책 잠금 해제 등)을 **단기(최대 15분)·작업 범위 한정 root 세션**으로 중앙 수행 → 그 세션은 *그 작업만* 가능.
- 효과: "지켜야 할 root 자격"의 수를 구조적으로 줄임.

## 2. 최소 권한 — 실사용 기반
- 넓게 주고 좁히지 말고, **Access Analyzer로 실사용 기반 정책 생성**(CloudTrail 분석).
- **Permission Boundary**로 위임 상한, **SCP/RCP**로 조직 가드레일. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](./multi-account-organizations.md)

## 3. Just-in-Time(JIT) 권한
- 상시 관리자 부여 ❌ → Identity Center 임시 승급 + 승인 워크플로우 + 세션 로깅.
- 고위험 작업은 MFA 강제(`aws:MultiFactorAuthPresent`).

## 4. IAM Access Analyzer
| 기능 | 무엇을 |
|---|---|
| **External access** | 리소스 정책이 *신뢰 경계 밖* 주체에게 접근 허용하는 것 탐지(퍼블릭/cross-account) |
| **Unused access** | 미사용 **역할 / 액세스키·비밀번호 / 권한**(서비스·액션 수준) 지속 탐지 → 정리 |
| **Custom policy checks** | 배포 전 정책이 보안 기준 위반하는지 자동 추론(예: **Check No Public Access**, 2024). guided revocation으로 미사용 권한 제거 가이드 |

- CI/CD에 custom policy check를 넣어 *과한 정책의 배포 자체를 차단*(shift-left). → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md)

## 5. Break-glass (비상 접근)
- 정상 경로 장애 시를 위한 사전 정의된 비상 계정/절차 + 강한 감사·알림.

## 6. 자주 받는 질문
- "관리자에게 AdministratorAccess 상시 부여" → JIT 승급 + 승인 + 세션 로깅.
- "멤버 계정마다 root MFA 관리가 지옥" → 중앙 root 접근 관리로 root 자격 자체 제거.
- "권한이 과한지 모름" → Access Analyzer unused access + custom checks로 상시 점검(규제 증빙).

## 관련
- [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](./iam-policy-evaluation-logic.md) · [ID 페더레이션 — Identity Center / SAML / OIDC](./identity-federation.md) · [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](./multi-account-organizations.md) · [06. Incident Response — MOC](../detection-response/incident-response/index.md)

### References
- [AWS — 중앙 root 접근 관리(2024.11)](https://aws.amazon.com/blogs/aws/centrally-managing-root-access-for-customers-using-aws-organizations/) · [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)
- [IAM Access Analyzer — unused access & custom policy checks](https://aws.amazon.com/blogs/aws/iam-access-analyzer-updates-find-unused-access-check-policies-before-deployment/)

