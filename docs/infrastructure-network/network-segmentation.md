---
title: "네트워크 세분화 — Lattice / Verified Access / PrivateLink"
sidebar_label: "네트워크 세분화 — Lattice / Verified Access / PrivateLink"
sidebar_position: 5
tags:
  - "네트워크"
---
# 네트워크 세분화 (Micro-segmentation)

:::info[한 줄 정의]
평면 네트워크 = lateral movement 천국. 서비스 단위로 잘게 나누고 **네트워크 신뢰가 아닌 ID로 통제**한다. Zero Trust의 네트워크 구현. → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)
:::

## 1. 세분화 수단 비교
| 수단 | 무엇을 | ID 기반 인가 |
|---|---|---|
| **SG/NACL** | L3/4 경계 | ❌(IP/포트) |
| **VPC Lattice** | 서비스 간 연결(서비스 네트워크) | ✅ **IAM auth policy** |
| **PrivateLink** | 서비스 노출을 인터넷 없이 타 VPC/계정에 | 엔드포인트 단위 |
| **Verified Access** | 사용자→사내 앱 접근(VPN 대체) | ✅ ID+디바이스 신호 |

## 2. VPC Lattice
- 애플리케이션 계층 **서비스 네트워크** — VPC/계정 경계를 넘는 서비스 간 연결을 단순화.
- **auth policy(IAM 기반)** 로 서비스 간 호출을 인가 + 전송 암호화 → 마이크로세분화를 ID로.

## 3. AWS Verified Access (ZTNA)
- VPN 없이 사내 앱별 접근. **ID(Identity Center/OIDC) + 디바이스 신뢰 신호(MDM/3rd party)** 를 정책으로 평가.
- 접근 로그로 지속 가시성. NIST ZT의 PEP 역할. → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)

## 4. PrivateLink
- 공급자-소비자 모델: 서비스를 인터넷 노출 없이 ENI(interface endpoint)로 제공.
- SaaS/내부 공유 서비스, cross-account 노출 최소화. AWS RAM으로 리소스 공유.

## 5. 핵심 통찰
- 세분화 = blast radius 축소 + lateral movement 차단. → [Defense in Depth (심층 방어)](../foundations/defense-in-depth.md)
- "분리된 망 안에서도 ID 검증"(Lattice/Verified Access)이 단순 SG 분리보다 강함.

## 6. 자주 받는 질문
- "VPN 부담이 큼" → Verified Access로 앱 단위 접근 + 디바이스 신뢰.
- "서비스가 수백 개, 누가 누구를 호출하는지 통제 불가" → VPC Lattice auth policy.
- 한국 FSI **망분리**와 세분화 결합 시 설계 주의(논리분리+ID). → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 관련
- [VPC 보안 — SG / NACL / Flow Logs / Endpoint](./vpc-security.md) · [하이브리드 연결 — VPN / Direct Connect / TGW](./hybrid-connectivity.md) · [Zero Trust Architecture](../foundations/zero-trust-architecture.md) · [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md) (mTLS)

### References
- AWS — VPC Lattice(auth policies), Verified Access, PrivateLink, RAM 문서

