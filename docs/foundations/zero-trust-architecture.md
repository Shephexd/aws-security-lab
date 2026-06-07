---
title: "Zero Trust Architecture"
sidebar_label: "Zero Trust Architecture"
sidebar_position: 9
tags:
  - "기초"
---
# 제로 트러스트 아키텍처

:::info[한 줄 정의]
"네트워크 위치(사내망=신뢰)"라는 가정을 버리고, **모든 요청을 ID·디바이스·컨텍스트로 매 순간 검증**한다. *Never trust, always verify.*
:::

## 1. 왜 (전환 배경)
경계(perimeter) 모델은 VPN 안에 들어오면 다 신뢰 → 한 번 뚫리면 lateral movement 자유. 원격근무·클라우드·SaaS로 경계가 사라지며 **ID 중심**으로 전환.

## 2. 핵심 원칙 — 7 Tenets (NIST SP 800-207, 2020-08)
1. 모든 데이터 소스·컴퓨팅 서비스를 *리소스*로 간주.
2. 네트워크 위치와 무관하게 모든 통신을 보호(암호화).
3. 자원 접근은 **세션 단위**로 허가(한 번 인증=영구 신뢰 ❌).
4. 접근은 **동적 정책**으로 결정(ID·디바이스 상태·행위·환경 등 관찰 가능한 속성).
5. 모든 자산의 **무결성·보안 상태를 모니터링**.
6. 자원 접근 전 **인증·인가를 동적·엄격하게** 강제.
7. 자산·네트워크·통신 상태 정보를 최대한 수집해 보안 태세를 개선(지속 개선).

### 논리 아키텍처
- **PDP(Policy Decision Point)** = **PE(Policy Engine, 신뢰 결정)** + **PA(Policy Administrator, 연결 수립/종료)**.
- **PEP(Policy Enforcement Point)** = 데이터 평면. 주체↔리소스 연결을 PDP 결정에 따라 *활성화·감시·종료*.
- 흐름: 주체→PEP 요청 → PDP가 정책+컨텍스트(ID, 디바이스, 위협인텔)로 판단 → PEP가 집행.
- **AWS 매핑**: PDP ≈ IAM/Ced(Verified Permissions)+Verified Access 정책, PEP ≈ Verified Access 엔드포인트 / VPC Lattice / API Gateway.

### CISA Zero Trust Maturity Model 2.0 (성숙도 진단 틀)
- **5개 기둥(pillar)**: Identity · Devices · Networks · Applications & Workloads · Data (+ 횡단축: Visibility&Analytics, Automation&Orchestration, Governance).
- **4단계 성숙도**: Traditional → Initial → Advanced → Optimal (기둥별로 독립 평가).
- 활용: 고객의 ZT 여정을 기둥×단계 히트맵으로 진단 → 로드맵.

## 3. AWS에서의 구현 패턴
| 축 | AWS |
|---|---|
| 강한 ID | IAM Identity Center, MFA(passkey), OIDC/SAML |
| 앱 접근(VPN 대체) | **AWS Verified Access** (ID+디바이스 신호로 접근) |
| 서비스 간 신뢰 | **VPC Lattice**, mTLS(Private CA), PrivateLink |
| 세분화 | Security Group, 네트워크 정책, micro-segmentation |
| 인가 외부화 | **Amazon Verified Permissions (Cedar)** |
| 지속 검증 | GuardDuty, Config, CloudTrail |

## 4. 전환 로드맵 (network-centric → identity-centric)
1. 강한 ID/MFA 확립 → 2. 앱 단위 접근(Verified Access)으로 VPN 축소 → 3. 서비스 간 mTLS/Lattice → 4. 컨텍스트 기반 정책·지속 검증.

## 5. 자주 받는 질문 / 흔한 함정
- 제로 트러스트는 제품 하나를 도입한다고 완성되지 않는다. 여정이자 아키텍처 원칙이다.
- 한국 FSI **망분리** 요건과 제로 트러스트는 충돌이 아니라 보완 관계다. 분리된 망 *안에서도* ID를 검증한다. → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 관련
- [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](./authentication-protocols.md) · [PKI · X.509 · TLS 핸드셰이크](./pki-x509-tls.md) (mTLS) · [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md) · [인가 모델 — RBAC / ABAC / ReBAC / Cedar](./authorization-models.md) (PDP=Cedar)

### References
- **NIST SP 800-207** (Zero Trust Architecture) — [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-207.pdf)
- **CISA Zero Trust Maturity Model 2.0** (2023) — [cisa.gov/zero-trust-maturity-model](https://www.cisa.gov/zero-trust-maturity-model)
- AWS: [Zero Trust on AWS](https://aws.amazon.com/security/zero-trust/), Verified Access, VPC Lattice 문서

