---
title: "한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리"
sidebar_label: "한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리"
sidebar_position: 5
tags:
  - "거버넌스"
  - "한국규제"
---
# 한국 금융(FSI) 클라우드 규제

:::info[한 줄 정의]
금융권 클라우드는 **전자금융거래법/전자금융감독규정 + 금융보안원 안전성 평가 + 망분리 + 중요도 분류**의 4축으로 본다. 핵심은 "어디까지 클라우드에 올릴 수 있고, 무엇을 증빙해야 하는가".
:::

:::warning[검증 필요]
규정 조항·기준은 개정이 잦다(금융위/금융감독원/금융보안원 고시). 아래는 고객 대화에 쓰는 *구조*이며, 구체 조항 번호·요건은 최신 고시로 반드시 확인.
:::

## 1. 규제 체계 (누가 무엇을)
| 주체 | 역할 |
|---|---|
| 금융위원회/금융감독원 | 전자금융거래법, **전자금융감독규정**, 클라우드 이용 가이드 |
| **금융보안원(FSI)** | 클라우드 서비스 **안전성 평가**(CSP 대상), 가이드라인 |
| 개인정보보호위원회 | 개인정보보호법(신용정보 관련은 신용정보법) |

## 2. 핵심 개념 — 업무 중요도 평가 (가장 먼저 묻는 질문)
- 금융회사는 퍼블릭 클라우드에 올릴 정보처리시스템을 **업무 중요도 평가**로 분류(중요/비중요).
- **2023 전자금융감독규정 개정**(2022.4 「클라우드 및 망분리 규제 개선방안」 후속): 중요도 평가 기준을 구체화하고, **비중요 업무는 CSP 건전성·안전성 평가, 업무연속성계획, 안전성 확보조치 절차를 완화** 적용 가능.
- **2024.12.24 개정**: 클라우드 위·수탁 계약의 기본 포함사항 간소화(이용 절차 합리화).
- SA 역할: 워크로드를 중요도별로 매핑 → 각 등급에 맞는 AWS 통제 수준을 차등 설계.

## 3. 금융보안원(FSI) 클라우드 안전성 평가
- **금융보안원이 CSP(예: AWS)를 대신 평가** → 그 결과를 금융사가 클라우드 **이용보고** 시 활용(금융사 부담 경감).
- 평가 항목: 데이터 보호, 접근통제, 암호화, 위치/주권, 감사, 사고대응 등.
- ⚠️ **평가 결과에는 유효기간** 존재 → 반드시 *최신* 결과를 요청해 활용. AWS 평가 결과/증빙([Artifact](./aws-compliance-services.md))을 금융사 내부 평가에 연결.

## 4. 망분리 — 규제 완화 로드맵 (현재 가장 뜨거운 주제)
- **전통**: 내부 업무망과 외부(인터넷)망의 **물리적 분리** 원칙(전자금융감독규정). 클라우드·SaaS·생성형 AI 도입의 최대 장벽이었음.
- **「금융분야 망분리 개선 로드맵」(금융위, 2024.8.13)** — 핵심 전환:
  - 생성형 AI 활용 허용, **SaaS 이용 범위 대폭 확대**, R&D 환경 개선.
  - **1단계(~2025 상반기)**: 규제 샌드박스로 생성형 AI 허용 + SaaS를 보안관리·**고객관리(CRM)·가명정보 처리·모바일 단말 SaaS**까지 확대(기존엔 문서·인사 등 비중요·비개인신용정보만).
  - **2026.1.20**: 「전자금융감독규정 시행세칙」 개정안 사전예고 — *내부 업무망에서 일정 보안규율 준수 시 SaaS 이용을 망분리 예외로 명시*.
  - **중·장기**: 금융보안 법·체계 전면 개편 → **자율보안 · 결과책임** 원칙으로(획일적 사전규제 → 자율+사후책임).
- > 통찰: 흐름은 "물리적 망분리 의무 → 보안규율 준수 전제의 **예외 허용 / 자율보안**". 단 *완화가 보안 약화로 이어지지 않게* 금융사 자율보안 체계 마련이 동반 — "예외를 쓰려면 어떤 보안통제를 갖춰야 하나"를 설계로 답해야.
- **AWS 구현 패턴**(망분리/대체통제):
  - VPC 분리(운영/개발/DMZ), private subnet, 엄격한 SG/NACL.
  - 인터넷 경계 최소화(VPC Endpoint·PrivateLink로 백본 내 처리). → [VPC 보안 — SG / NACL / Flow Logs / Endpoint](../infrastructure-network/vpc-security.md)
  - 관리망 접근은 Verified Access / SSM Session Manager(베스천 제거). → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md)
  - Zero Trust로 "분리된 망 안에서도 ID 검증". → [Zero Trust Architecture](../foundations/zero-trust-architecture.md)
  - 생성형 AI: Bedrock VPC(PrivateLink)+Guardrails+가명처리. → [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](../application-workload/ai-ml/genai-security-owasp-llm.md)

## 5. AWS 통제 매핑
| 규제 요구 | AWS |
|---|---|
| 데이터 암호화 + **고객 키 통제** | KMS CMK / CloudHSM / XKS → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) |
| 처리 중 보호 / 운영자 접근 차단 | Nitro Enclaves → [Nitro Enclaves / Confidential Computing](../data-protection/nitro-enclaves-confidential-computing.md) |
| 접근통제·최소권한·MFA | IAM Identity Center, SCP → [02. IAM & Identity — MOC](../identity-access/index.md) |
| 감사 로그·보존·무결성 | CloudTrail + Object Lock → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md) |
| 데이터 위치(국내) | 서울 리전, 데이터 주권 설계 |
| 사고대응·복구 | IR 런북, 불변 백업 → [07. Resilience & Ransomware — MOC](../resilience/index.md) |
| 위탁/재위탁 관리 | 책임 공유 문서화 → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md) |

## 6. 자주 받는 질문
- "금융권은 클라우드 못 쓰지 않나요?" → 중요업무도 가능. 중요도 평가 + FSI 평가 활용 + 내부통제 증빙이 전제.
- "망분리 때문에 SaaS/생성형 AI 못 쓴다" → 2024 로드맵·2026 시행세칙으로 *보안규율 준수 시 예외 허용* 방향. "예외를 쓰려면 갖춰야 할 통제"를 AWS로 설계.
- "데이터가 해외로?" → 서울 리전 + 데이터 주권 설계로 국내 보관 보증.
- "규제가 또 바뀌나?" → 중장기 자율보안-결과책임 전환 → *사전 체크리스트보다 자율 보안 거버넌스* 가 중요해짐.

## 7. 흔한 함정
- 규정 조항 번호를 외워 말하기보다 *최신 고시 확인 + 금융사 내부 규정* 우선(개정 빈번).
- CSP 평가(AWS가 받음) ≠ 금융사 자체 책임(설정·운영은 고객). FSI 평가 결과는 **유효기간** 확인.
- 망분리 "완화"를 "보안 불필요"로 오해 금지 — 예외엔 *대체 보안통제* 가 따라붙는다.

## 관련
- [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md) · [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](./pipa-privacy.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md) · [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)

### References (최신 고시 확인 필수)
- [금융위 — 클라우드 이용절차 합리화 및 망분리 규제 완화(보도자료)](https://www.fsc.go.kr/no010101/78962) · [금융분야 망분리 개선 로드맵(2024.8.13)](https://www.fsc.go.kr/no010101/86080)
- [금융보안원 — 금융분야 클라우드컴퓨팅서비스 이용 가이드(2025 개정)](https://www.fsec.or.kr/bbs/detail?menuNo=222&bbsNo=11691)
- 전자금융감독규정 / 시행세칙(국가법령정보센터, 최신본), 전자금융거래법

