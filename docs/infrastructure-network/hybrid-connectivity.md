---
title: "하이브리드 연결 — VPN / Direct Connect / TGW"
sidebar_label: "하이브리드 연결 — VPN / Direct Connect / TGW"
sidebar_position: 3
tags:
  - "네트워크"
---
# 하이브리드 & 온프레 연결

:::info[한 줄 정의]
온프레-클라우드 연결의 **기밀성/무결성**과 **라우팅 격리**를 설계한다. 핵심 함정: *전용선(DX)은 암호화가 아니다*.
:::

## 1. 연결 옵션
| 옵션 | 특징 | 암호화 |
|---|---|---|
| **Site-to-Site VPN** | IPsec 터널(인터넷 경유) | ✅ IPsec |
| **Client VPN** | 사용자 단말 → VPC | ✅ TLS |
| **Direct Connect(DX)** | 전용 물리 회선(저지연·일정대역) | ❌ 기본 미암호화 → **MACsec** 또는 **VPN over DX** |
| **Transit Gateway(TGW)** | 허브-스포크 라우팅 허브 | 구간별 |

## 2. Transit Gateway 보안
- 다수 VPC/온프레를 허브로 연결, **라우팅 도메인(route table)으로 격리** → 세그먼트 간 통신 통제.
- 멀티리전 피어링, inspection VPC(Network Firewall)와 결합한 중앙 검사. → [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](./edge-perimeter-waf-shield.md)

## 3. 하이브리드 DNS
- **Route 53 Resolver inbound/outbound endpoint**로 온프레↔클라우드 DNS 해석.
- DNS query logging + DNS Firewall로 exfiltration 방어.

## 4. 핵심 통찰 / 흔한 함정
- **"전용선이니 암호화 불필요" ❌** — DX는 사설이지만 암호화가 아님. 규제(FSI/의료)는 전송 암호화를 별도 요구 → MACsec/VPN over DX.
- 온프레 AD 신뢰 → AWS Managed Microsoft AD. → [ID 페더레이션 — Identity Center / SAML / OIDC](../identity-access/identity-federation.md)

## 5. 자주 받는 질문
- "전용선이니 안전하죠?" → 규제 구간은 암호화(MACsec/IPsec) 별도.
- "온프레-클라우드 여러 VPC 연결이 복잡" → TGW 허브 + 라우팅 도메인 격리.

## 관련
- [네트워크 세분화 — Lattice / Verified Access / PrivateLink](./network-segmentation.md) · [VPC 보안 — SG / NACL / Flow Logs / Endpoint](./vpc-security.md) · [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md)

### References
- AWS — Site-to-Site VPN, Direct Connect(MACsec), Transit Gateway, Route 53 Resolver 문서

