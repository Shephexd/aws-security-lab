---
title: "랜섬웨어 방어 아키텍처"
sidebar_label: "랜섬웨어 방어 아키텍처"
sidebar_position: 3
tags:
  - "복원력"
---
# 랜섬웨어 방어 아키텍처

:::info[한 줄 정의]
랜섬웨어 방어는 단일 제품이 아니라 **예방 → 탐지 → 봉쇄 → 복구** 전 단계의 설계다. 클라우드에서 결정적 차별점은 "공격자가 백업까지 지우거나 암호화하지 못하게" 만드는 것.
:::

## 1. 왜
랜섬웨어는 기술 문제가 아니라 *사업 연속성* 문제다. FSI/공공/제조 경영진이 직접 묻는다. NIST CSF(Identify-Protect-Detect-Respond-**Recover**)로 프레이밍해 "복구 보증"을 설명할 수 있어야 한다.

## 2. 클라우드 랜섬웨어의 형태
- 데이터 암호화/삭제(S3, EBS, RDS).
- **KMS 키 폐기/스케줄 삭제** → 데이터를 사용 불능으로(키만 지워도 데이터는 끝).
- 백업/스냅샷 삭제 → 복구 차단.
- 데이터 탈취 후 공개 협박(double extortion).

## 3. 방어 계층 (NIST CSF 매핑)
### Identify
- 자산·중요 데이터 식별(Macie), 백업 대상 분류, RTO/RPO 정의.

### Protect (예방)
- 최소 권한 + MFA + 단기 자격(초기 침투 차단). → [특권 접근 관리 — Root 보호 / JIT / Access Analyzer](../identity-access/privileged-access-management.md)
- 패치/하드닝(Inspector, Patch Manager), IMDSv2. → [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md)
- **백업 불변성(immutability)** — 핵심. → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md)
- **KMS 키 삭제 보호**: 삭제 대기기간(7~30일), 멀티리전 키, 키 삭제 권한 분리/SCP 차단.
- S3 버전 관리 + MFA Delete + Block Public Access.

### Detect
- GuardDuty(비정상 API, 대량 삭제/암호화 행위, malware protection), CloudTrail Insights, Config. → [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection-response/detection/threat-detection-guardduty.md)

### Respond
- 자동 격리, 자격 회수, 영향 범위 산정(Detective). → [06. Incident Response — MOC](../detection-response/incident-response/index.md)

### Recover (차별점)
- 불변 백업에서 복원, **격리 복구 환경(IRE)** 에서 클린 복구. → [격리 복구 환경 (Clean Room / IRE)](./isolated-recovery-environment.md)
- 복구 훈련(GameDay) — 백업이 *실제로 복원되는지* 검증.

## 4. 핵심 설계 원칙
- **3-2-1-1-0**: 3 복사본, 2 매체, 1 오프사이트, **1 오프라인/불변**, 0 복구 오류.
- 백업 계정을 워크로드 계정과 **분리 + 권한 격리**(공격자가 프로덕션 권한을 얻어도 백업 못 건드림).
- 백업 삭제·키 삭제·로그 비활성을 **SCP로 조직 차원 금지**.

## 5. 자주 받는 질문
- "백업 있으니 괜찮죠?" → "그 백업을 관리자 권한으로 지울 수 있나요? 그럼 공격자도 지웁니다. **WORM**이 필요합니다."
- "키를 지우면?" → 삭제 대기기간 + 멀티리전 + 키 삭제 권한 분리.
- 복구 *시간*을 검증했는가(RTO 실측) — 미검증 백업은 백업이 아니다.

## 6. 흔한 함정
- 백업과 프로덕션이 같은 계정/권한 → 동시 침해.
- 백업 미암호화 또는 같은 키 → 키 폐기 시 백업도 사용 불능.
- 복원 테스트 안 함.

## 관련
- [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md) · [격리 복구 환경 (Clean Room / IRE)](./isolated-recovery-environment.md) · [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)
- NIST CSF, AWS Ransomware Risk Management whitepaper

