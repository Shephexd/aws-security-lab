---
title: Claude Code 프라이빗 네트워킹
sidebar_label: Claude Code 프라이빗 네트워킹 (출시 예정)
sidebar_position: 5
---

# Claude Code 프라이빗 네트워킹 (Claude Code Private Networking)

> **한 줄 요약** — Claude Code를 공용 인터넷이 아닌 **사설 네트워크 경로**로 안전하게 연결하여, 기업 보안 정책(이그레스 통제·프라이빗 연결)을 만족시킵니다.

:::info 개요
규제·보안 정책상 외부 SaaS 트래픽을 통제해야 하는 환경에서, Claude Code 트래픽을 프라이빗 경로로 라우팅하는 네트워크 구성을 제공합니다.
:::

:::note 출시 예정
이 솔루션 패키지는 준비 중입니다. 아래는 예상 구성이며, 배포 에셋과 함께 정식 공개될 예정입니다.
:::

## 관련 보안 영역 (Alignment)

- [Part 3 · 인프라 & 네트워크 → 네트워크 세분화](../infrastructure-network/network-segmentation.md)
- [Part 3 · 인프라 & 네트워크 → VPC 보안](../infrastructure-network/vpc-security.md)
- [Part 3 · 인프라 & 네트워크 → 하이브리드 연결](../infrastructure-network/hybrid-connectivity.md)

## 아키텍처

```
(사내/VPC) → PrivateLink / 프록시 / 이그레스 통제 → Claude Code 엔드포인트
```

## 사전 요구사항 (Prerequisites)

- [ ] 대상 VPC 및 라우팅/이그레스 정책
- [ ] (필요 시) 프록시 또는 PrivateLink 구성

## 배포 (Deployment)

> 📦 **배포 에셋**: *IaC 저장소 링크를 연결하세요.*

## 자주 묻는 질문 (FAQ)

*작성 예정*

## 고객 배포 체크리스트

- [ ] *작성 예정*
