---
title: "로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅"
sidebar_label: "로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅"
sidebar_position: 2
tags:
  - "탐지·대응"
---
# 로깅 & 감사

:::info[한 줄 정의]
로그는 모든 보안 운영(탐지·대응·포렌식·감사)의 *입력 데이터*. 없으면 아무것도 못 한다. 설계 3원칙: **중앙 집중 + 변조 방지(immutable) + 규제 보존 기간 충족**.
:::

## 1. CloudTrail — "누가/언제/어디서/무엇을" (API 감사)
포렌식 타임라인의 뼈대. 이벤트 유형 구분이 핵심(시험·비용·설계 모두).

| 이벤트 유형 | 내용 | 기본 | 비용/볼륨 |
|---|---|---|---|
| **Management events** | 제어 평면 API(`RunInstances`, `CreateUser`, `AssumeRole` 등) | **ON** (event history 90일 무료) | 첫 사본 무료 |
| **Data events** | 데이터 평면(S3 `GetObject`, Lambda `Invoke`, DynamoDB) | **OFF** | 고볼륨·추가 과금 |
| **Insights events** | 비정상 API 호출률·에러율 자동 탐지 | **OFF** | 추가 과금 |
| **Network activity events** | VPC 엔드포인트 경유 API 등 | OFF | 신규 |

- **Event history**(90일, 무료)는 management 이벤트만, 계정 단위. *장기 보존·data event·중앙화*는 **Trail**(S3로 전달) 또는 **CloudTrail Lake**(SQL 질의용 event data store)로.
- **CloudTrail Lake**: 이벤트를 SQL로 질의, AWS 외부·파트너·앱 이벤트도 수집. 조직 단위 event data store + **위임 관리자 최대 3개**.
- 함정: data event를 안 켜면 "어떤 객체가 유출됐는지" 못 본다 → 민감 버킷엔 선별적으로 ON. → [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../../data-protection/dlp.md)

## 2. AWS Config — 리소스 *구성*의 시계열
CloudTrail이 "API 호출"이라면 Config는 "리소스가 *지금/과거에 어떤 상태*였나"(구성 스냅샷·변경 이력·관계). 규정 준수 평가의 기반. → [지속 모니터링 — Config Rules / Conformance Pack](./continuous-monitoring.md)

## 3. 그 외 로그 소스
- **VPC Flow Logs**(ACCEPT/REJECT, 네트워크 포렌식), Traffic Mirroring(패킷 캡처)
- **Route 53 Resolver query logs**(DNS exfiltration·C2 탐지), S3 server access logs
- **ELB/CloudFront access logs**, WAF logs, EKS control-plane logs

## 4. 중앙 로깅 아키텍처 (멀티 계정)
```
[워크로드 계정들] ──조직 Trail/Config aggregator──▶ [Log Archive 계정]
                                                     │ S3 + Object Lock(WORM)
                                                     │ 접근 최소화(읽기 전용 감사)
                                          [Security Tooling 계정] ◀─ 분석/SIEM
```
- **조직 Trail**(Organizations)로 모든 계정 자동 포함, 신규 계정도 자동.
- **Log Archive 계정** 분리: 워크로드 권한자가 로그를 못 지우게(blast radius).
- **변조 방지**: S3 **Object Lock(Compliance)** + 버킷 정책 + CloudTrail 로그 파일 무결성 검증(digest). → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](../../resilience/immutable-backup-worm.md)

## 5. 보존 & 비용 (규제 연계)
- 보존 기간: ISMS-P/전자금융감독규정 등 규제 요구에 맞춤(수년) → S3 수명주기(Standard→Glacier).
- 비용 통제: management는 다 켜되, **data event는 민감 리소스만**, 장기 보존은 Glacier/Security Lake로 계층화.
- → 규제 매핑 [ISMS-P 통제항목 ↔ AWS 매핑](../../governance-compliance/ismsp-aws-control-mapping.md)

## 6. 핵심 통찰
- **공격자 1순위 행동 = 로깅 비활성화**(ATT&CK T1562.008) → **SCP로 CloudTrail/Config 중지·삭제 금지**(가드레일). → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../../foundations/threat-modeling-attack.md)
- "로그를 모았다 ≠ 본다" → 수집(이 노트)과 탐지/분석([위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](./threat-detection-guardduty.md), [SIEM 연동 — Security Lake / OCSF / 3rd party](./siem-security-lake.md))은 별개.

## 7. 자주 받는 질문
- "로그 비용이 부담" → 계층화 + data event 선별 + Security Lake/Glacier.
- "감사 대비" → 중앙 집중 + Object Lock 변조 방지 + 보존 증빙 + 로그 파일 무결성 검증.
- "S3 누가 가져갔는지 모름" → 해당 버킷 data event 활성화 필요(사후엔 못 봄).

## 관련
- [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](./threat-detection-guardduty.md) · [SIEM 연동 — Security Lake / OCSF / 3rd party](./siem-security-lake.md) · [지속 모니터링 — Config Rules / Conformance Pack](./continuous-monitoring.md) · [ISMS-P 통제항목 ↔ AWS 매핑](../../governance-compliance/ismsp-aws-control-mapping.md)

### References
- [CloudTrail concepts — management/data/insights events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html) · [CloudTrail Lake](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake.html)
- AWS Config, VPC Flow Logs, Route 53 Resolver query logging 문서
- AWS SRA(Security Reference Architecture) — Log Archive/Security Tooling 계정 패턴

