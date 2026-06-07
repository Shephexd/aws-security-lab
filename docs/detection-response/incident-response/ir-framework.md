---
title: "IR 프레임워크 — NIST 라이프사이클 / 런북"
sidebar_label: "IR 프레임워크 — NIST 라이프사이클 / 런북"
sidebar_position: 3
tags:
  - "탐지·대응"
---
# IR 프레임워크

:::info[사고 대응은 즉흥이 아니라 사전 준비된 프로세스. NIST 라이프사이클 + 클라우드 특화 런북.]
:::

## NIST 800-61 라이프사이클
1. **Preparation** (준비: 권한·도구·런북·훈련)
2. **Detection & Analysis** (탐지·분석)
3. **Containment** (격리)
4. **Eradication** (제거)
5. **Recovery** (복구)
6. **Post-Incident / Lessons Learned**

## 3. AWS 환경 IR 준비
- **전용 IR 역할/계정**: 사고 대응자용 별도 역할(읽기/격리 권한)과 포렌식 분석용 격리 계정을 미리 둔다. → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md)
- **사전 권한 설계**: 사고 *중에* 권한을 만들지 않는다. 격리·스냅샷·로그 수집 권한을 평시에 정의·검토한다.
- **로그 접근**: CloudTrail·VPC Flow Logs·Config 이력이 중앙 로그 아카이브에 보존되고 IR 역할이 읽을 수 있어야 한다.

## 4. Runbook vs Playbook
| 구분 | 정의 | 예 |
| --- | --- | --- |
| **Runbook** | 절차(어떻게) — 단계별 실행 지침 | "EC2 인스턴스 격리 절차" |
| **Playbook** | 시나리오(무엇을) — 사고 유형별 대응 흐름 | "자격증명 탈취 대응" |

런북은 가능한 한 **자동화**한다(EventBridge·Step Functions·SSM Automation). → [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](./automation-orchestration.md)

## 5. 클라우드 특화 시나리오
| 시나리오 | 초기 대응 |
| --- | --- |
| 자격증명 탈취 | 액세스 키/세션 무효화, 권한 검토, CloudTrail 추적 |
| 퍼블릭 노출 | 공개 차단(S3 BPA/SG), 노출 범위·접근 로그 확인 |
| 크립토마이닝 | 인스턴스 격리, GuardDuty 소견 분석, 비용 알림 |
| 랜섬웨어 | 격리 후 불변 백업에서 복구 → [랜섬웨어 방어 아키텍처](../../resilience/ransomware-defense-architecture.md) |
| 데이터 유출 | 범위 산정, 보존, 규제 신고 절차 가동 |

## 6. 커뮤니케이션 플랜
- 내부 보고 체계·규제 신고·고객 통지 경로를 사전에 정의한다.
- 한국 개인정보보호법(PIPA): 개인정보 유출 시 신고·통지 기한을 준수해야 한다.

## 핵심 고려사항
- 대응 능력은 **평시 준비**로 결정된다 — 런북과 GameDay(모의 훈련)로 정기 검증한다.
- 증거를 훼손하지 않는 순서(스냅샷 → 격리 → 분석)를 지킨다.
- 자동화는 파괴적 작업에 가드레일(승인 단계)을 둔다.

## 흔한 함정
- 사고 중 권한 신규 생성(지연·오류).
- 로그가 침해 계정에 있어 함께 삭제·변조됨(중앙 로그 아카이브 부재).
- 복구만 하고 근본 원인 제거를 건너뜀 → 재침해.

## 관련
- [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](./forensics-on-aws.md) · [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](./automation-orchestration.md) · [격리 복구 환경 (Clean Room / IRE)](../../resilience/isolated-recovery-environment.md)

### References
- [AWS Security Incident Response Guide](https://docs.aws.amazon.com/security-ir/latest/userguide/welcome.html) · [NIST SP 800-61](https://csrc.nist.gov/pubs/sp/800/61/r2/final)

