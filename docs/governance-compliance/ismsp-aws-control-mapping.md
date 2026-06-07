---
title: "ISMS-P 통제항목 ↔ AWS 매핑"
sidebar_label: "ISMS-P 통제항목 ↔ AWS 매핑"
sidebar_position: 4
tags:
  - "거버넌스"
  - "한국규제"
---
# ISMS-P ↔ AWS 매핑

:::info[한 줄 정의]
ISMS-P(정보보호 및 개인정보보호 관리체계 인증)는 ① 관리체계 수립·운영 ② 보호대책 요구사항 ③ 개인정보 처리단계별 요구사항의 3영역으로 구성된다. 핵심은 **각 통제항목을 AWS 서비스/설정으로 매핑**해 인증을 가속하는 것.
:::

:::warning[검증 필요]
인증기준 개수·세부 항목은 개정된다(KISA 고시). 아래는 *영역 구조 + 대표 매핑*이며, 실제 인증은 최신 인증기준과 심사원 해석을 따른다.
:::

## 1. 구조 (3영역, 총 101개 인증기준 — 2023.11 안내서 기준)
| 영역 | 인증기준 수 | 내용 | 성격 |
|---|---|---|---|
| **1. 관리체계 수립 및 운영** | **16** | 정책·위험관리·내부감사 등 | 거버넌스/프로세스 |
| **2. 보호대책 요구사항** | **64** | 접근통제·암호화·운영보안·사고대응 등 | 기술/운영 통제 |
| **3. 개인정보 처리단계별 요구사항** | **21** | 수집·이용·제공·파기 등 생명주기 | 개인정보(P) 전용 |

- **ISMS**(정보보호) = 영역 1+2, **ISMS-P**(개인정보 포함) = 1+2+3.
- 2023.11 안내서는 **2023.9.15 시행 개정 개인정보보호법**을 반영. KISA(인증)·개인정보위(개인정보 부분) 관할.

## 2. 대표 통제 → AWS 매핑
| ISMS-P 통제 영역      | AWS 구현                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| 계정/접근 권한 관리, 최소권한 | IAM, Identity Center, Access Analyzer, SCP → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md)      |
| 인증/MFA            | Identity Center MFA(passkey), 루트 보호                                                               |
| 암호화(저장/전송)        | KMS, ACM, TLS → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)                                    |
| 접근 기록/로그 관리·보존    | CloudTrail + Config + 중앙 Log Archive + Object Lock → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md) |
| 취약점 점검            | Inspector, Patch Manager                                                                          |
| 침해사고 대응           | GuardDuty, Security Hub, IR 런북 → [06. Incident Response — MOC](../detection-response/incident-response/index.md)                               |
| 백업/복구             | AWS Backup + Vault Lock → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](../resilience/immutable-backup-worm.md)                      |
| 변경/형상 관리          | Config, CloudFormation/IaC                                                                        |
| 물리/환경 보안          | **AWS 책임** → Artifact 증빙 → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)                                            |
| 개인정보 파기·접근 통제     | S3 수명주기, Macie, 접근로그 → [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](./pipa-privacy.md)                                                           |

## 3. SA 작업 패턴 (인증 가속)
1. 인증기준을 AWS 책임 / 고객 책임으로 분리(책임 공유). → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)
2. AWS 책임 항목 → **Artifact 보고서**로 증빙 대체.
3. 고객 책임 항목 → Config Conformance Pack/Security Hub로 *상시 측정 + 증빙 자동화*. → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md)
4. 갭 항목 → 개선 로드맵.

## 4. 자주 받는 질문
- "ISMS-P 항목이 너무 많아요" → AWS 책임 부분은 Artifact로 대체, 고객 부분만 자동 증빙 체계로.
- "매년 갱신 심사 부담" → 상시 모니터링(Config/Security Hub)으로 *지속적 준수 상태* 유지.

## 관련
- [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md) · [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](./pipa-privacy.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md) · [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md) · [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md)

### References
- [KISA ISMS-P 인증기준 안내서(2023.11)](https://isms.kisa.or.kr/main/ispims/notice/?boardId=bbs_0000000000000014&cntId=21&mode=view) · [개인정보위 인증기준 안내](https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=59)
- AWS — ISMS/ISMS-P 관련 Artifact 보고서, AWS Korea 컴플라이언스 자료

