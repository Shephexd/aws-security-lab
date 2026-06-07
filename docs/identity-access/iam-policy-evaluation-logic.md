---
title: "IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)"
sidebar_label: "IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)"
sidebar_position: 2
tags:
  - "자격증명"
---
# IAM 정책 평가 로직

:::info[한 줄 정의]
요청 허용 여부는 여러 정책 유형의 **교집합 + explicit deny 우선** 으로 결정된다. 이 순서를 모르면 "왜 권한이 있는데 안 되지?"를 영원히 디버깅한다.
:::

## 1. 왜 중요한가
SCP, 권한 경계, 리소스 정책, 세션 정책이 동시에 걸린 멀티 계정 환경에서 *왜 막혔는지/왜 뚫렸는지* 를 정확히 설명해야 한다. 실무 디버깅의 핵심.

## 2. 대원칙 (3가지)
1. **기본은 묵시적 거부(Implicit Deny)** — 아무 것도 명시 안 하면 거부.
2. **명시적 허용(Explicit Allow)** 이 있어야 허용.
3. **명시적 거부(Explicit Deny)** 는 *무엇보다 우선* — 어떤 Allow도 이긴다.

## 3. 평가 순서 (단일 계정 내 principal 요청)
```
요청
 │
 ├─ ① Explicit Deny 있나? (어느 정책이든) ──── 있음 → ❌ 거부 (끝)
 │
 ├─ ② SCP(Organizations) 가 허용 범위에 포함? ── 아니오 → ❌
 │
 ├─ ②' RCP(Resource Control Policy) 위반? ──── 위반 → ❌
 │
 ├─ ③ Resource-based policy 에서 Allow? ─────┐
 │                                            ├─ 둘 중 하나라도 충족 시 통과*
 ├─ ④ Identity-based policy 에서 Allow? ──────┘
 │
 ├─ ⑤ Permission Boundary 범위 내? ────────── 벗어남 → ❌
 │
 ├─ ⑥ Session Policy(AssumeRole 시) 범위 내? ─ 벗어남 → ❌
 │
 └─ 모두 통과 → ✅ 허용
```
\* 동일 계정에서 identity OR resource 정책 중 하나의 Allow면 충분(단 cross-account는 **양쪽 모두** Allow 필요).

## 4. 정책 유형별 역할
| 유형 | 누가 정의 | 효과 |
|---|---|---|
| **Identity-based** | 계정 | 주체에 권한 부여 |
| **Resource-based** | 계정 | 리소스가 누구를 허용(+cross-account, principal 지정) |
| **SCP** (Service Control Policy) | Organizations | 계정 *멤버의* 권한 **상한**(가드레일) — 권한을 *주지 않음* |
| **RCP** (Resource Control Policy, 2024) | Organizations | *리소스* 접근의 상한 — 외부 principal 포함 제한 |
| **Permission Boundary** | 계정 | 위임된 주체의 권한 **상한** |
| **Session Policy** | AssumeRole 호출 시 | 그 세션의 권한 **상한** |

> 핵심 통찰: **SCP/RCP/Boundary/Session 은 "필터(상한)"** 다 — 권한을 *부여*하지 않는다. 부여는 오직 identity/resource 정책. 그래서 "SCP에 Allow 넣었는데 권한이 안 생긴다"가 정상.

## 5. Cross-Account 접근 (자주 헷갈림)
- A계정 주체가 B계정 리소스 접근 → **A의 identity 정책 Allow + B의 resource 정책(또는 역할 신뢰) Allow** 둘 다 필요.
- AssumeRole 체이닝, `ExternalId`(confused deputy 방어). → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

## 6. Condition / ABAC
- `Condition` 블록으로 IP, MFA, 태그, 시간, VPC Endpoint 등 제약.
- 글로벌 키: `aws:PrincipalTag`, `aws:ResourceTag`, `aws:SourceArn`, `aws:SourceIp`, `aws:MultiFactorAuthPresent`, `aws:PrincipalOrgID`.
- ABAC 설계는 → [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md)

## 7. 디버깅 도구
- **IAM Policy Simulator**, CloudTrail의 거부 이벤트, **Access Analyzer**(외부 노출/미사용 권한/정책 검증), `Decode authorization message`.

## 8. 자주 받는 질문 / 흔한 함정
- "권한 있는데 안 돼요" → 99%는 SCP 상한 또는 권한 경계 또는 어딘가의 explicit deny.
- "SCP로 권한 줬어요" → SCP는 부여 안 함, 가드레일일 뿐.
- 와일드카드 + 미사용 권한 누적 → Access Analyzer 정기 점검.

## 관련
- [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](./multi-account-organizations.md) · [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](./privileged-access-management.md) · [인가 모델 — RBAC / ABAC / ReBAC / Cedar](../foundations/authorization-models.md)

### References
- **AWS IAM — Policy evaluation logic** (공식 평가 순서 다이어그램) — [docs.aws.amazon.com](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- AWS: SCP / RCP / Permission Boundaries / Session Policies, IAM Access Analyzer, `aws:` global condition keys 문서

