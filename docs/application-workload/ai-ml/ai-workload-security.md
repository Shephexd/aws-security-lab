---
title: "AI 워크로드 보안 — Bedrock / SageMaker 접근통제"
sidebar_label: "AI 워크로드 보안 — Bedrock / SageMaker 접근통제"
sidebar_position: 1
tags:
  - "AI보안"
---
# AI 워크로드 보안

:::info[한 줄 정의]
Amazon Bedrock·SageMaker 같은 AI 서비스도 결국 **IAM(누가 모델을 호출/배포하는가) · 네트워크(데이터가 어디로 흐르는가) · 암호화(저장·전송·키 통제)** 위에 선다. 여기에 **모델 거버넌스(어떤 모델/버전을 누가, 입력 데이터가 학습에 쓰이는가)** 와 **Guardrails(입출력 안전)** 라는 AI 고유 계층이 더해진다.
:::

## 1. 왜 중요한가
AI 서비스는 "관리형이라 알아서 안전하다"는 오해를 받기 쉽지만, 책임 공유 모델(→ [AWS 책임 공유 모델 (Shared Responsibility)](../../foundations/shared-responsibility-model.md))은 그대로 적용된다. AWS는 서비스 인프라를 보호하지만, **모델 호출 권한·데이터 경로·암호화 키·로깅**은 고객 구성 영역이다. 특히 AI 워크로드는 다음 이유로 위험 표면이 넓다.

- 민감 데이터가 프롬프트·학습셋·임베딩 형태로 모델 주변을 흐른다 → 데이터 거버넌스가 곧 모델 보안.
- 모델 호출은 강력한 행위(콘텐츠 생성, 도구 실행)이므로 **과도한 IAM 권한**이 곧 과도한 능력이 된다.
- 자연어 입력은 전통적 입력검증으로 명령과 데이터를 분리하기 어렵다(프롬프트 인젝션). → [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](./genai-security-owasp-llm.md)

## 2. IAM — 모델 호출/배포 접근통제
Bedrock·SageMaker의 모든 동작은 IAM API 권한으로 통제된다. 최소권한과 조건 키로 "누가 어떤 모델/리소스를" 쓰는지 좁힌다.

| 영역 | 통제 포인트 | 비고 |
| --- | --- | --- |
| Bedrock 모델 호출 | `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream` | 리소스 ARN으로 **특정 모델 ID만** 허용 가능 |
| Bedrock 모델 접근 활성화 | 모델 액세스 콘솔/`bedrock:*` 관리 권한 | 계정 단위로 어떤 기반모델을 켤지 분리 |
| Bedrock Guardrail/KB 사용 | `bedrock:ApplyGuardrail`, 지식베이스 호출 권한 | 가드레일 ID 단위 통제 |
| SageMaker 노트북/스튜디오 | `sagemaker:CreatePresignedDomainUrl` 등 + 실행 역할 | 사용자 권한과 **노트북 실행 역할** 분리 |
| SageMaker 엔드포인트 호출 | `sagemaker:InvokeEndpoint` | 추론 소비자에게 학습/배포 권한 미부여 |

- IAM 조건 키(`aws:SourceVpc`, `aws:SourceVpce`, `aws:PrincipalTag` 등)로 "특정 VPC 엔드포인트에서만", "특정 팀 태그만" 같은 추가 경계를 건다.
- SageMaker는 **사용자 자격증명 ≠ 실행 역할**임에 주의: 노트북/잡이 실제로 데이터에 접근할 때 쓰는 권한은 실행 역할이다. 실행 역할에 `*` 권한을 주는 것이 가장 흔한 과대권한 사고. → [IAM 핵심 — User/Group/Role/Policy](../../identity-access/iam-core.md)

## 3. 네트워크 — VPC 엔드포인트 / PrivateLink
AI API 트래픽이 퍼블릭 인터넷을 타지 않도록 **인터페이스 VPC 엔드포인트(PrivateLink)** 를 사용해 프라이빗 경로로 고정한다.

| 서비스 | 격리 방법 | 비고 |
| --- | --- | --- |
| Bedrock | `com.amazonaws.<region>.bedrock-runtime` 등 인터페이스 엔드포인트 | 엔드포인트 정책으로 허용 모델/액션 제한 |
| SageMaker (학습/추론) | VPC 모드 + 인터페이스 엔드포인트(api/runtime) | 잡/엔드포인트를 고객 서브넷에 ENI로 배치 |
| 노트북/스튜디오 | VPC-only 모드, 인터넷 액세스 비활성 | 데이터 유출 경로 차단 |

- **VPC 엔드포인트 정책 + IAM 조건 키**를 결합해 "이 VPC 안에서만 모델 호출"을 강제하면, 자격증명이 유출돼도 경로 밖에서는 쓸 수 없다(데이터 경계).
- SageMaker **네트워크 격리(network isolation) 모드**: 컨테이너가 외부 네트워크에 전혀 나가지 못하게 해 학습/추론 중 데이터 반출을 막는다. 외부 의존성은 사전 패키징 필요. → [VPC 보안 — SG / NACL / Flow Logs / Endpoint](../../infrastructure-network/vpc-security.md)

## 4. Bedrock Guardrails — 입출력 안전 계층
Guardrails는 모델·앱과 독립적으로 입력 프롬프트와 출력 응답에 정책을 적용한다.

| 기능 | 내용 |
| --- | --- |
| 콘텐츠 필터 | 증오·폭력·성적·욕설 등 유해 카테고리 차단(강도 조절) |
| 거부 주제 | 비즈니스상 금지 주제 정의·차단 |
| 민감정보(PII) | PII 탐지 후 **마스킹 또는 차단**, 정규식 기반 커스텀 필터 |
| 프롬프트 공격 필터 | 프롬프트 인젝션·탈옥(jailbreak) 패턴 탐지 |
| 컨텍스트 그라운딩 | 응답이 제공된 출처에 근거하는지 검사(환각·관련성 점검) |

- Guardrail은 **모델과 분리**되어 여러 모델·앱에 재사용·버전관리되므로, 인프라 계층에서 일관된 안전 정책을 강제할 수 있다. `ApplyGuardrail` API로 모델 호출 밖에서도 독립 적용 가능.
- 프롬프트 인젝션은 단일 통제로 막히지 않는다: Guardrail(입출력 필터) + IAM 최소권한(LLM이 위험 행위를 직접 못 하게) + 출력 검증의 계층 방어가 필요. → [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](./genai-security-owasp-llm.md)

## 5. 암호화 & 데이터 격리 (KMS)
AI 워크로드의 모든 저장·전송 데이터는 암호화하고, 가능하면 **고객 관리 키(CMK)** 로 통제한다.

| 대상 | 암호화 |
| --- | --- |
| Bedrock 커스텀 모델·학습 데이터 | 출력 모델·학습 작업을 CMK로 암호화 |
| Bedrock 에이전트/지식베이스 | 세션·벡터 저장소·트랜스크립트 KMS 암호화 |
| SageMaker 노트북/볼륨/잡 | EBS·잡 출력·모델 아티팩트(S3)를 CMK로 |
| 전송 구간 | 모든 API는 TLS, 인터-노드 학습 트래픽 암호화 옵션 |

- **데이터 격리(핵심 사실)**: Amazon Bedrock은 고객의 프롬프트·입력·출력을 **기반모델 학습에 사용하지 않으며**, 서드파티 모델 제공자와 공유하지 않는다. 데이터는 처리되는 리전에 머문다. 커스텀 모델 미세조정 시에도 결과 모델은 고객 전용이며 기반모델에 반영되지 않는다.
- 키 통제가 곧 데이터 통제다: KMS 키 정책 + CloudTrail로 "누가 모델/데이터 키를 썼는가"를 통제·감사한다. → [KMS & Envelope Encryption](../../data-protection/kms-envelope-encryption.md)

## 6. 로깅 & 모니터링
| 로그 | 내용 |
| --- | --- |
| **CloudTrail** | 모든 관리/데이터 API 호출(누가 모델을 호출·구성했는가) |
| **Bedrock 모델 호출 로깅** | 프롬프트·응답·메타데이터를 S3/CloudWatch Logs로 저장(옵션) |
| SageMaker | CloudWatch 지표·로그, 엔드포인트 호출/데이터 캡처 |
| CloudWatch 이상탐지 | 비정상 호출량·비용 급증 탐지 |

- 모델 호출 로깅은 프롬프트·응답 전문을 남길 수 있으므로 **민감정보가 로그로 새지 않도록** 대상 버킷의 KMS 암호화·접근통제·보존정책을 함께 설계한다. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../../detection-response/detection/logging-auditing.md)

## 7. 거버넌스 & 멀티테넌시
- **모델/버전 거버넌스**: 어떤 기반모델을 계정에서 켤지, 누가 커스텀 모델을 배포할지 SCP/IAM으로 제한. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../../identity-access/multi-account-organizations.md)
- **모델 카드/리니지**: SageMaker Model Cards·Model Registry로 모델의 의도·데이터·승인 상태를 문서화(책임 있는 AI). 상세 데이터 측면은 → [ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호](./ml-data-security.md)
- **팀/고객별 격리**: 계정·VPC·KMS 키·실행 역할을 테넌트 단위로 분리해 한 테넌트의 데이터·모델이 다른 테넌트로 새지 않게 한다.

## 핵심 고려사항
- 모델 호출 권한은 리소스 ARN(모델 ID) 단위로 좁히고, 소비자에게 학습/배포 권한을 주지 않는다.
- PrivateLink + 엔드포인트 정책 + IAM 조건 키로 "지정 VPC에서만 호출"이라는 데이터 경계를 강제한다.
- Guardrails는 모델과 분리해 재사용·버전관리하고, 인젝션은 계층 방어로 다룬다.
- 학습 데이터·모델 아티팩트는 CMK로 암호화하고 키 정책으로 접근을 통제한다.
- 모델 호출 로깅의 저장 대상을 암호화·접근통제한다(로그가 새 유출 경로가 되지 않게).

## 흔한 함정
- SageMaker 실행 역할에 광범위 권한(`*`)을 부여 → 노트북 탈취 시 데이터 전면 노출.
- Bedrock/SageMaker API를 퍼블릭 경로로 호출(엔드포인트 미사용) → 데이터 경계 부재.
- Guardrails 미적용 또는 출력만 검사하고 입력 필터를 빼먹음.
- 모델 호출 로그를 평문·공개 버킷에 저장해 프롬프트 속 민감정보 유출.
- "관리형이니 암호화·격리는 기본"이라 가정하고 CMK·네트워크 격리를 구성하지 않음.

## 관련
- [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](./genai-security-owasp-llm.md) · [ML 데이터 보안 — 학습데이터 / 모델 / 추론 보호](./ml-data-security.md) · [KMS & Envelope Encryption](../../data-protection/kms-envelope-encryption.md) · [AWS 책임 공유 모델 (Shared Responsibility)](../../foundations/shared-responsibility-model.md)

### References
- [Amazon Bedrock Security and Privacy](https://aws.amazon.com/bedrock/security-compliance/) · [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)
- [Bedrock VPC 인터페이스 엔드포인트(PrivateLink)](https://docs.aws.amazon.com/bedrock/latest/userguide/usingVPC.html)
- [Bedrock 모델 호출 로깅](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html)
- [SageMaker 인프라 보안 / VPC](https://docs.aws.amazon.com/sagemaker/latest/dg/infrastructure-security.html) · [SageMaker 네트워크 격리](https://docs.aws.amazon.com/sagemaker/latest/dg/mkt-algo-model-internet-free.html)

