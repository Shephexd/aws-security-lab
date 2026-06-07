---
title: "격리 복구 환경 (Clean Room / IRE)"
sidebar_label: "격리 복구 환경 (Clean Room / IRE)"
sidebar_position: 2
tags:
  - "복원력"
---
# 격리 복구 환경 (Isolated Recovery Environment)

:::info[한 줄 정의]
격리 복구 환경(IRE, Isolated Recovery Environment 또는 Clean Room)은 침해된 운영 환경과 **자격·네트워크·신뢰 경계가 분리된 별도 환경**에서 불변 백업을 복원하고, 악성코드 제거와 무결성을 검증한 뒤 안전하게 운영으로 승격하는 패턴이다. 핵심 전제: *침해된 환경에 그대로 복원하면 재감염되거나 백업까지 오염된다.* → [랜섬웨어 방어 아키텍처](./ransomware-defense-architecture.md)
:::

:::tip[큰 그림]
백업이 있다는 사실만으로는 복구를 보장하지 못한다. 두 가지가 더 필요하다: ① 공격자가 손댈 수 없는 **불변/논리적 에어갭 백업**([변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md)), ② 그 백업을 *오염되지 않은 격리 공간*에서 복원·검증할 IRE. 이 둘이 빠지면 "백업에서 복원했더니 다시 감염" 또는 "백업 자체가 이미 암호화됨"이라는 실패로 귀결된다.
:::

## 1. 왜 중요한가
랜섬웨어/파괴 공격에서 복구는 *기술이 아니라 신뢰 경계*의 문제다. 운영 환경이 침해됐다는 것은 그 환경의 자격·네트워크·관리 평면을 공격자가 통제할 수 있다는 뜻이다. 같은 경계 안에서 복원하면:

- 복원 과정에서 잔존 악성코드가 다시 활성화(재감염).
- 복원 중인 깨끗한 데이터가 다시 암호화/삭제.
- 공격자가 복구 자격까지 탈취해 백업 소스를 파괴.

따라서 복구는 *공격 경로와 격리된 별도 공간*에서 진행하고, 깨끗함을 증명한 뒤에만 운영으로 옮겨야 한다. 이것이 NIST CSF의 **Recover** 기능을 실질적으로 보장하는 방법이다.

## 2. 별도 복구 계정/환경 (격리 경계)
IRE의 본질은 *분리*다. 운영 계정의 권한이 복구 환경에 닿지 않도록 신뢰 경계를 끊는다.

| 격리 축 | 설계 | 이유 |
| --- | --- | --- |
| 계정/조직 | 전용 복구 계정(가능하면 별도 OU) | 운영 침해가 전파되지 않음 → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md) |
| 자격 증명 | 운영과 *공유하지 않는* 별도 ID/관리자 | 탈취된 운영 자격으로 접근 불가 → [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](../identity-access/privileged-access-management.md) |
| 네트워크 | 격리 VPC, 기본 차단, 인터넷/운영 연결 최소화 | 측면 이동·외부 통신 차단 → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md) |
| 관리 평면 | 복구 시에만 활성화하는 최소 접근 | 평시 공격 표면 축소 |
| 키 | 백업 암호화 키를 운영과 분리·삭제 권한 격리 | 키 폐기로 인한 동시 무력화 방지 → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) |

- 복구 계정은 *평소에는 거의 비어 있다가* 사고 시 백업 소스로부터 채워지는 형태가 이상적이다.
- 복구 자격은 별도 MFA·승인 흐름을 거치게 해 운영 침해와 분리한다. → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)

## 3. 불변/에어갭 백업에서 복원
복원 소스는 *공격자가 변경·삭제할 수 없는* 백업이어야 한다.

| 보호 수단 | 설명 |
| --- | --- |
| WORM/Object Lock | 보존 기간 동안 객체 변경·삭제 불가 → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md) |
| AWS Backup Vault Lock | 백업 자격증명 보존을 강제(compliance 모드는 변경 불가) |
| **논리적 에어갭 볼트** | AWS Backup의 logically air-gapped vault — 별도 보관·격리된 백업 복사본 |
| 키 분리 | 백업 암호화 키를 운영과 분리, 삭제 권한 격리 |
| 권한 분리 | 백업 삭제/Vault 변경을 SCP로 조직 차원 금지 |

- AWS Backup의 **논리적 에어갭 볼트(logically air-gapped vault)**는 백업을 격리·공유 가능한 형태로 보관해 복구 계정에서 복원하기에 적합하다.
- 백업을 *별도 계정으로 복사*해 두면 운영 계정이 완전히 손상돼도 복원 소스가 남는다.

## 4. 클린룸 검증 (무결성·악성코드 검사)
복원했다고 끝이 아니다 — 복원된 데이터가 *깨끗한지* 증명하는 단계가 IRE의 핵심 가치다.

| 검증 | 방법 |
| --- | --- |
| 악성코드 스캔 | 격리 환경에서 안티멀웨어/시그니처 스캔, 의심 파일 격리 |
| 무결성 확인 | 해시 비교, 알려진 정상(baseline)과 대조 |
| 시점 선택 | 감염 *이전* 깨끗한 복원 지점 식별(RPO 내 가장 안전한 시점) |
| 구성 검증 | 백도어·잔존 IAM·예약 작업·시작 스크립트 점검 |
| 행위 관찰 | 격리망에서 부팅·실행해 비정상 외부 통신 여부 관찰 |

- *감염 시점 파악*이 중요하다 — 가장 최신 백업이 이미 오염됐을 수 있으므로 감염 이전 시점으로 거슬러 복원한다.
- 검증을 통과하기 전에는 격리망 밖으로 트래픽을 허용하지 않는다.

## 5. 단계적 복구와 RTO/RPO 검증
- **우선순위 복구**: 비즈니스 임팩트 기준으로 중요 시스템(인증·결제·핵심 데이터)부터 복원.
- **RTO/RPO 실측**: 훈련에서 *실제로 얼마나 걸리는지* 측정 → 목표와의 격차를 좁힌다.
- **의존성 순서**: 데이터 → 신원/인증 → 애플리케이션 순으로 의존성을 고려해 복원.
- 복구 지점마다 검증 게이트를 둬 오염된 데이터가 운영으로 흘러가지 않게 한다.

## 6. 근본 원인 제거 후 운영 전환
- 복구 *전에* 침투 경로·지속성(persistence) 메커니즘을 제거했는지 확인 — 그렇지 않으면 깨끗한 환경도 다시 감염된다.
- 노출된 자격·키를 전면 회전(rotate)하고, 취약점/오설정을 패치한 뒤 승격.
- 운영 전환은 한 번에 전부가 아니라 *검증된 시스템부터 단계적*으로, 모니터링을 강화한 상태에서 진행.
- 전환 과정은 IR 프로세스의 근절(eradication)·복구(recovery) 단계와 연계한다. → [IR 프레임워크 — NIST 라이프사이클 / 런북](../detection-response/incident-response/ir-framework.md)

## 7. 정기 복구 훈련 (GameDay)

:::warning["백업은 있는데 복원해 본 적 없다"가 가장 흔한 실패다.]
:::

- 미검증 백업은 신뢰할 수 없다 → *정기적으로 실제 복원*해 RTO/RPO를 실측한다.
- 훈련에서 자격 분리·네트워크 격리·검증 게이트가 실제로 작동하는지 확인.
- 런북을 갱신하고, 담당자가 *문서 없이도* 복구를 수행할 수 있을 만큼 숙달시킨다. → [07. Resilience & Ransomware — MOC](./index.md)

## 핵심 고려사항
- **신뢰 경계 분리가 본질**: 복구 환경의 자격·네트워크·키가 운영과 분리돼야 동시 침해를 막는다.
- **불변성 + 격리의 조합**: 불변 백업([변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md))과 IRE는 짝을 이뤄야 의미가 있다.
- **검증을 의무화**: 복원 → 스캔 → 무결성 확인 → 승격의 게이트를 생략하지 않는다.
- **실측된 RTO/RPO**: 문서상 목표가 아니라 훈련으로 검증된 수치를 신뢰한다.
- **3-2-1-1-0 원칙과 정합**: 1개의 오프라인/불변 복사본, 0 복구 오류. → [랜섬웨어 방어 아키텍처](./ransomware-defense-architecture.md)

## 흔한 함정
- 침해된 운영 계정/네트워크에 그대로 복원 → 재감염.
- 복구 자격을 운영과 공유 → 탈취된 자격으로 백업까지 파괴.
- 최신 백업만 복원하다 *이미 오염된 시점*을 복구.
- 근본 원인(지속성·백도어) 미제거 상태에서 운영 전환.
- 복원 테스트 미실시 → 실제 사고 때 RTO 초과.
- 백업 암호화 키를 운영과 같은 경계에 보관 → 키 폐기 시 백업도 사용 불능.

## 관련
- [랜섬웨어 방어 아키텍처](./ransomware-defense-architecture.md) · [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md) · [IR 프레임워크 — NIST 라이프사이클 / 런북](../detection-response/incident-response/ir-framework.md) · [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md) · [07. Resilience & Ransomware — MOC](./index.md)

### References (권위 출처)
- **AWS Backup logically air-gapped vault** — [docs.aws.amazon.com](https://docs.aws.amazon.com/aws-backup/latest/devguide/logically-air-gapped-vault.html)
- **AWS Backup Vault Lock** — [docs.aws.amazon.com](https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html)
- **Amazon S3 Object Lock (WORM)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- **AWS Disaster Recovery (RTO/RPO)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- **AWS Ransomware Risk Management** — [aws.amazon.com](https://docs.aws.amazon.com/whitepapers/latest/ransomware-risk-management-on-aws-using-nist-csf/ransomware-risk-management-on-aws-using-nist-csf.html)
- **NIST CSF (Recover)** — [nist.gov](https://www.nist.gov/cyberframework)

