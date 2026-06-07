---
title: "변경 불가 백업 (WORM) — Vault Lock / Object Lock"
sidebar_label: "변경 불가 백업 (WORM) — Vault Lock / Object Lock"
sidebar_position: 1
tags:
  - "복원력"
---
# 변경 불가 백업 (Immutable / WORM)

:::info[한 줄 정의]
**WORM(Write Once Read Many)** 은 한 번 쓰면 보존 기간 동안 *누구도(root/관리자 포함)* 수정·삭제할 수 없게 만든다. 랜섬웨어·내부자·실수의 마지막 방어선.
:::

## 1. 왜 (관리자도 못 지워야 한다)
일반 백업은 충분한 권한이면 삭제된다. 공격자가 관리자 자격을 탈취하면 백업도 지운다. WORM은 *권한과 무관하게* 시간 기반으로 잠근다 → 권한 침해와 데이터 복구 가능성을 분리.

## 2. AWS의 WORM 메커니즘
| 메커니즘 | 대상 | 특징 |
|---|---|---|
| **S3 Object Lock** | S3 객체 | Governance(권한자 우회 가능) vs **Compliance(root도 불가)** 모드, Legal Hold |
| **S3 Glacier Vault Lock** | Glacier 볼트 | 정책을 **Lock**하면 변경 불가(규제 보존) |
| **AWS Backup Vault Lock** | Backup 볼트 | Compliance 모드 시 **삭제·보존단축 불가**(AWS도 못 풀어줌) |
| **EBS/RDS 스냅샷 + 분리 계정** | 스냅샷 | cross-account + 권한 격리로 보호 |

> 핵심: **Compliance 모드** = root 계정조차 보존기간 내 삭제 불가. 진짜 랜섬웨어 방어는 여기서 나온다(단, 설정 실수 시 되돌리기도 불가 → 신중히).

## 3. 설계 패턴
- 백업 전용 계정 + Backup Vault Lock(Compliance) + KMS 별도 키.
- S3 백업: 버전 관리 + Object Lock(Compliance) + Replication(다른 계정/리전).
- 보존 정책을 규제 기간(FSI/ISMS-P)에 맞춤.
- 백업 키도 삭제 보호(키 삭제 대기, 권한 분리).

## 4. 거버넌스 모드 vs 컴플라이언스 모드
- **Governance**: 특별 권한(`s3:BypassGovernanceRetention`)으로 우회 가능 → 운영 유연성, 진짜 불변은 아님.
- **Compliance**: 누구도 우회 불가, 보존기간 단축도 불가 → 규제/랜섬웨어용. 설정 신중(되돌릴 수 없음).

## 5. 자주 받는 질문
- "랜섬웨어가 백업까지 암호화하면?" → Compliance 모드 WORM은 *덮어쓰기·삭제 자체가 불가*.
- "감사에서 7년 보존 증빙" → Vault Lock + Glacier로 규제 보존 충족.
- 주의: Compliance 모드는 잘못 설정 시 비용/되돌리기 문제 → PoC로 보존기간 검증.

## 6. 흔한 함정
- Governance 모드를 WORM이라 착각(권한자가 우회 가능).
- 백업과 같은 계정/키 → 동시 침해.
- 보존기간만 설정하고 복원 테스트 안 함.

## 관련
- [랜섬웨어 방어 아키텍처](./ransomware-defense-architecture.md) · [격리 복구 환경 (Clean Room / IRE)](./isolated-recovery-environment.md) · [ISMS-P 통제항목 ↔ AWS 매핑](../governance-compliance/ismsp-aws-control-mapping.md) (로그 보존)

