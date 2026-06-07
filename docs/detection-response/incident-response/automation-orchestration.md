---
title: "자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions"
sidebar_label: "자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions"
sidebar_position: 1
tags:
  - "탐지·대응"
---
# IR 자동화 & 오케스트레이션 (SOAR)

:::info[한 줄 정의]
SOAR(Security Orchestration, Automation and Response)는 **탐지 → 판단 → 대응**의 반복 작업을 코드/워크플로로 자동화해 평균 대응 시간(MTTR)을 분·초 단위로 줄이는 것이다. 핵심 원칙은 *고확신·저영향 동작부터 완전 자동화*하고, *고영향 동작은 자동 수집 + 사람 승인*으로 분리해 잘못된 자동 조치의 폭발 반경(blast radius)을 통제하는 것이다. → [IR 프레임워크 — NIST 라이프사이클 / 런북](./ir-framework.md)
:::

:::tip[큰 그림]
AWS에는 단일 "SOAR 제품"이 없고, 표준 빌딩블록을 조합한다: **EventBridge**(이벤트 라우팅) → **Lambda / SSM Automation**(단일 동작) → **Step Functions**(다단계 + 승인) → **Security Hub**(집계·자동화 규칙·커스텀 액션). 외부 SOAR(ServiceNow/Splunk SOAR 등)는 이 위에 얹거나 EventBridge로 연동한다.
:::

## 1. 왜 중요한가
침해는 *속도 싸움*이다. 자격 증명 유출이나 S3 공개화 같은 사고는 분 단위로 피해가 커진다. 사람이 콘솔을 열고 판단하는 동안 공격은 진행된다.

- **MTTR 단축**: 흔한 사고 유형은 결정 트리가 명확해 자동화로 즉시 봉쇄 가능.
- **일관성**: 사람이 매번 다르게 대응하는 변동을 코드화된 런북으로 제거.
- **증거 보존 자동화**: 사람이 손대기 전에 스냅샷·메타데이터를 자동 수집해 포렌식 무결성 확보. → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md)
- **확장성**: 계정/리전이 늘어도 동일 자동화가 조직 전반에 적용.

다만 *자동화 자체가 위험*이 될 수 있다 → 잘못된 룰이 정상 리소스를 대량 격리/삭제하면 자초한 장애가 된다. 그래서 가드레일이 본문의 절반이다.

## 2. 핵심 파이프라인: 탐지 → 라우팅 → 대응
표준 흐름은 *탐지 소스가 finding을 내면 EventBridge가 받아 대응 로직으로 라우팅*하는 것이다.

| 단계 | 서비스 | 역할 |
| --- | --- | --- |
| 탐지 | GuardDuty, Security Hub, Config, Macie, CloudTrail | finding/이벤트 생성 → [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection/threat-detection-guardduty.md) |
| 집계/정규화 | Security Hub (ASFF 포맷) | 다소스 finding 통합 |
| 라우팅 | **EventBridge** 규칙(이벤트 패턴 매칭) | 조건별 타깃 분기 |
| 대응(단일) | **Lambda**, **SSM Automation** 런북 | 격리·스냅샷·자격 회수 |
| 대응(다단계) | **Step Functions** | 분기·재시도·사람 승인 |
| 통지 | SNS, 채팅/티켓 연동 | 사람에게 알림·승인 요청 |

- GuardDuty/Security Hub finding은 EventBridge로 자동 발행된다 → 이벤트 패턴(예: 특정 finding 유형·심각도)으로 필터링해 대응을 분기.
- Security Hub의 **automation rules**로 finding을 자동 업데이트(심각도 조정, 억제)하고, **custom actions**로 운영자가 콘솔에서 수동 트리거할 수도 있다.

## 3. SSM Automation 런북 (단일 동작 대응)
SSM Automation은 *멱등하고 재사용 가능한 대응 동작*을 문서로 정의한다. AWS 제공 런북도 다수 있고 커스텀 작성도 가능하다.

| 대응 유형 | 동작 예 | 주의 |
| --- | --- | --- |
| 네트워크 격리 | 인스턴스 SG를 격리용 SG로 교체 | 기존 SG 기록 후 교체(롤백 위해) |
| 증거 보존 | EBS 스냅샷, 메모리/메타데이터 수집 후 격리 | 격리 *전* 스냅샷 → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md) |
| 자격 회수 | 노출된 IAM 액세스 키 비활성화, 세션 무효화 | 운영 중단 영향 확인 |
| 리소스 차단 | S3 퍼블릭 액세스 차단, 공개 정책 제거 | 고확신·저영향 → 완전 자동 후보 |
| 격리 후 태깅 | `quarantine=true` 태그로 후속 추적 | 자동화 재진입 방지 |

- 격리는 *삭제가 아니라 분리*다 — 인스턴스를 종료하지 말고 SG/네트워크로 고립시켜 포렌식 대상을 보존한다.
- 런북은 **롤백 경로**를 함께 정의한다(교체 전 상태 기록).

## 4. Step Functions: 다단계 + 사람 개입
영향이 큰 대응은 여러 단계와 *판단*이 필요하다. Step Functions로 상태머신을 만들어 수집·분석·승인·실행을 오케스트레이션한다.

- **Human-in-the-loop**: Step Functions의 콜백 패턴(작업 토큰)으로 *사람 승인 대기* 단계를 둔다. 승인 전까지 파괴적 동작은 멈춘다.
- **분기·재시도·오류 처리**: 탐지 신뢰도/리소스 중요도에 따라 자동 실행 vs 승인 요청으로 분기.
- **감사 추적**: 실행 이력이 단계별로 남아 사후 검토·포렌식에 활용.

```
GuardDuty finding
  → EventBridge (패턴 매칭)
    → Step Functions
        ├─ 증거 수집(스냅샷/메타데이터)   [자동]
        ├─ 영향도 평가(태그/계정/리소스)  [자동]
        ├─ 저영향? → 격리 실행            [자동]
        └─ 고영향? → 승인 요청(콜백) → 실행 [사람 승인]
```

## 5. 의사결정 기준: 무엇을 자동화할 것인가
자동화 수준은 *확신도 × 영향도*로 결정한다.

| 확신도 | 영향도 | 권장 |
| --- | --- | --- |
| 높음 | 낮음 | **완전 자동**(예: S3 공개 차단, 노출 키 비활성화) |
| 높음 | 높음 | 자동 수집·격리 + **사람 승인** 후 실행 |
| 낮음 | 낮음 | 자동 enrich(증거 모으기) + 알림 |
| 낮음 | 높음 | **수동** — 자동 조치 금지, 컨텍스트만 제공 |

- 시작은 "S3 퍼블릭화 즉시 차단" 같은 *고확신·저영향* 룰 한두 개부터 → 신뢰가 쌓이면 범위를 점진 확대.

## 6. 가드레일: 파괴적 자동화 방지
- **범위 제한(scoping)**: 자동화가 건드릴 수 있는 리소스를 태그/계정/OU로 제한. 운영 핵심 리소스는 *제외 목록(allowlist)*으로 보호.
- **자동화 권한 최소화**: 대응 Lambda/런북의 IAM 역할에 *필요한 동작만* 부여(예: 삭제 권한은 주지 않고 격리 권한만).
- **재진입 방지**: 이미 격리된 리소스를 다시 처리하지 않도록 태그/상태로 가드(무한 루프·중복 조치 방지).
- **레이트 리밋·서킷 브레이커**: 단시간 대량 트리거 시 자동 일시정지 → 폭주(예: 대량 오탐) 차단.
- **롤백 절차**: 모든 자동 조치는 되돌릴 경로를 문서화.
- **변경 가시성**: 모든 자동 조치를 SNS/티켓으로 통지하고 CloudTrail로 추적.

## 7. 외부 SOAR 연동
- EventBridge → 파트너 이벤트버스/웹훅으로 외부 SOAR(ServiceNow, Splunk SOAR 등)에 finding 전달.
- 양방향: 외부 플랫폼이 AWS API/SSM을 호출해 대응 실행(역할 가정 기반 단기 자격 권장).
- 통합 시에도 *대응 권한은 최소화*하고 사람 승인 단계를 유지한다.

## 핵심 고려사항
- **사람 개입 지점을 명시적으로 설계**: "어디서 멈춰 승인을 받는가"가 안전한 SOAR의 본질.
- **증거 우선**: 격리/변경 전에 스냅샷·메타데이터를 수집해 포렌식 무결성 보존. → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md)
- **런북을 IR 프로세스에 정합**: 자동화는 IR 프레임워크의 *탐지·봉쇄·근절·복구* 단계에 매핑되어야 한다. → [IR 프레임워크 — NIST 라이프사이클 / 런북](./ir-framework.md) · [06. Incident Response — MOC](./index.md)
- **테스트**: 자동화도 코드 → CI/스테이징에서 검증, GameDay로 정기 리허설. → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../../application-workload/appsec/devsecops.md)
- **최소 권한**: 대응 자동화의 역할이 과대 권한이면 그 자체가 공격 표면.

## 흔한 함정
- 고영향 동작(종료·삭제)을 사람 승인 없이 완전 자동화 → 오탐 한 건이 대규모 장애.
- 격리 *전*에 인스턴스를 종료/삭제 → 증거 소실.
- 자동화 역할에 광범위 권한 부여 → 침해 시 자동화가 무기화.
- 재진입/루프 가드 부재 → 동일 finding 반복 처리.
- 롤백 경로 미정의 → 잘못된 격리를 되돌릴 수 없음.
- 자동 조치를 통지/감사하지 않음 → "왜 리소스가 격리됐는지" 추적 불가.

## 관련
- [IR 프레임워크 — NIST 라이프사이클 / 런북](./ir-framework.md) · [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection/threat-detection-guardduty.md) · [지속 모니터링 — Config Rules / Conformance Pack](../detection/continuous-monitoring.md) · [06. Incident Response — MOC](./index.md)

### References (권위 출처)
- **Amazon EventBridge** — [docs.aws.amazon.com](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- **AWS Systems Manager Automation** — [docs.aws.amazon.com](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html)
- **AWS Step Functions (Wait for Callback / Human Approval)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)
- **Security Hub Automation Rules & Custom Actions** — [docs.aws.amazon.com](https://docs.aws.amazon.com/securityhub/latest/userguide/automation-rules.html)
- **GuardDuty → EventBridge 통합** — [docs.aws.amazon.com](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings_cloudwatch.html)
- **AWS Security Incident Response Guide** — [docs.aws.amazon.com](https://docs.aws.amazon.com/security-ir/latest/userguide/welcome.html)

