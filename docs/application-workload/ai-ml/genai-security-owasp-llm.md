---
title: "생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails"
sidebar_label: "생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails"
sidebar_position: 2
tags:
  - "AI보안"
---
# 생성형 AI 보안

:::info[한 줄 정의]
LLM 앱은 기존 클라우드 보안(IAM/암호화/네트워크) 위에 **프롬프트 인젝션, 민감정보 유출, 과도한 에이전시** 같은 AI 고유 위협을 더한다. 신뢰 경계가 "자연어"로 흐려진다는 게 핵심.
:::

## 1. 왜 새로운가
LLM은 데이터(컨텍스트)와 명령(프롬프트)이 같은 채널(자연어)로 들어온다 → 전통적 입력검증으로 분리 어려움. 게다가 에이전트가 도구(API/DB)를 호출하면 LLM의 실수가 *실제 행동*이 된다.

## 2. OWASP LLM Top 10 (핵심)
| 위협 | 설명 | 대응 |
|---|---|---|
| **Prompt Injection** | 입력/문서로 모델 지시 탈취(직접/간접) | 입력·출력 필터, 권한 분리, 신뢰경계 |
| **Sensitive Info Disclosure** | 학습/컨텍스트의 민감정보 유출 | 데이터 거버넌스, 마스킹, Guardrails |
| **Supply Chain** | 오염된 모델/플러그인/데이터셋 | 출처 검증, 서명 |
| **Data/Model Poisoning** | 학습 데이터 오염 | 데이터 검증·격리 |
| **Improper Output Handling** | 모델 출력을 무검증 실행(XSS/SQLi) | 출력 인코딩/검증 |
| **Excessive Agency** | 에이전트에 과한 권한/자율성 | 최소권한, 사람 승인, 도구 제한 |
| **System Prompt Leakage** | 시스템 프롬프트 노출 | 비밀을 프롬프트에 두지 않기 |
| Vector/Embedding 약점(RAG) | RAG 데이터 접근통제 미흡 | 문서 단위 인가 |

## 3. AWS 대응
- **Amazon Bedrock Guardrails**: 유해/민감 주제 차단, PII 마스킹, 프롬프트 공격 필터, **contextual grounding**(환각/사실성 검사).
- **IAM/네트워크**: Bedrock 모델 접근통제, VPC(PrivateLink)로 데이터 격리, KMS 암호화.
- **RAG 보안**: 지식베이스 문서에 *사용자별 인가* 적용(문서 단위 접근통제), 민감 문서 분리.
- **에이전트(Agents/도구 호출)**: 최소권한 역할, 위험 작업에 사람 승인, 도구 allowlist.
- **로깅/모니터링**: 프롬프트·응답 로깅(민감정보 주의), CloudTrail, 이상 사용 탐지.

## 4. 데이터 거버넌스 (가장 흔한 사고)
- 사내 챗봇이 권한 없는 문서를 답변 → RAG 인가 누락. 검색 단계에서 사용자 권한을 적용해야.
- 입력 데이터의 PII → 마스킹/가명처리. → [ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호](./ml-data-security.md), [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](../../governance-compliance/pipa-privacy.md)

## 5. 자주 받는 질문
- "사내 GenAI 도입하는데 안전한가?" → 3가지부터: ① RAG 문서 인가 ② 입출력 Guardrails ③ 에이전트 권한 최소화.
- "프롬프트 인젝션 완전 차단 가능?" → 단일 해결책 없음 → 계층 방어 + 권한 분리(LLM이 직접 위험행동 못 하게).

## 관련
- [AI 워크로드 보안 — Bedrock / SageMaker 접근통제](./ai-workload-security.md) · [ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호](./ml-data-security.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../../foundations/threat-modeling-attack.md)
- OWASP Top 10 for LLM Applications

