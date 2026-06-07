---
title: "AWS 책임 공유 모델 (Shared Responsibility)"
sidebar_label: "AWS 책임 공유 모델 (Shared Responsibility)"
sidebar_position: 6
tags:
  - "기초"
---
# AWS 책임 공유 모델

:::info[한 줄 정의]
AWS는 **"of the cloud"(클라우드 자체)**, 고객은 **"in the cloud"(클라우드 안)** 의 보안을 책임진다. 경계는 서비스 추상화 수준에 따라 움직인다.
:::

## 1. 핵심 구분
- **AWS 책임**: 하드웨어, 글로벌 인프라, 하이퍼바이저, 관리형 서비스의 기반.
- **고객 책임**: 데이터, IAM, OS/패치(EC2), 네트워크 구성, 암호화 설정, 애플리케이션.

## 2. 추상화 수준별 경계 이동 (핵심 통찰)
| 모델 | 고객 책임 범위 | 예 |
|---|---|---|
| IaaS | OS·패치·런타임까지 많음 | EC2 |
| PaaS/관리형 | OS는 AWS, 구성/데이터는 고객 | RDS, Lambda |
| SaaS형 | 데이터·접근통제 중심 | S3, DynamoDB |

> 함정: "관리형이니 안전하다" ❌ — RDS도 암호화·SG·IAM·백업은 **고객 책임**.

## 3. Shared Responsibility의 변형
- **Shared Fate**: AWS가 안전한 기본값·가드레일·Landing Zone을 더 적극 제공하는 방향.
- 관리형이 늘수록 고객 책임은 "**설정과 데이터 거버넌스**"로 수렴.

## 4. 자주 받는 질문
- 사고 시 "누구 책임?" 논쟁 방지 → 서비스별 책임 경계를 사전 합의 문서화.
- 컴플라이언스 감사 시 AWS 책임 부분은 [AWS Artifact](../governance-compliance/aws-compliance-services.md) 증빙으로 대체.

## 관련
- [Well-Architected — Security Pillar](./well-architected-security-pillar.md) · [Defense in Depth (심층 방어)](./defense-in-depth.md)

