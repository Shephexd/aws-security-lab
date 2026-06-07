---
title: "복원력 & 랜섬웨어"
sidebar_label: "개요"
sidebar_position: 0
tags:
  - "복원력"
---
> 신규 축. FSI/공공/제조 고객의 **1순위 보드 안건**. "막는 것"만큼 "복구하는 것"이 보안이다.
> 핵심 통찰: 랜섬웨어 대응의 마지막 보루는 **변경 불가(immutable)·격리된 백업**이다.

## 세부 섹션
- [랜섬웨어 방어 아키텍처](./ransomware-defense-architecture.md)
- [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md)
- [격리 복구 환경 (Clean Room / IRE)](./isolated-recovery-environment.md)

## 자주 받는 질문
- "랜섬웨어에 백업까지 암호화당하면?" → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](./immutable-backup-worm.md) (WORM은 관리자도 못 지움)
- "KMS 키를 공격자가 폐기하면?" → 키 삭제 대기기간 + 멀티리전 + 백업 분리
- "복구 환경 자체가 오염되면?" → [격리 복구 환경 (Clean Room / IRE)](./isolated-recovery-environment.md)

## 연결
- [06. Incident Response — MOC](../detection-response/incident-response/index.md) · [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

