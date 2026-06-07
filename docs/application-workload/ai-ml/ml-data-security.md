---
title: "ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호"
sidebar_label: "ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호"
sidebar_position: 3
tags:
  - "AI보안"
---
# ML 데이터 보안

:::info[한 줄 정의]
**데이터 → 모델 → 추론** 파이프라인 전 단계의 기밀성·무결성·프라이버시. 모델은 학습 데이터의 "압축본"이므로, 데이터 거버넌스가 약하면 모델 자체가 유출·오염·프라이버시 사고의 매개체가 된다.
:::

## 1. 왜 중요한가
ML 시스템에서 데이터는 한 번 쓰고 버려지지 않는다. 학습 데이터는 모델 가중치에 흡수되고, 모델은 추론 시 그 지식을 다시 노출한다. 따라서 보호 대상이 "파일"이 아니라 **데이터 흐름 전체**다.

- 학습 데이터의 PII가 적절히 처리되지 않으면 모델이 그것을 *기억*해 추론 시 토해낼 수 있다(개인정보 사고).
- 학습 데이터가 오염(poisoning)되면 모델 행동이 조작되며, 사후 탐지가 어렵다 → 출처·무결성이 핵심.
- 모델 아티팩트(가중치)는 막대한 투자가 응축된 자산이자 데이터 사본이다 → 탈취·추출 방지 필요.
- 어떤 데이터로 어떤 모델이 나왔는지(리니지)를 모르면 사고 대응·규제 대응·재현이 불가능하다.

## 2. 학습 데이터 보호 (저장/접근/무결성)
대부분의 학습 데이터는 S3에 모인다. S3 데이터 보호 기본기를 ML 맥락에서 강제한다.

| 통제 | 방법 | 비고 |
| --- | --- | --- |
| 저장 암호화 | S3 SSE-KMS(CMK) | 키 정책으로 학습팀만 복호화 허용 |
| 접근통제 | 버킷 정책 + IAM + 퍼블릭 액세스 차단 | 학습 작업의 **실행 역할** 단위로 최소권한 |
| 전송 암호화 | TLS 강제(`aws:SecureTransport`) | |
| 무결성/버전 | 버전관리 + 객체 잠금(WORM) | 데이터셋 변조·삭제 방어 → [변경 불가 백업 (WORM) — Vault Lock / Object Lock](../../resilience/immutable-backup-worm.md) |
| 접근 가시성 | S3 액세스 로그 + CloudTrail 데이터 이벤트 | 누가 어떤 데이터셋을 읽었나 |

- 데이터셋에 대한 접근은 사람 자격증명이 아니라 **학습 잡 실행 역할**로 일어나는 경우가 많다. 이 역할이 과대권한이면 데이터 경계가 무너진다. → [KMS & Envelope Encryption](../../data-protection/kms-envelope-encryption.md)

## 3. PII 처리 — 학습 전 (Macie)
개인정보를 학습에 쓰기 전, 무엇이 어디에 있는지부터 파악하고 처리한다.

| 단계 | 도구/방법 |
| --- | --- |
| 발견·분류 | **Amazon Macie**로 S3 내 PII 자동 탐지·분류 |
| 비식별 처리 | 가명처리·익명화·마스킹·토큰화(학습 전) |
| 최소 수집 | 목적에 필요한 속성만 보존(목적 제한) |
| 거버넌스 | 데이터 카탈로그 + 보존·삭제 정책 |

- Macie로 학습 버킷의 PII 노출을 상시 점검하고, 정제 파이프라인에서 제거·가명화한다. 규제 측면(개인정보 보호법 등)은 → [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](../../governance-compliance/pipa-privacy.md), 분류 도구는 → [데이터 분류 & 탐지 — Macie](../../data-protection/data-classification-macie.md)
- 가명/익명 처리는 모델이 PII를 기억해 추론 시 재현하는 **데이터 노출(membership/attribute leakage)** 위험도 함께 낮춘다.

## 4. 모델 아티팩트 무결성 & 접근통제
| 위협 | 통제 |
| --- | --- |
| 모델 탈취(가중치 유출) | 아티팩트 S3를 CMK 암호화 + 최소권한, 다운로드 가능 주체 제한 |
| 모델 변조 | 아티팩트 체크섬/서명, 버전관리, 배포 시 무결성 검증 |
| 출처 불명 모델 | Model Registry로 승인된 모델만 배포(거버넌스 게이트) |
| 공급망 오염 | 외부에서 받은 모델·라이브러리의 출처·서명 검증 → [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md) |

- 모델 아티팩트는 사실상 학습 데이터의 사본이므로 **데이터와 동일한 등급으로 보호**한다. SageMaker Model Registry로 승인 워크플로를 강제해 검증되지 않은 모델의 프로덕션 진입을 막는다.

## 5. 추론 엔드포인트 보안
| 통제 | 내용 |
| --- | --- |
| 인증/인가 | `sagemaker:InvokeEndpoint` 최소권한, API 앞단에 인증 게이트 |
| 네트워크 격리 | VPC 모드 + PrivateLink, 퍼블릭 노출 제거 |
| 레이트 리밋 | API Gateway/WAF로 호출량 제한(모델 추출 공격 완화) |
| 입출력 보호 | 페이로드 TLS, 필요 시 데이터 캡처 로그 암호화 |
| 격리 | 테넌트별 엔드포인트/역할 분리 |

- **모델 추출(model extraction)**: 공격자가 대량 쿼리로 입출력을 수집해 모델을 복제. 레이트 리밋·이상 호출 탐지·인증으로 완화. → [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](../../infrastructure-network/edge-perimeter-waf-shield.md)
- **멤버십 추론(membership inference)**: 특정 데이터가 학습에 쓰였는지 추론하는 공격. 과적합 억제·출력 신뢰도 노출 최소화로 완화.

## 6. 데이터/모델 리니지 & 재현성
- **리니지(lineage)**: 어떤 데이터셋·전처리·하이퍼파라미터·코드 버전이 어떤 모델 버전을 만들었는지 추적. SageMaker Lineage Tracking·ML Lineage로 자동 기록.
- 리니지는 사고 대응("오염된 데이터로 학습된 모델은 어느 것인가"), 규제 대응(설명·감사), 재현성의 토대다.
- 데이터셋 버전(S3 버전관리/객체 잠금) + 모델 버전(Model Registry) + 코드 버전(Git)을 함께 고정해야 재현 가능하다.

## 7. 공격 인식 (poisoning / exfiltration)
| 공격 | 설명 | 완화 |
| --- | --- | --- |
| 데이터 포이즈닝 | 학습 데이터에 악성 샘플 주입해 모델 조작 | 출처 검증, 입력 검증·격리, 이상 탐지 |
| 모델 추출 | 쿼리로 모델 복제 | 레이트 리밋, 인증, 호출 모니터링 |
| 멤버십 추론 | 학습 포함 여부 추론 | 과적합 억제, 출력 최소화 |
| 데이터 반출(exfiltration) | 학습/추론 중 데이터 외부 유출 | 네트워크 격리 모드, 이그레스 통제 |

- 학습 환경의 이그레스를 SageMaker 네트워크 격리·VPC 엔드포인트·이그레스 통제로 막으면 포이즈닝 외에 **반출** 경로도 함께 차단된다.

## 핵심 고려사항
- 학습 데이터·모델 아티팩트를 동일 등급으로 보고 CMK 암호화 + 실행 역할 최소권한을 적용한다.
- 학습 전 Macie로 PII를 발견하고 가명/마스킹 처리(목적 제한).
- Model Registry로 승인된 모델만 배포하고, 리니지로 데이터-모델 연결을 추적한다.
- 추론 엔드포인트는 인증·격리·레이트 리밋으로 추출 공격을 완화한다.
- 학습 환경의 이그레스를 막아 포이즈닝·반출을 동시에 줄인다.

## 흔한 함정
- 학습 잡 실행 역할에 광범위 S3 권한을 부여 → 데이터 경계 붕괴.
- PII 정제 없이 원본 데이터로 학습 → 모델이 개인정보를 기억·재현.
- 모델 아티팩트를 평문/공개 버킷에 보관 → 모델·데이터 동시 유출.
- 리니지 미기록 → 사고 시 어떤 모델이 영향받았는지 추적 불가, 재현 불가.
- 추론 엔드포인트를 인증·레이트 리밋 없이 공개 → 모델 추출·남용.

## 관련
- [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](./genai-security-owasp-llm.md) · [AI 워크로드 보안 — Bedrock / SageMaker 접근통제](./ai-workload-security.md) · [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](../../governance-compliance/pipa-privacy.md) · [데이터 분류 & 탐지 — Macie](../../data-protection/data-classification-macie.md) · [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md)

### References
- [Amazon Macie](https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html)
- [SageMaker 데이터 보호](https://docs.aws.amazon.com/sagemaker/latest/dg/data-protection.html) · [SageMaker 네트워크 격리](https://docs.aws.amazon.com/sagemaker/latest/dg/mkt-algo-model-internet-free.html)
- [SageMaker ML Lineage Tracking](https://docs.aws.amazon.com/sagemaker/latest/dg/lineage-tracking.html) · [SageMaker Model Registry](https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html)
- [S3 데이터 보호(암호화)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)

