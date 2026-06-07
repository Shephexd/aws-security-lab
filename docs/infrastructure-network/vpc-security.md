---
title: "VPC 보안 — SG / NACL / Flow Logs / Endpoint"
sidebar_label: "VPC 보안 — SG / NACL / Flow Logs / Endpoint"
sidebar_position: 6
tags:
  - "네트워크"
---
# VPC 보안

:::info[한 줄 정의]
SG는 **stateful**(인스턴스 레벨), NACL은 **stateless**(서브넷 레벨). VPC Endpoint로 트래픽을 AWS 백본 안에 가두고, Flow Logs로 본다.
:::

## 1. SG vs NACL
| | **Security Group** | **Network ACL** |
|---|---|---|
| 레벨 | ENI/인스턴스 | 서브넷 |
| 상태 | **Stateful**(응답 자동 허용) | **Stateless**(인/아웃 각각 규칙 필요) |
| 규칙 | **Allow만** | Allow + **Deny** |
| 평가 | 모든 규칙 종합 | **번호 순서**(낮은 번호 우선) |
| 용도 | 기본 통제 | 서브넷 차단(특정 IP 블랙리스트 등) |

> 함정: NACL은 stateless라 *임시 포트(ephemeral) 아웃바운드*를 열어줘야 응답이 돌아온다. SG는 자동.

## 2. VPC Endpoint — 인터넷 우회 + 유출 통제
| 유형 | 대상 | 특징 |
|---|---|---|
| **Gateway Endpoint** | S3, DynamoDB | 라우팅 테이블 기반, 무료 |
| **Interface Endpoint(PrivateLink)** | 대부분 서비스 | ENI 기반, 시간당 과금 |

- **Endpoint policy**로 "이 endpoint로는 *우리 조직 버킷만*"(`aws:PrincipalOrgID`/`aws:ResourceOrgID`) → **데이터 유출 방지 핵심**. → [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../data-protection/dlp.md)
- 인터넷 게이트웨이 없이 관리형 서비스 호출 → egress 표면 축소.

## 3. 서브넷 설계
- Public(IGW) / Private(NAT) / Isolated(아웃바운드 없음, DB·규제 데이터).
- NAT Gateway는 아웃바운드만(인바운드 개시 불가).

## 4. 로깅·가시성
- **VPC Flow Logs**(ACCEPT/REJECT) → 탐지·포렌식 기본 입력. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)
- **Traffic Mirroring**(패킷 캡처, 심층 분석), Route 53 Resolver query logs(DNS).

## 5. 핵심 통찰
- VPC Endpoint + endpoint policy = **데이터 exfiltration 방지**의 1차 통제.
- SG를 "기본 차단 + 필요한 것만"으로, 0.0.0.0/0 인바운드는 Config 규칙으로 감시. → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

## 6. 자주 받는 질문
- "S3 트래픽이 인터넷으로 나가요" → Gateway Endpoint + 정책으로 백본 내 + 버킷 제한.
- "SG와 NACL 둘 다 필요한가요?" → SG가 주력, NACL은 서브넷 광역 차단·심층방어 보조.

## 관련
- [IMDSv2 & SSRF 방어](./imdsv2-ssrf-defense.md) · [네트워크 세분화 — Lattice / Verified Access / PrivateLink](./network-segmentation.md) · [하이브리드 연결 — VPN / Direct Connect / TGW](./hybrid-connectivity.md) · [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../data-protection/dlp.md)

### References
- AWS — Security Groups, Network ACLs, VPC Endpoints(Gateway/Interface), VPC Flow Logs 문서

