---
title: "Cloud-Native 보안 — Cedar / Verified Permissions / Private CA"
sidebar_label: "Cloud-Native 보안 — Cedar / Verified Permissions / Private CA"
sidebar_position: 1
tags:
  - "고급"
---
# Cloud-Native Security

:::info[한 줄 정의]
인가(authorization)·접근(access)·신원(identity)을 **애플리케이션 코드에서 분리해 선언적 정책·관리형 서비스로 외부화**하는 클라우드 네이티브 패턴. Cedar/Verified Permissions(앱 인가), Verified Access(ZTNA), Private CA(내부 PKI/mTLS)가 핵심 구성요소다.
:::

## 1. 왜 중요한가
전통 앱은 인가 로직(`if user.role == "admin"`)이 코드 곳곳에 흩어져 있다. 그 결과 정책을 한눈에 감사하기 어렵고, 변경 시 회귀 위험이 크며, 같은 규칙이 서비스마다 미묘하게 달라진다. 클라우드 네이티브 보안은 이런 횡단 관심사를 **전용 정책 엔진·게이트웨이·PKI로 외부화**해 다음을 얻는다.

- **감사 가능성**: 정책이 코드가 아닌 선언적 텍스트라 검토·증명·테스트가 쉽다.
- **변경 용이성**: 재배포 없이 정책만 갱신, 일관성 보장.
- **제로 트러스트 정합**: 모든 요청을 신원·컨텍스트 기준으로 매번 평가한다. → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)

## 2. Cedar + Amazon Verified Permissions — 앱 인가 외부화
**Cedar**는 AWS가 만든 오픈소스 인가 정책 언어이고, **Amazon Verified Permissions(AVP)** 는 이를 호스팅·평가하는 관리형 서비스다. 앱은 "이 사용자가 이 액션을 이 리소스에 해도 되나?"를 AVP에 묻고(`IsAuthorized`), AVP가 정책을 평가해 `ALLOW`/`DENY`를 반환한다.

Cedar 정책은 **principal(주체) · action(행위) · resource(대상)** 의 PARC 모델과 조건(`when`/`unless`)으로 구성된다.

```cedar
// 같은 그룹의 사진 앨범은 소유자만 볼 수 있다 (조건부 허용)
permit (
  principal,
  action == Action::"viewPhoto",
  resource
)
when {
  resource.owner == principal &&
  resource.classification != "confidential"
};

// 명시적 거부는 항상 허용을 이긴다
forbid (
  principal,
  action,
  resource
)
when { resource.tag == "quarantined" };
```

| 요소 | 의미 |
| --- | --- |
| `permit` / `forbid` | 허용/거부 — **forbid가 permit을 항상 우선(deny overrides)** |
| principal / action / resource | 누가 / 무엇을 / 어디에 |
| `when` / `unless` | 조건(속성·관계 기반, ABAC/RBAC 모두 표현 가능) |
| schema | 엔터티 타입·액션·속성 정의(정책 검증에 사용) |

- Cedar의 평가는 **결정적이고 분석 가능**하게 설계되어, 정책이 의도대로인지 정적 분석·테스트할 수 있다. RBAC와 ABAC를 한 언어로 함께 표현한다.
- AVP는 정책 저장소·버전·평가를 관리형으로 제공하며, 인증된 신원(예: Amazon Cognito/OIDC 토큰)과 결합해 토큰 클레임을 principal 속성으로 매핑한다.
- 인가 모델(RBAC/ABAC/ReBAC)의 개념 정리는 → [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md)

## 3. AWS Verified Access — ZTNA
사내 애플리케이션을 VPN 없이 노출하되, **모든 요청을 신원·디바이스 신뢰 컨텍스트로 매번 평가**하는 제로 트러스트 네트워크 액세스(ZTNA) 서비스다.

| 요소 | 역할 |
| --- | --- |
| 신뢰 공급자(Trust provider) | 사용자 신원(OIDC/IAM Identity Center) + 디바이스 신뢰(서드파티) |
| 액세스 정책 | **Cedar 기반** 정책으로 접근 허용 조건 정의 |
| 평가 단위 | 애플리케이션 단위, 요청마다 평가(네트워크 위치에 의존하지 않음) |
| 로깅 | 모든 접근 결정 로그(감사·탐지) |

- Verified Access도 정책 언어로 **Cedar**를 사용한다. "회사 발급·패치된 디바이스 + 특정 그룹"처럼 신원·디바이스·컨텍스트를 조합한 조건을 표현한다.
- VPN의 "한 번 들어오면 내부 신뢰"라는 암묵적 신뢰를 제거하고, 네트워크 분할과 함께 작동한다. → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md)

## 4. AWS Private CA — 내부 PKI / mTLS
**AWS Private Certificate Authority**는 내부 전용 인증서를 발급·관리하는 관리형 사설 CA다. 서비스 간 통신을 **상호 TLS(mTLS)** 로 보호하는 신원 기반의 토대가 된다.

| 용도 | 내용 |
| --- | --- |
| 내부 TLS 인증서 | 마이크로서비스·내부 엔드포인트용 서버/클라이언트 인증서 |
| mTLS | 서비스가 서로 인증서로 신원 증명(양방향) |
| 통합 | EKS/App Mesh, API Gateway mTLS, IoT, ACM 연동 |
| 라이프사이클 | 발급·갱신·폐기(CRL/OCSP) 자동화 |

- mTLS는 "네트워크에 있으니 신뢰"가 아니라 "유효한 인증서를 가진 신원만 신뢰"로 전환해 제로 트러스트와 정합한다. 인증서·TLS의 기초는 → [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md)
- 사설 CA의 루트/중간 키는 KMS·HSM으로 보호되며, 발급 권한 자체를 IAM으로 통제한다.

## 5. Security Lake / OCSF — 통합 가시성
- **Amazon Security Lake**: 보안 로그를 **OCSF(Open Cybersecurity Schema Framework)** 표준 스키마로 중앙 수집·정규화한다. 위 정책·접근 결정 로그(AVP/Verified Access)와 인프라 로그를 한 곳에서 분석·탐지·감사할 수 있다.
- 인가 외부화의 가치는 결국 "모든 접근 결정이 로그로 남고 한 곳에서 분석된다"로 완성된다. → [SIEM 연동 — Security Lake / OCSF / 3rd party](../detection-response/detection/siem-security-lake.md)

## 핵심 고려사항
- 인가 로직을 코드에서 Cedar/AVP로 분리해 감사·테스트·일관성을 확보한다.
- Cedar는 `forbid`가 `permit`을 우선하므로, 금지 규칙으로 안전한 기본값을 만든다.
- Verified Access로 내부 앱 접근을 신원·디바이스 컨텍스트 기준으로 매 요청 평가한다(VPN 암묵 신뢰 제거).
- Private CA로 서비스 간 mTLS를 적용해 네트워크 위치가 아닌 신원으로 신뢰한다.
- 정책·접근 결정 로그를 Security Lake(OCSF)로 모아 가시성·탐지로 연결한다.

## 흔한 함정
- 인가 규칙을 코드에 하드코딩 → 감사·일관성·변경 비용 증가.
- Cedar 정책을 schema 없이 작성·검증 없이 배포 → 의도치 않은 허용/거부.
- Verified Access를 신원만 보고 디바이스 신뢰를 빼먹어 ZTNA가 반쪽이 됨.
- 사설 CA의 키 보호·발급 권한 통제를 소홀히 해 내부 신뢰 기반이 훼손됨.
- 접근 결정 로그를 수집·분석하지 않아 외부화의 가시성 이점을 잃음.

## 관련
- [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md) · [Zero Trust Architecture](../foundations/zero-trust-architecture.md) · [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md) · [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md) · [SIEM 연동 — Security Lake / OCSF / 3rd party](../detection-response/detection/siem-security-lake.md)

### References
- [Amazon Verified Permissions](https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/what-is-avp.html) · [Cedar 정책 언어](https://docs.cedarpolicy.com/) · [cedarpolicy.com](https://www.cedarpolicy.com/)
- [AWS Verified Access](https://docs.aws.amazon.com/verified-access/latest/ug/what-is-verified-access.html)
- [AWS Private CA](https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html)
- [Amazon Security Lake / OCSF](https://docs.aws.amazon.com/security-lake/latest/userguide/what-is-security-lake.html)

