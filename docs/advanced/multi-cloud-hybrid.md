---
title: "멀티클라우드 & 하이브리드 보안"
sidebar_label: "멀티클라우드 & 하이브리드 보안"
sidebar_position: 2
tags:
  - "고급"
---
# 멀티클라우드 & 하이브리드 보안

:::info[한 줄 정의]
멀티클라우드/하이브리드 보안은 서로 다른 신뢰 경계(클라우드 사업자·온프레미스)에 흩어진 **신원·로그·가드레일·네트워크·키**를 *일관된 정책*으로 묶어 가시성과 통제력을 회복하는 작업이다. 핵심 난제는 "각 환경의 보안 모델이 다르다"는 점이며, 목표는 *공통 추상화*를 만드는 것이지 *최소 공통분모*로 낮추는 것이 아니다.
:::

:::tip[큰 그림]
멀티클라우드는 보통 *선택*이 아니라 *현실*(M&A, 부서별 도입, SaaS 종속, 규제상 분산)로 주어진다. 따라서 "단일 클라우드로 통일"보다 **교차 환경 거버넌스**를 설계하는 편이 실용적이다. 통제 영역을 5축 — ① 신원 ② 가시성(로그/SIEM) ③ 가드레일(정책) ④ 네트워크 ⑤ 키 — 으로 나눠 각각 경계를 명확히 하면 복잡도가 관리 가능해진다.
:::

## 1. 왜 중요한가
환경이 늘어나면 보안 사고는 *경계의 틈*에서 발생한다. 한 클라우드의 IAM 모델에 익숙한 팀이 다른 클라우드의 권한 모델을 잘못 이해해 과대 권한을 부여하거나, 로그가 환경별로 흩어져 침해 시 전체 타임라인을 재구성하지 못하는 식이다.

- **가시성 분산**: 각 클라우드의 네이티브 로그 포맷(CloudTrail / Azure Activity Log / GCP Cloud Audit Logs)이 달라 단일 SIEM에서 상관분석이 어렵다.
- **정책 드리프트**: 환경마다 가드레일이 따로 관리되면 한쪽에만 적용된 통제가 사고의 단초가 된다.
- **신원 난립**: 클라우드별 로컬 계정이 늘면 퇴사자 잔존 계정·과대 권한이 누적된다.
- **책임 경계 모호**: [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)이 사업자마다 미묘하게 다르다 → 누가 무엇을 책임지는지 문서화 필요.

## 2. 통합 신원 페더레이션 (Identity)
모든 클라우드가 *공통 IdP*를 신뢰하게 만들어 신원을 한 곳에서 관리한다. 로컬 계정/장기 액세스 키는 최소화하고 단기 자격(STS AssumeRole류)을 발급한다.

| 항목 | 권장 패턴 | 비고 |
| --- | --- | --- |
| 중앙 IdP | 외부 IdP(예: 기업 SSO) 또는 IAM Identity Center를 허브로 | SAML 2.0 / OIDC 표준 사용 |
| AWS 진입 | IAM Identity Center로 다계정 권한 집합 매핑 | → [ID 페더레이션 — Identity Center / SAML / OIDC](../identity-access/identity-federation.md) |
| 단기 자격 | 모든 환경에서 페더레이션 기반 임시 자격 | 장기 키 회수 |
| 워크로드 간 | OIDC/워크로드 ID 페더레이션(키 없는 신뢰) | 클라우드 간 서비스 호출 시 |
| 거버넌스 | 그룹/속성(ABAC) 기반, 조인-무브-리브 자동화 | 환경별 권한을 IdP 그룹에 귀속 |

- 신원의 **단일 소스(single source of truth)**를 둬 프로비저닝/디프로비저닝을 일원화한다.
- 클라우드별 권한 모델 차이는 *매핑 계층*에서 흡수한다(같은 IdP 그룹 → 각 클라우드의 역할/권한 집합).

## 3. 통합 가시성: 로그 정규화와 SIEM (Visibility)
서로 다른 로그를 **공통 스키마**로 정규화해 한 곳에서 질의·탐지한다. AWS 측에서는 Security Lake가 로그를 **OCSF(Open Cybersecurity Schema Framework)**로 정규화해 S3에 적재한다.

| 소스 | 정규화/수집 | 분석 |
| --- | --- | --- |
| AWS 로그(CloudTrail, VPC Flow, GuardDuty 등) | Security Lake → OCSF/Parquet | → [SIEM 연동 — Security Lake / OCSF / 3rd party](../detection-response/detection/siem-security-lake.md) |
| 타 클라우드/온프레 로그 | 커스텀 소스로 OCSF 변환 후 Security Lake 또는 SIEM 직접 적재 | 사업자별 익스포터 |
| 통합 분석 | 외부 SIEM 또는 Athena/OpenSearch로 교차 질의 | 단일 타임라인 |
| 탐지 | Security Hub로 findings 집계 + 사업자 네이티브 탐지 병행 | → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md) |

- 목표는 *침해 시 모든 환경을 가로지르는 단일 타임라인*을 만드는 것이다. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)
- 로그를 한 곳에 모을 때 **수집 비용·전송 대역·데이터 주권(리전/국경)**을 함께 설계한다.

## 4. 일관된 가드레일: Policy as Code (Guardrails)
정책을 코드로 선언해 환경 전반에 동일하게 적용하고 드리프트를 탐지한다. 단일 정책 엔진으로 모든 클라우드를 강제하기는 어렵기 때문에 *공통 의도 → 환경별 강제*의 2계층으로 본다.

| 계층 | AWS 강제 수단 | 교차 환경 |
| --- | --- | --- |
| 예방(preventive) | SCP / 리소스 정책으로 금지 동작 차단 | → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md) |
| 탐지(detective) | AWS Config 규칙 + Security Hub 표준 | 사업자별 CSPM 병행 |
| 정책 언어 | Cedar(검증 가능한 권한 정책) | → [Cloud-Native 보안 — Cedar / Verified Permissions / Private CA](./cloud-native-security-cedar.md) |
| 공통 정책 엔진 | OPA/Cedar 등으로 의도 표현 후 각 환경에 번역 | CI/CD 게이트에서 평가 |
| IaC 게이트 | 배포 전 정책 검사(devsecops) | → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md) |

- **CSPM(Cloud Security Posture Management)**: 환경별 설정 오류(공개 스토리지, 과대 권한)를 지속 점검. AWS는 Security Hub/Config가 그 역할을 하며, 멀티클라우드는 이를 집계하는 상위 CSPM을 둔다.
- 정책은 *예방을 우선*하고(SCP로 아예 막기) 탐지는 보완으로 둔다. → [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md)

## 5. 네트워크 연결 (Connectivity)
하이브리드 연결은 *전송 보안·경로 통제·세분화*를 동시에 만족해야 한다.

| 방식 | 용도 | 보안 고려 |
| --- | --- | --- |
| **Site-to-Site VPN** | 빠른 구축, 중소 대역, 백업 경로 | IPsec 암호화, 인터넷 경유 |
| **Direct Connect** | 전용 회선, 안정적 대역·지연 | 전용선이라도 암호화 별도(MACsec 또는 위에 VPN) |
| **Transit Gateway** | 다수 VPC·온프레·타 환경 허브 | 라우팅 도메인 분리로 세분화 |
| **PrivateLink** | 서비스 단위 사설 노출(VPC 노출 없이) | 최소 노출, → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md) |

- Direct Connect는 *전용 회선*이지만 본질적으로 암호화가 아님 → 민감 트래픽은 MACsec 또는 상위 VPN/TLS로 암호화한다. → [하이브리드 연결 — VPN / Direct Connect / TGW](../infrastructure-network/hybrid-connectivity.md) · [전송 중 암호화 — ACM / TLS termination](../data-protection/encryption-in-transit.md)
- Transit Gateway의 라우트 테이블 분리로 환경 간 *동서 트래픽*을 명시적으로만 허용한다(기본 차단). → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)

## 6. 키 관리 경계 (Key Management)
키는 *신뢰 경계*를 정의하는 가장 민감한 자산이다. 멀티클라우드에서 흔한 오해는 "키를 한 곳에 모으면 편하다"인데, 키를 한 사업자에 두면 *그 사업자가 다른 환경 데이터의 신뢰 경계*가 된다.

| 전략 | 설명 | 트레이드오프 |
| --- | --- | --- |
| 환경별 네이티브 KMS | 각 클라우드의 관리형 KMS 사용 | 단순·저비용, 키가 환경에 종속 |
| BYOK(키 가져오기) | 외부에서 생성한 키 자료를 반입 | 통제↑, 운영 복잡 |
| 외부 키 저장소(XKS) | 키를 AWS 밖 HSM에 보관, KMS는 프록시 | 최고 통제, 가용성·지연 책임 고객 |
| 전용 HSM | CloudHSM 등 단일 테넌트 HSM | FIPS 140-3 Level 3, 운영 부담 |

- *데이터가 있는 곳과 키를 통제하는 곳*을 분리할지 결정하고, 각 환경의 **키 삭제·접근 권한**을 분리·기록한다. → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)
- 암호 모듈 검증(FIPS 140-3) 요구가 환경마다 다를 수 있으니 규제 매핑을 먼저 한다. → [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md)

## 핵심 고려사항
- **공통 추상화 ≠ 최소 공통분모**: 모든 클라우드를 가장 약한 기능에 맞추지 말고, 의도(정책/신원)를 공통화하고 강제는 각 환경의 네이티브 강점을 쓴다.
- **신뢰 경계를 명시**: 5축(신원·로그·정책·네트워크·키)마다 "어디까지가 누구 책임인지" 문서화. → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)
- **데이터 주권/리전**: 로그·키·백업의 물리 위치가 규제를 만족하는지 확인.
- **운영 모델**: 환경이 늘수록 단일 팀의 인지 부하가 커진다 → 자동화(IaC, 정책 코드)와 표준 런북으로 흡수.
- **비용 가시성**: 교차 환경 로그 수집/전송 비용을 설계 단계에서 산정.

## 흔한 함정
- 클라우드별 IAM 모델 차이를 무시하고 한쪽 멘탈모델로 권한을 부여 → 과대 권한.
- 로그를 모으긴 했으나 정규화/스키마 통일이 없어 상관분석 불가.
- 가드레일을 한 환경에만 적용 → 정책 드리프트로 다른 환경이 사각지대.
- Direct Connect를 "전용선이니 암호화 불필요"로 오해 → 평문 전송.
- 모든 키를 한 사업자에 집중 → 신뢰 경계 단일화로 격리 효과 상실.
- 페더레이션 없이 로컬 계정·장기 키 난립 → 디프로비저닝 누락.

## 관련
- [ID 페더레이션 — Identity Center / SAML / OIDC](../identity-access/identity-federation.md) · [SIEM 연동 — Security Lake / OCSF / 3rd party](../detection-response/detection/siem-security-lake.md) · [하이브리드 연결 — VPN / Direct Connect / TGW](../infrastructure-network/hybrid-connectivity.md) · [Cloud-Native 보안 — Cedar / Verified Permissions / Private CA](./cloud-native-security-cedar.md) · [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md)

### References (권위 출처)
- **AWS Security Lake / OCSF** — [docs.aws.amazon.com](https://docs.aws.amazon.com/security-lake/latest/userguide/what-is-security-lake.html) · [OCSF](https://schema.ocsf.io/)
- **IAM Identity Center** — [docs.aws.amazon.com](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- **AWS Transit Gateway** — [docs.aws.amazon.com](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)
- **Direct Connect MACsec** — [docs.aws.amazon.com](https://docs.aws.amazon.com/directconnect/latest/UserGuide/MACsec.html)
- **AWS KMS External Key Store (XKS)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/keystore-external.html)
- **AWS Security Hub** — [docs.aws.amazon.com](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html)

