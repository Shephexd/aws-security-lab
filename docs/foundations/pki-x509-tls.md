---
title: "PKI · X.509 · TLS 핸드셰이크"
sidebar_label: "PKI · X.509 · TLS 핸드셰이크"
sidebar_position: 5
tags:
  - "기초"
---
# PKI · X.509 · TLS

:::info[한 줄 정의]
PKI는 "이 공개키가 정말 이 주체의 것인가"를 **신뢰의 사슬(chain of trust)** 로 증명하는 체계다. TLS는 그 신뢰 위에서 세션키를 안전히 합의하고 통신을 암호화한다.
:::

## 1. 왜 중요한가
ACM으로 인증서 한 번 발급하면 끝처럼 보이지만, 고객은 mTLS, 사설 CA, 인증서 만료 장애, 인증서 고정(pinning), TLS 종료 지점 같은 질문을 한다. *신뢰가 어디서 시작되고 어디서 끊기는지* 를 설명해야 한다.

## 2. PKI 구성요소
- **CA(인증기관)**: 신뢰의 뿌리. Root CA(오프라인) → Intermediate CA → 최종 인증서.
- **X.509 인증서**: 주체(Subject), 공개키, 발급자(Issuer), 유효기간, SAN(도메인 목록), CA 서명 포함.
- **신뢰 사슬 검증**: 서버 인증서 → 중간 CA → 루트 CA(OS/브라우저 신뢰 저장소에 사전 탑재)까지 서명이 이어지는지 확인.
- **폐기 확인**: **CRL**(폐기 목록) / **OCSP**(실시간 조회) / OCSP Stapling.
- **Certificate Transparency(CT)**: 모든 발급 인증서를 공개 로그에 기록 → 부정 발급 탐지.

## 3. AWS 매핑
| 필요 | 서비스 |
|---|---|
| 퍼블릭 TLS 인증서(무료, 자동갱신) | **ACM** |
| 사설 CA 계층(내부 mTLS, IoT, K8s) | **AWS Private CA (PCA)** |
| FIPS HSM 기반 키 보관 | CloudHSM + Private CA |
| 인증서 만료 모니터링 | ACM + Config + EventBridge 알림 |

- **함정**: ACM 퍼블릭 인증서는 ACM 통합 서비스(ALB/CloudFront/API GW)에서만 export 불가하게 사용. EC2에 직접 설치하려면 Private CA 또는 외부 인증서.

## 4. TLS 핸드셰이크 심화 (TLS 1.2 vs 1.3)
**TLS 1.2** (왕복 2회): ClientHello → ServerHello+인증서 → 키교환 → Finished. cipher suite 협상이 복잡하고 RSA 키교환 시 PFS 없음.

**TLS 1.3** (RFC 8446, 2018-08. 왕복 1회, 구조적으로 더 안전):
- **취약 알고리즘 전면 제거**: RSA 키교환, 정적 DH, **CBC 모드, RC4, 3DES, SHA-1, MD5, 압축**, 재협상(renegotiation), 커스텀 DHE 그룹 삭제.
- **AEAD 암호만 허용**(AES-GCM, ChaCha20-Poly1305) → 무결성 내장. → [암호 기초 — 대칭/비대칭/해시/서명](./cryptography-fundamentals.md)
- **PFS 의무화** — **ECDHE만** 허용(매 연결 임시 키쌍) → 서버 개인키가 미래에 유출돼도 *과거* 트래픽 복호화 불가.
- 1-RTT 기본, 재접속 시 **0-RTT** 옵션 → 단 0-RTT 데이터는 **forward secret이 아니고 replay 방지 보장이 없음** → *멱등(idempotent) 요청에만*, 상태변경 API엔 금지.
- 핸드셰이크 대부분 암호화(인증서까지) → 메타데이터 노출 감소.
- **PQC**: 하이브리드 키교환(ECDHE + ML-KEM)으로 확장 중 → AWS KMS/ACM/ALB 지원. → [암호 기초 — 대칭/비대칭/해시/서명](./cryptography-fundamentals.md#8-양자내성-암호-pqc)

> 고객 조언: "TLS 1.3 + PFS면 키 유출 시에도 과거 트래픽이 보호됩니다. TLS 1.0/1.1은 비활성화(PCI-DSS 4.0 요구), 1.2는 cipher suite를 AEAD+ECDHE로 제한하세요. 0-RTT는 멱등 요청에만."

## 5. cipher suite 읽는 법
`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
= 키교환(ECDHE=PFS) · 인증(RSA) · 대칭암호(AES-256-GCM) · 해시(SHA384). TLS 1.3은 단순화됨(`TLS_AES_256_GCM_SHA384`).

## 6. mTLS (상호 TLS)
서버뿐 아니라 **클라이언트도 인증서로 자신을 증명**. 서비스 간(zero trust), IoT, 금융 API에서 사용.
- AWS 구현: ALB mTLS, API Gateway mTLS, App Mesh, Private CA로 클라이언트 인증서 발급.
- → [Zero Trust Architecture](./zero-trust-architecture.md), 네트워크 신뢰가 아닌 ID 신뢰로 전환.

## 7. TLS 종료(termination) 지점 설계
- **Edge termination** (CloudFront/ALB에서 복호화) — 내부는 평문/재암호화. 관리 쉬움.
- **End-to-end** (백엔드까지 암호화) — 규제(의료/FSI)에서 요구. NLB passthrough 또는 백엔드 재암호화.
- 함정: ALB에서 종료하면 WAF 검사 가능하지만 백엔드 구간 보호는 별도 설계 필요.

## 8. 자주 받는 질문
- "인증서 만료로 장애 난 적 있죠?" → ACM 자동 갱신 + 외부 인증서는 Config 모니터링.
- "내부 서비스 간 통신도 암호화하나요?" → Private CA + mTLS / VPC Lattice.
- "TLS 종료를 어디서 하느냐가 규제 충족 여부를 가른다."

## 관련
- [암호 기초 — 대칭/비대칭/해시/서명](./cryptography-fundamentals.md) · [Zero Trust Architecture](./zero-trust-architecture.md) · [전송 중 암호화 — ACM / TLS termination](../data-protection/encryption-in-transit.md)

### References
- **RFC 8446** (TLS 1.3), **RFC 5280** (X.509 PKI), **RFC 6960** (OCSP), **RFC 6962** (Certificate Transparency)
- [Cloudflare: RFC 8446 / TLS 1.3 해설](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)
- AWS: ACM, AWS Private CA, ALB/API Gateway mTLS 문서, s2n-tls (AWS의 TLS 구현)

