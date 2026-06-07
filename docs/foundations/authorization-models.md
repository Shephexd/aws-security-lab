---
title: "인가 모델 — RBAC / ABAC / ReBAC / Cedar"
sidebar_label: "인가 모델 — RBAC / ABAC / ReBAC / Cedar"
sidebar_position: 2
tags:
  - "기초"
---
# 인가 모델 (Authorization Models)

:::info[한 줄 정의]
인가는 "인증된 주체가 *무엇을* 할 수 있는가"를 결정하는 규칙. 모델 선택이 권한 폭발(role explosion)·감사 가능성·확장성을 좌우한다.
:::

## 1. 왜 중요한가
IAM 정책, SCP, Cognito 그룹, EKS RBAC, Verified Permissions(Cedar) 설계의 근간. "역할이 수백 개로 늘었어요" 같은 고객 고통은 모델 선택 실패다.

## 2. 모델 비교
| 모델 | 결정 기준 | 강점 | 약점 | 표준/대표 |
|---|---|---|---|---|
| **RBAC** (역할기반) | 사용자→역할→권한 | 단순·감사 쉬움 | 조건 많아지면 **역할 폭발** | ANSI **INCITS 359** |
| **ABAC** (속성기반) | 주체/자원/환경 **속성**을 정책 규칙으로 평가 | 동적·확장적, 역할 수 적음 | 태그 거버넌스 필수, 디버깅 난이도 | **NIST SP 800-162** |
| **ReBAC** (관계기반) | 주체↔객체 **관계 그래프** | 공유/계층 표현(구글드라이브식) | 구현 복잡 | Google **Zanzibar** (2019) |
| **PBAC/Policy** | 중앙 정책 엔진 | 코드로 관리, 일관성 | 엔진 운영 필요 | **Cedar**/OPA(Rego)/XACML |

> **NIST SP 800-162의 ABAC 정의**: "주체·객체·요청 동작, (때로) 환경 조건의 *속성* 을, 허용 가능한 동작을 기술한 *정책/규칙/관계* 에 대조하여 인가를 결정하는 논리적 접근통제." 즉 RBAC가 "역할"이라는 단일 속성에 묶인 특수 사례라면, ABAC는 임의 속성으로 일반화한 것.
>
> **ReBAC (Zanzibar)**: 권한을 `(object, relation, subject)` **관계 튜플**로 저장. 예: `doc:readme#viewer@user:alice`. "alice가 readme의 viewer인가?"를 그래프 탐색으로 답함. 폴더 상속·그룹 멤버십·공유 같은 *전이적 관계*를 자연스럽게 표현 → 구글 Drive/Docs/Cloud의 인가가 이 방식. (용어는 2006 Carrie Gates가 제안)

## 3. AWS에서의 매핑
- **RBAC**: IAM 역할/그룹, 관리형 정책. 가장 흔함.
- **ABAC**: IAM `Condition` + 리소스/주체 **태그** (`aws:PrincipalTag`, `aws:ResourceTag`). 예: "팀 태그가 같으면 접근". 멀티팀 확장 시 역할 수를 극적으로 줄임.
  - 전제: **태그 정책(Tag Policy)으로 태그 표준 강제**, 안 그러면 무너짐.
- **Cedar / Amazon Verified Permissions**: 앱 레벨 인가를 정책 언어로 외부화(코드에서 if문 제거). RBAC·ABAC·ReBAC를 한 언어로 표현. → [Cloud-Native 보안 — Cedar / Verified Permissions / Private CA](../advanced/cloud-native-security-cedar.md)

## 3.5 Cedar 정책 예시
Cedar의 평가 의미론: **기본 거부(default deny)** — `permit` 정책을 하나라도 만족해야 허용. 그리고 **`forbid`가 `permit`을 항상 이긴다**(IAM의 explicit deny와 동일 철학). → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md)

```cedar
// RBAC — "학생" 그룹(역할)에 속하면 문제 제출 허용
permit (
  principal in Role::"Students",
  action == Action::"submitProblem",
  resource
);

// ABAC — 리소스의 소유자(owner 속성)와 요청자가 같으면 급여 열람 허용
permit (
  principal,
  action == Action::"viewSalary",
  resource
) when { principal == resource.owner };

// RBAC+ABAC 결합 — 매니저 역할 + 같은 부서일 때만
permit (
  principal in Role::"Manager",
  action == Action::"viewSalary",
  resource
) when { principal.department == resource.department };

// forbid — 어떤 permit이 있어도 격리 태그 리소스는 차단(우선)
forbid (principal, action, resource)
when { resource.tags has "quarantine" };
```
> 핵심 통찰: 같은 엔진에서 그룹(`in Role::`)으로 RBAC, 조건(`when {...}`)으로 ABAC, 관계(`resource.owner`)로 ReBAC식 표현을 *조합* 한다. 인가 로직이 코드 밖 정책으로 나와 **감사·변경·정적 분석**이 가능해지는 게 가치.

## 4. 최소 권한 원칙 (Least Privilege) — 실무
- 시작은 넓게 주고 좁히는 게 아니라, **IAM Access Analyzer로 실제 사용 권한 기반 정책 생성**.
- Permission Boundary로 위임 시 상한선 설정. SCP로 조직 가드레일.
- → 자세한 정책 평가 순서는 [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md)

## 5. 자주 받는 질문
- 역할이 지나치게 많아진 경우 ABAC + 태그 전략으로의 전환을 검토한다.
- ABAC를 도입하려면 먼저 **태그 거버넌스**(SCP로 태그 강제, 태그 정책)를 갖춰야 한다. 그렇지 않으면 위험하다.
- 앱 내부 인가 로직이 코드에 흩어져 있다면 Verified Permissions(Cedar)로 외부화해 감사와 변경을 쉽게 만들 수 있다.

## 6. 흔한 함정
- ABAC에서 태그 변조 = 권한 상승 → 태그 변경 권한 자체를 엄격히 통제.
- "와일드카드(`*`) 정책"의 누적, 미사용 권한 방치 → Access Analyzer 미사용 권한 분석.

## 관련
- [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](./authentication-protocols.md) · [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](./threat-modeling-attack.md) · [Cloud-Native 보안 — Cedar / Verified Permissions / Private CA](../advanced/cloud-native-security-cedar.md)

### References
- **NIST SP 800-162** (ABAC Definition & Considerations) — [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)
- **ANSI INCITS 359** (RBAC), NIST RBAC 모델
- **Cedar** 정책 언어 — [docs.cedarpolicy.com](https://docs.cedarpolicy.com/) · [AWS: Verified Permissions로 인가하기](https://aws.amazon.com/blogs/security/how-to-use-amazon-verified-permissions-for-authorization/) · [AWS Prescriptive Guidance: RBAC/ABAC with Cedar](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/cedar.html)
- **Google Zanzibar** (ReBAC) — [Zanzibar 논문 해설(authzed)](https://authzed.com/learn/google-zanzibar)

