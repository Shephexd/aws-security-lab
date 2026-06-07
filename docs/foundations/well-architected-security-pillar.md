---
title: "Well-Architected — Security Pillar"
sidebar_label: "Well-Architected — Security Pillar"
sidebar_position: 8
tags:
  - "기초"
  - "well-architected"
---
# Well-Architected Framework — Security Pillar

:::info[한 줄 정의]
AWS Well-Architected Framework(6개 기둥) 중 **보안 기둥**은 워크로드 보안 설계의 공통 언어다. 7개 설계 원칙과 7개 베스트 프랙티스 영역(SEC 1~11)으로 구성되며, 이 가이드의 구조가 그 영역에 정렬되어 있다.
:::

:::tip[6개 기둥 중 위치]
운영 우수성 · **보안** · 안정성 · 성능 효율성 · 비용 최적화 · 지속 가능성. 이 문서는 그중 **보안 기둥**을 다룬다.
:::

## 1. 왜 중요한가
Well-Architected는 점수 매기기가 아니라 *설계 트레이드오프를 일관된 기준으로 측정*하는 틀이다. 보안 기둥은 "데이터·시스템을 보호하고, 접근을 통제하며, 보안 이벤트에 자동 대응하는" 아키텍처를 만드는 현재 권장사항을 제공한다. 규제·감사 요구사항을 충족하는 출발점이기도 하다.

## 2. 설계 원칙 (7가지 Design Principles)
1. **강력한 ID 기반 구현** — 최소권한, 중앙 집중 ID, 장기 자격증명 제거 → [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](./authentication-protocols.md) · [인가 모델 — RBAC / ABAC / ReBAC / Cedar](./authorization-models.md)
2. **추적 가능성 확보** — 로깅·모니터링·감사·알림을 실시간으로 → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)
3. **모든 계층에 보안 적용** — 단일 경계가 아닌 심층 방어 → [Defense in Depth (심층 방어)](./defense-in-depth.md)
4. **보안 베스트 프랙티스 자동화** — IaC·자동 가드레일로 일관성·확장성 확보
5. **전송/저장 중 데이터 보호** — 분류 후 암호화·토큰화·접근통제 → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) · [전송 중 암호화 — ACM / TLS termination](../data-protection/encryption-in-transit.md)
6. **데이터에 사람의 직접 접근 최소화** — 수동 처리 제거로 실수·유출 위험 감소
7. **보안 이벤트 대비** — IR 런북·훈련(게임데이)으로 대응·복구 준비 → [IR 프레임워크 — NIST 라이프사이클 / 런북](../detection-response/incident-response/ir-framework.md)

## 3. 베스트 프랙티스 영역 (7개 영역 · SEC 1~11)
| 영역 | SEC | 핵심 질문 |
| --- | --- | --- |
| **Security foundations** | SEC 1 | 워크로드를 어떻게 안전하게 *운영*하는가 |
| **Identity & access** | SEC 2 / SEC 3 | 사람·머신 *ID* 관리 / *권한* 관리 |
| **Detection** | SEC 4 | 보안 이벤트를 어떻게 *탐지·조사*하는가 |
| **Infrastructure protection** | SEC 5 / SEC 6 | *네트워크* 보호 / *컴퓨트* 보호 |
| **Data protection** | SEC 7 / SEC 8 / SEC 9 | 데이터 *분류* / *저장* 보호 / *전송* 보호 |
| **Incident response** | SEC 10 | 인시던트를 어떻게 예상·대응·복구하는가 |
| **Application security** | SEC 11 | 개발 수명주기 전반에서 앱 보안 속성을 어떻게 검증하는가 |

> 이 가이드의 각 페이지가 어떤 SEC 베스트 프랙티스에 대응하는지는 **[Well-Architected 정렬 크로스워크](./well-architected-alignment.md)** 에서 SEC 1~11 단위로 매핑한다.

## 4. Well-Architected Review (WAR)
- **AWS Well-Architected Tool** 로 워크로드를 등록 → 질문에 응답 → High/Medium 리스크(HRI) 도출 → 개선 계획(Improvement Plan) 생성.
- **Security Lens** 및 산업별 Lens로 도메인 특화 점검.
- 산출물: 리스크 목록 + 우선순위 로드맵. *자동 진단*은 [Cedar](../advanced/cloud-native-security-cedar.md) 가 아니라 → SRA Verify 같은 도구로 보완(설계 검토 = WAR, 구성 점검 = SRA Verify).

## 핵심 고려사항
- WAR는 "점수"가 아니라 **대화의 틀**이다 — 발견된 HRI를 비즈니스 우선순위와 연결한다.
- WAF(설계 검토)와 구성 진단 도구(SRA Verify)는 상호 보완적이다: 전자는 *설계가 옳은가*, 후자는 *실제 계정 구성이 그 설계대로인가* 를 본다.
- 6개 기둥은 트레이드오프 관계 — 보안 강화가 비용·성능과 충돌할 수 있으므로 의사결정을 명시적으로 기록한다.

## 흔한 함정
- WAR를 일회성 감사로 취급(개선 계획 미추적).
- 보안 기둥만 보고 안정성·운영 우수성과의 연계를 놓침(예: 복구 = 보안+안정성).
- 베스트 프랙티스를 "체크리스트"로만 보고 *왜* 를 건너뜀.

## 관련
- [AWS 책임 공유 모델 (Shared Responsibility)](./shared-responsibility-model.md) · [Defense in Depth (심층 방어)](./defense-in-depth.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](./threat-modeling-attack.md)

### References
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) · [Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [AWS Well-Architected Tool](https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html) · [Security Pillar Best Practices (SEC 1–11)](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/security.html)

