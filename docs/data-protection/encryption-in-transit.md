---
title: "전송 중 암호화 — ACM / TLS termination"
sidebar_label: "전송 중 암호화 — ACM / TLS termination"
sidebar_position: 3
tags:
  - "데이터보호"
---
# 전송 중 암호화

:::info[한 줄 정의]
ACM으로 인증서를 자동 관리하고, **TLS 종료 지점** 설계로 규제 충족 여부가 갈린다. 원리(핸드셰이크/PFS/1.3)는 [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md).
:::

## 1. 인증서 관리
| | **ACM (퍼블릭)** | **AWS Private CA** |
|---|---|---|
| 용도 | 인터넷 향 TLS | 내부 mTLS·IoT·K8s 사설 PKI |
| 비용/갱신 | 무료 + **자동 갱신** | 유료, 사설 계층 |
| 제약 | 통합 서비스(ALB/NLB/CloudFront/API GW)에서 사용(EC2 직접 설치 불가) | 인증서 export 가능 |

- 외부 발급 인증서는 ACM import 가능하나 *자동 갱신 안 됨* → Config/EventBridge로 만료 모니터링.

## 2. TLS 종료(termination) 지점 — 규제의 분기점
| 패턴 | 설명 | 트레이드오프 |
|---|---|---|
| **Edge termination** | CloudFront/ALB에서 복호화 | WAF 검사 가능 / 내부 구간 별도 보호 필요 |
| **재암호화(re-encryption)** | ALB 종료 후 백엔드로 재암호화 | 검사 + 백엔드 보호 |
| **End-to-end (passthrough)** | NLB로 백엔드까지 암호문 | 규제(의료/FSI) 충족 / L7 검사 불가 |

> 통찰: "어디서 TLS를 푸느냐"가 **WAF 검사 vs 종단 암호화** 의 트레이드오프이자 규제 충족 여부를 가른다. FSI/의료는 종종 종단 암호화 요구. → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 3. TLS 정책
- 최소 **TLS 1.2**, 가능하면 **1.3**(AEAD+ECDHE only). 1.0/1.1 비활성(PCI-DSS). → [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md)
- ALB/CloudFront/API GW의 보안 정책으로 cipher/버전 제한.
- **PQC 하이브리드(ECDHE+ML-KEM)** 지원 확대(ALB/NLB). → [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md#8-양자내성-암호-pqc)

## 4. 서비스 간/하이브리드
- 서비스 간 **mTLS**: Private CA + VPC Lattice/App Mesh/ALB mTLS. → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md)
- VPN/Direct Connect 구간 암호화(MACsec). → [하이브리드 연결 — VPN / Direct Connect / TGW](../infrastructure-network/hybrid-connectivity.md)

## 5. 자주 받는 질문
- "인증서 만료로 장애" → ACM 자동 갱신, 외부 인증서는 모니터링.
- "어디서 TLS 종료?" → 검사 필요(edge) vs 종단 암호화(규제) 트레이드오프 설명.
- "내부 통신도 암호화?" → Private CA + mTLS / Lattice.

## 관련
- [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md) · [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](../infrastructure-network/edge-perimeter-waf-shield.md) · [KMS & Envelope Encryption](./kms-envelope-encryption.md)

### References
- AWS — ACM, AWS Private CA, ELB/CloudFront 보안 정책 문서 · [s2n-tls](https://github.com/aws/s2n-tls)

