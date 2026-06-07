---
title: "IAM 핵심 — User/Group/Role/Policy"
sidebar_label: "IAM 핵심 — User/Group/Role/Policy"
sidebar_position: 1
tags:
  - "자격증명"
---
# IAM 핵심

:::info[한 줄 정의]
User는 사람·**장기 자격(액세스 키)**, Role은 신뢰 가능한 주체가 받아쓰는 **임시 자격(STS)**. 클라우드 보안의 황금률은 **"장기 키를 없애고 Role+STS로"**.
:::

## 1. 구성요소
- **User**: 사람/앱의 영속 ID. 장기 자격(콘솔 비번, 액세스 키) → *유출 시 장기 피해* → 지양.
- **Group**: User 묶음에 정책 부여(권한 관리 단위).
- **Role**: 영속 자격이 없는 ID. 신뢰 정책이 허용한 주체가 **AssumeRole**로 임시 자격(STS) 획득.
- **Policy**: 권한(JSON). 식별 → [정책 평가 로직](./iam-policy-evaluation-logic.md).

## 2. 두 종류의 정책 (Role엔 둘 다)
- **신뢰 정책(trust policy)**: *누가* 이 Role을 맡을 수 있나(Principal). = Role의 출입문.
- **권한 정책(permissions policy)**: 맡은 뒤 *무엇을* 할 수 있나.
- 흔한 오해: 권한만 주고 신뢰 정책을 안 맞춰 "AssumeRole 거부" → 둘 다 필요.

## 3. STS (임시 자격의 핵심)
- `AssumeRole`(역할 전환·cross-account), `AssumeRoleWithWebIdentity`(OIDC), `AssumeRoleWithSAML`(SAML), `GetSessionToken`(MFA 강제).
- 자격에 **만료(기본 1h, 최대 12h)** → 유출돼도 수명 제한. **session policy**로 추가 제한 가능.
- `ExternalId`/`aws:SourceArn`으로 **confused deputy** 방어. → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

## 4. 워크로드별 자격 획득 (장기 키 0 지향)
| 워크로드 | 권장 방식 |
|---|---|
| EC2 | 인스턴스 프로파일(역할) + **IMDSv2** → [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md) |
| ECS | task role(태스크별 분리) |
| EKS | **Pod Identity**(신규·간편, EKS 클라우드) 또는 **IRSA**(OIDC, EKS Anywhere/자체관리/ROSA도 지원) → [EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy](../application-workload/appsec/eks-kubernetes-security.md) |
| Lambda | 실행 역할(함수별 최소권한) |
| 온프레/타클라우드 | **IAM Roles Anywhere**(X.509 인증서로 임시 자격) |
| CI/CD(GitHub Actions 등) | **OIDC 페더레이션**(키리스) → [ID 페더레이션 — Identity Center / SAML / OIDC](./identity-federation.md) |

> Pod Identity vs IRSA: Pod Identity는 OIDC 공급자 설정 없이 EKS 서비스 주체로 *간편*, 대규모 관리 쉬움(EKS 클라우드 전용). IRSA는 범용(다양한 K8s 환경). 공존 가능.

## 5. 정책 형태
- **관리형(managed)**: 재사용·버전관리(AWS managed vs customer managed). 권장.
- **인라인(inline)**: 주체에 1:1 박힘. 예외적 사용.
- **서비스 연결 역할(SLR)**: 서비스가 자기 동작에 쓰는 미리 정의된 역할.

## 6. 자주 받는 질문
- "IAM User 100개 + 액세스 키" → **Identity Center(사람) + Role(워크로드)** 로 전환, 장기 키 회수. → [ID 페더레이션 — Identity Center / SAML / OIDC](./identity-federation.md)
- "키가 깃허브에 노출됐어요" → 즉시 회수 + 근본적으론 **키 자체를 없애는**(OIDC/Roles Anywhere) 설계.
- "액세스 키 로테이션 정책" → 애초에 키를 안 쓰는 게 최선. 불가피하면 Access Analyzer로 미사용 키 탐지. → [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](./privileged-access-management.md)

## 관련
- [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](./iam-policy-evaluation-logic.md) · [ID 페더레이션 — Identity Center / SAML / OIDC](./identity-federation.md) · [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](./privileged-access-management.md) · [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](../foundations/authentication-protocols.md)

### References
- [AWS — IAM roles / STS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) · [EKS Pod Identity 발표](https://aws.amazon.com/blogs/containers/amazon-eks-pod-identity-a-new-way-for-applications-on-eks-to-obtain-iam-credentials/) · IAM Roles Anywhere 문서

