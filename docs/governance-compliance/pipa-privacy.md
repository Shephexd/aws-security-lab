---
title: "개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권"
sidebar_label: "개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권"
sidebar_position: 7
tags:
  - "거버넌스"
  - "한국규제"
---
# 개인정보보호법(PIPA) & 프라이버시

:::info[한 줄 정의]
개인정보 생명주기(수집-이용-제공-파기) 전반의 보호 + 가명/익명 처리 + 국외 이전 통제. **2023 전면개정**(2023.9.15 시행)으로 국외이전 요건 다양화·전송요구권(마이데이터 확대)이 핵심 변화. 클라우드에선 위치·암호화·접근통제·파기 증빙이 관건.
:::

## 1. 2023 전면개정 핵심 (2023.2 통과 → 2023.9.15 시행)
- **국외이전 요건 다양화**: 기존 *정보주체 동의* 중심 → **계약·인증·적정성 결정** 등으로 확대(글로벌 상호운용성). 단 위반 시 보호위가 **국외이전 중지명령** 가능.
- **개인정보 전송요구권 (마이데이터 확대)**: 금융·공공에 한정됐던 마이데이터를 **전 산업으로 확대**하는 제도적 기반.
- 형벌 중심 → 경제벌(과징금) 강화 등 제재 체계 정비.

## 2. 가명정보 / 익명정보
- **가명정보**: 추가정보 없이는 특정 개인 식별 불가하게 처리 → 통계·연구·공익기록 목적 *동의 없이* 활용 가능.
- 필수 통제: **가명정보와 추가정보 분리 보관 + 접근권한 분리** (가명정보 처리 가이드라인 2024.2 개정).
- 익명정보 = 복원 불가 → 개인정보 아님.

## 3. AWS 매핑
| 요구 | AWS |
|---|---|
| 민감정보 발견·분류(주민번호 등) | Macie 커스텀 식별자 → [데이터 분류 & 탐지 — Macie](../data-protection/data-classification-macie.md) |
| 암호화/가명·토큰화 | KMS, 가명처리 파이프라인(Glue/EMR) → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) |
| 가명정보·추가정보 **분리 보관/권한 분리** | 계정·키·IAM 분리 → [IAM 정책 평가 로직 (SCP / RCP / Boundary 전체 순서)](../identity-access/iam-policy-evaluation-logic.md) |
| 접근·파기 증빙 | CloudTrail data event + S3 수명주기·파기 기록 → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md) |
| 국내 보관 / 국외이전 통제 | 서울 리전, cross-region 통제(RCP/SCP) → [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../data-protection/dlp.md) |
| 유출 신고·통지 | IR 런북(기한 준수) → [IR 프레임워크 — NIST 라이프사이클 / 런북](../detection-response/incident-response/ir-framework.md) |

## 4. 자주 받는 질문
- "개인정보를 클라우드에?" → 국내(서울 리전) + 암호화(CMK) + 접근로그 + 파기 증빙으로 충족.
- "글로벌 서비스라 데이터가 국외로" → 개정법의 계약·인증 기반 국외이전 요건 설계(동의 외 경로).
- "데이터로 AI 학습" → 가명/익명 처리 + 분리보관 + [ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호](../application-workload/ai-ml/ml-data-security.md)
- "마이데이터 사업" → 전송요구권 기반 API·동의·보안 설계.

## 관련
- [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md) · [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md) · [데이터 분류 & 탐지 — Macie](../data-protection/data-classification-macie.md)

### References
- [개인정보위 — 가명정보 처리 가이드라인(2024.2)](https://www.privacy.go.kr/front/bbs/bbsView.do?bbsNo=BBSMSTR_000000000049&bbscttNo=20658) · 개인정보 보호법/시행령(국가법령정보센터, 최신본)
- 개인정보 국외 이전 운영 규정, 마이데이터(전송요구권) 관련 고시

