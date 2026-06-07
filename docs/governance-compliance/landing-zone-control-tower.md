---
title: "Landing Zone & Control Tower — Preventive / Detective"
sidebar_label: "Landing Zone & Control Tower — Preventive / Detective"
sidebar_position: 6
tags:
  - "거버넌스"
---
# Landing Zone & Governance Architecture

:::info[한 줄 정의]
Landing Zone은 **계정 구조·네트워크·로깅·ID·가드레일**을 안전한 기본값으로 갖춘 멀티 계정 토대다. **Control Tower**는 이 토대를 자동으로 구축·운영해주는 관리형 서비스이며, 통제는 **예방(Preventive)** 과 **탐지(Detective)** 두 축으로 코드화된다.
:::

:::tip[핵심 대비]
- **Preventive(예방)** = 애초에 못 하게 막는다 → SCP/RCP, Control Tower 예방 컨트롤.
- **Detective(탐지)** = 일어났으면 알아챈다 → Config 규칙, Security Hub.
- **Proactive(사전)** = 배포 전에 차단 → CloudFormation Hooks 기반 컨트롤.
- 셋 다 필요하다. 예방만으론 모든 경우를 막을 수 없고, 탐지만으론 사고를 사전에 멈출 수 없다. → [Defense in Depth (심층 방어)](../foundations/defense-in-depth.md)
:::

## 1. 왜 중요한가
계정이 늘어나면(팀별·환경별·프로젝트별) 보안 기준선이 계정마다 제각각이 되고, 로그가 흩어지며, 누가 무엇을 할 수 있는지 통제가 어려워진다. Landing Zone은 **새 계정이 발급되는 순간 표준 보안·네트워크·로깅·가드레일이 자동 적용**되도록 만들어, 거버넌스를 일회성 점검이 아니라 *구조*로 보장한다.

이는 컴플라이언스 증빙(→ [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md))과도 직결된다. 조직 단위로 통제를 배포해야 Config Conformance Pack·Security Hub 표준·Audit Manager가 일관된 증거를 산출할 수 있다.

## 2. Landing Zone — 표준 토대의 구성요소

| 영역 | 표준 구성 |
|---|---|
| **계정 구조** | AWS Organizations + OU 계층, 관리/로그아카이브/감사(보안) 등 코어 계정 분리 |
| **ID·접근** | IAM Identity Center(SSO), 최소권한, 권한 집합. → [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](../identity-access/privileged-access-management.md) |
| **로깅·감사** | CloudTrail(조직 trail), Config, 중앙 로그아카이브 계정. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md) |
| **네트워크** | VPC 표준, 세분화, 중앙 egress·인스펙션. → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md) |
| **가드레일** | SCP/RCP(예방) + Config 규칙(탐지) |

- **코어 계정 분리 원칙**: 로그를 별도 **로그아카이브 계정**에 모으고(권한 분리·불변성), 보안 도구는 **감사(보안) 계정**에 위임 관리자로 둔다. 운영 계정 침해가 로그·보안 통제까지 무력화하지 못하게 하는 설계다.
- Landing Zone은 직접 구축(IaC)할 수도, Control Tower로 자동 구축할 수도 있다.

## 3. AWS Control Tower — Landing Zone 자동화

Control Tower는 모범사례 기반 Landing Zone을 콘솔에서 자동 구성·운영하는 관리형 서비스다.

| 기능 | 설명 |
|---|---|
| **Landing Zone 설정** | Organizations, 코어 OU(예: Security, Sandbox), 로그아카이브·감사 계정, CloudTrail/Config 자동 구성 |
| **Controls(가드레일)** | 예방·탐지·사전 통제 카탈로그를 OU 단위로 활성화 |
| **Account Factory** | 표준 베이스라인이 적용된 새 계정을 셀프서비스로 발급(프로비저닝) |
| **Dashboard** | OU·계정·컨트롤 준수 상태 가시화 |

- **Controls 분류**: ① **Mandatory**(항상 적용), ② **Strongly recommended**, ③ **Elective**. 동작 방식으로는 **Preventive(SCP 기반)**, **Detective(Config 기반)**, **Proactive(CloudFormation Hooks 기반)** 로 나뉜다.
- **Account Factory**: 네트워크·로깅·가드레일이 사전 적용된 계정을 표준 템플릿으로 발급해, 계정이 무질서하게 늘어나는 문제를 구조적으로 해결한다.
- 멀티 계정 조직 설계 전반은 → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md).

## 4. Preventive vs Detective Controls

| 구분 | 메커니즘 | 예시 | 한계 |
|---|---|---|---|
| **Preventive** | SCP / RCP (조직 정책) | 특정 리전 차단, 루트 사용자 행위 제한, 암호화 없는 작업 거부 | 지원되는 액션·조건 범위 내에서만 |
| **Detective** | AWS Config 규칙 / Security Hub | 퍼블릭 S3 버킷·미암호화 볼륨 탐지 | 이미 발생한 뒤 알아챔(교정 필요) |
| **Proactive** | CloudFormation Hooks | 배포 전 비준수 리소스 생성 차단 | CFN 경로 배포에만 적용 |

- **SCP(Service Control Policy)**: OU/계정의 **최대 권한 경계**를 정의한다. SCP가 허용하지 않으면 그 안의 어떤 IAM 정책도 권한을 부여할 수 없다. 권한을 *부여*하는 것이 아니라 *상한을 거는* 정책이다. → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md)
- **RCP(Resource Control Policy)**: 리소스 측면에서 조직 전체에 권한 상한을 거는 정책(예: 조직 외부 principal의 S3 접근 거부 등). SCP가 principal 측 상한이라면 RCP는 resource 측 상한이다.
- **Detective**: Config 규칙·Conformance Pack과 Security Hub 표준이 위반을 상시 탐지하고, 자동 교정(remediation)으로 연결할 수 있다. → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md) · [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)

## 5. OU 설계 & 태그 정책

- **OU 설계 원칙**: 워크로드 성격·환경(운영/개발/샌드박스)·규제 범위(예: PCI 범위 OU 분리)·신뢰 경계에 따라 OU를 나눈다. 통제는 *계정마다*가 아니라 **OU 단위로** 적용해 일관성과 확장성을 얻는다. (AWS 권장: Security·Infrastructure·Workloads·Sandbox 등 기능 기반 OU)
- **Tag Policy**: Organizations의 태그 정책으로 표준 태그 키·값 형식을 강제해, 비용 할당(cost allocation)·소유권·데이터 분류를 일관화한다.
- **SCP + Tag Policy 결합**: 예를 들어 필수 태그가 없는 리소스 생성을 SCP로 거부하거나, 특정 태그 기반으로 접근을 제어(ABAC)할 수 있다.

## 6. Customizations & 조직 IaC

| 옵션 | 용도 |
|---|---|
| **Customizations for Control Tower (CfCT)** | Control Tower 위에 추가 리소스·SCP·Config를 CI/CD로 배포(거버넌스 확장) |
| **Account Factory for Terraform (AFT)** | Terraform 기반으로 계정 발급·커스터마이즈를 자동화(GitOps) |
| **CloudFormation StackSets** | 조직/OU 전반에 스택을 일괄 배포 |

- CfCT는 Control Tower의 라이프사이클 이벤트에 맞춰 커스텀 리소스를 배포하고, AFT는 Terraform 워크플로로 계정 베이스라인을 코드화한다. 둘 다 "계정 발급 = 표준 통제 자동 적용"을 코드로 보장하는 도구다.
- 조직 거버넌스를 IaC로 관리하면 변경 이력·리뷰·롤백이 가능해져 감사 증빙에도 유리하다.

## 핵심 고려사항
- **Control Tower vs 직접 IaC**: 빠른 표준화·관리형 운영이면 Control Tower, 고도의 커스터마이즈·기존 조직 통합이면 직접 IaC(또는 CfCT/AFT로 절충). 이미 구성된 Organizations 위에도 Control Tower 도입이 가능하다.
- **SCP 설계 신중히**: 너무 넓게 거부하면 운영 장애, 너무 좁으면 통제 공백. 샌드박스 OU에서 검증 후 적용하고 deny는 점진 확대한다.
- **로그·보안 계정 권한 분리**: 코어 계정의 접근을 최소화해 침해 시 통제 무력화를 방지.
- **컨트롤과 컴플라이언스 연결**: 활성화한 컨트롤이 곧 Config/Security Hub 증거가 되도록 설계하면 감사 준비가 자동화된다. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)
- **드리프트 관리**: 수동 변경으로 Landing Zone이 표준에서 벗어나면(drift) Control Tower가 이를 표시한다. 정기 점검·재적용 프로세스를 둔다.

## 흔한 함정
- SCP로 권한을 *부여*하려 함 — SCP는 상한(deny boundary)일 뿐. 실제 권한은 IAM 정책으로. → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md)
- 계정마다 개별 통제 적용 — OU 단위로 묶지 않으면 확장 시 일관성이 무너진다.
- 예방 통제만 신뢰 — SCP가 못 막는 영역은 Detective로 보완해야 한다.
- 로그를 운영 계정에 보관 — 침해 시 증거가 함께 훼손. 별도 로그아카이브 계정 필수.
- Control Tower 외부에서 수동 변경 후 드리프트 방치 — 거버넌스가 서서히 무력화된다.
- 태그 표준 부재 — 비용 할당·ABAC·데이터 분류가 모두 흔들린다.

## 관련
- [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md) · [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md) · [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md) · [Defense in Depth (심층 방어)](../foundations/defense-in-depth.md) · [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md) · [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](../identity-access/privileged-access-management.md)

### References
- [AWS Control Tower 사용 설명서](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html) · [Controls 라이브러리](https://docs.aws.amazon.com/controltower/latest/controlreference/controls.html)
- [Customizations for AWS Control Tower (CfCT)](https://docs.aws.amazon.com/controltower/latest/userguide/cfct-overview.html) · [Account Factory for Terraform (AFT)](https://docs.aws.amazon.com/controltower/latest/userguide/aft-overview.html)
- [Organizations SCP](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) · [Resource Control Policies (RCP)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html)
- [Organizations Tag Policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html) · [AWS 멀티 계정 권장 OU 구조](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/recommended-ous.html)

