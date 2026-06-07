---
title: "ID 페더레이션 — Identity Center / SAML / OIDC"
sidebar_label: "ID 페더레이션 — Identity Center / SAML / OIDC"
sidebar_position: 3
tags:
  - "자격증명"
---
# ID 페더레이션

:::info[한 줄 정의]
외부 IdP(AD/Okta/Entra ID)의 신원으로 AWS에 접근하고, AWS엔 **임시 자격만** 남긴다. 사용자는 한 곳에서 관리. **IAM Identity Center가 허브**, 프로토콜은 [SAML/OIDC](../foundations/authentication-protocols.md).
:::

## 1. 핵심 구분 — 누구를 위한 ID인가
| 대상 | 솔루션 |
|---|---|
| **직원/운영자(workforce)** | **IAM Identity Center** + 외부 IdP |
| **앱 최종사용자(B2C/B2B)** | **Amazon Cognito** (user pool) |
| **워크로드(M2M)** | OIDC 페더레이션 / Roles Anywhere → [IAM 핵심 — User/Group/Role/Policy](./iam-core.md) |

> 흔한 실수: 직원 콘솔 접근에 Cognito를 쓰거나, B2C 사용자를 IAM User로 만드는 것. 대상부터 구분.

## 2. IAM Identity Center (구 AWS SSO)
- **Permission Set**: 멀티 계정에 걸쳐 역할/권한을 정의 → 사용자/그룹에 할당 → 한 번 로그인으로 여러 계정 전환.
- 외부 IdP 연동(SAML 2.0/OIDC) + **SCIM**으로 사용자·그룹 자동 프로비저닝/디프로비저닝.
- 콘솔·CLI·앱 접근 통합. 내장 디렉터리 또는 AD/외부 IdP.

## 3. 페더레이션 프로토콜 매핑
- **SAML 2.0**: 엔터프라이즈 SSO(레거시 AD/Okta) → STS 임시 자격.
- **OIDC**: 신규/모바일/워크로드. 예) **GitHub Actions → IAM OIDC**(키리스 CI/CD), EKS IRSA.
- AD 연동: AWS Managed Microsoft AD, AD Connector, 신뢰 관계.

## 4. 워크로드 페더레이션 (키 없는 자격)
- CI/CD: GitHub/GitLab OIDC → AssumeRoleWithWebIdentity → 장기 키 제거.
- → [IAM 핵심 — User/Group/Role/Policy](./iam-core.md) (Roles Anywhere, Pod Identity/IRSA)

## 5. 자주 받는 질문
- "IAM User로 다 관리" → IdP 단일화 + Identity Center로 온/오프보딩 자동화(SCIM).
- "퇴사자 권한 잔존" → IdP에서 비활성화 시 **SCIM 동기화로 AWS 접근도 자동 차단**.
- "여러 계정 로그인 번거로움" → Permission Set + Identity Center 포털 단일 진입.

## 관련
- [IAM 핵심 — User/Group/Role/Policy](./iam-core.md) · [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](./privileged-access-management.md) · [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](../foundations/authentication-protocols.md)

### References
- AWS — [IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html), Cognito, SAML/OIDC 페더레이션 문서
- [GitHub Actions ↔ AWS OIDC](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)

