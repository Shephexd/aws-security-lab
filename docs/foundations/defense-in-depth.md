---
title: "Defense in Depth (심층 방어)"
sidebar_label: "Defense in Depth (심층 방어)"
sidebar_position: 4
tags:
  - "기초"
---
# Defense in Depth (심층 방어)

:::info[한 줄 정의]
단일 통제에 의존하지 않고 **여러 계층에 중첩된 통제**를 둬, 하나가 뚫려도 다음 계층이 막는다. 동시에 **blast radius(피해 반경)** 를 최소화한다.
:::

## 1. 계층별 통제 (예: 웹 애플리케이션)
| 계층 | 통제 |
|---|---|
| Edge | CloudFront, **WAF**, Shield |
| Network | VPC, Security Group, NACL, PrivateLink |
| Compute | IMDSv2, 패치, 하드닝 AMI, 최소권한 역할 |
| App | 입력검증, 인증/인가, 시크릿 관리 |
| Data | 암호화(KMS), S3 BPA, Object Lock |
| Identity | IAM 최소권한, MFA, SCP |
| Detect | CloudTrail, GuardDuty, Config |

## 2. Blast Radius 최소화 전략
- **계정 분리**: 환경/팀/민감도별 멀티 계정(Organizations) → 한 계정 침해가 전체로 안 번짐.
- **권한 분리**: 최소권한 + 권한 경계 + SCP.
- **네트워크 분리**: 마이크로세분화, private subnet.
- **키 분리**: 워크로드별 CMK → 키 하나 침해가 전체 데이터로 안 번짐.

## 3. 자주 받는 질문
- "WAF 있으니 됐죠?" ❌ → WAF 우회 시 다음 계층(IAM/암호화/탐지)이 있어야.
- 멀티 계정 = 보안의 가장 강력한 blast-radius 통제. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md)

## 관련
- [AWS 책임 공유 모델 (Shared Responsibility)](./shared-responsibility-model.md) · [Zero Trust Architecture](./zero-trust-architecture.md) · [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md)

