---
title: Well-Architected 정렬 (SEC 1–11)
sidebar_label: WAF 정렬 (SEC 1–11)
sidebar_position: 2
tags:
  - well-architected
  - 거버넌스
---

# Well-Architected 보안 기둥 정렬 (SEC 1–11)

이 가이드의 콘텐츠를 **AWS Well-Architected 보안 기둥의 베스트 프랙티스(SEC 1–11)** 에 1:1로 정렬한 크로스워크입니다. 대략적 매핑이 아니라, 각 베스트 프랙티스 질문이 *이 가이드의 어떤 페이지로 답해지는지* 를 명시합니다.

> 배경·설계 원칙은 [Well-Architected — Security Pillar](./well-architected-security-pillar.md) 참조. 실제 계정 구성이 이 기준에 부합하는지 자동 진단하려면 → [AWS SRA 진단 (SRA Verify)](../diagnostics/sra-verify.md).

:::info 두 관점
이 페이지는 **모범사례(목표 상태)** 관점입니다 — "이렇게 설계해야 한다." 각 SEC를 **충족하지 못하면 증상(문제)으로 나타납니다.** 현재 겪는 증상에서 출발하려면 → **[자주 겪는 보안 문제](../common-problems.md)** (각 문제가 어떤 SEC에 해당하는지 표기).
:::

## Security foundations

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 1** | 워크로드를 어떻게 안전하게 운영하는가 | [책임 공유 모델](./shared-responsibility-model.md) · [Well-Architected 보안 기둥](./well-architected-security-pillar.md) · [심층 방어](./defense-in-depth.md) · [멀티 계정 / Organizations](../identity-access/multi-account-organizations.md) · [Landing Zone & Control Tower](../governance-compliance/landing-zone-control-tower.md) · [위협 모델링](./threat-modeling-attack.md) |

## Identity and access management

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 2** | 사람·머신의 **ID** 를 어떻게 관리하는가 | [인증 프로토콜](./authentication-protocols.md) · [IAM 핵심](../identity-access/iam-core.md) · [ID 페더레이션](../identity-access/identity-federation.md) |
| **SEC 3** | 사람·머신의 **권한** 을 어떻게 관리하는가 | [인가 모델](./authorization-models.md) · [IAM 정책 평가 로직](../identity-access/iam-policy-evaluation-logic.md) · [특권 접근 관리](../identity-access/privileged-access-management.md) |

## Detection

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 4** | 보안 이벤트를 어떻게 탐지·조사하는가 | [로깅 & 감사](../detection-response/detection/logging-auditing.md) · [위협 탐지 (GuardDuty)](../detection-response/detection/threat-detection-guardduty.md) · [지속적 모니터링](../detection-response/detection/continuous-monitoring.md) · [SIEM / Security Lake](../detection-response/detection/siem-security-lake.md) |

## Infrastructure protection

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 5** | **네트워크** 자원을 어떻게 보호하는가 | [VPC 보안](../infrastructure-network/vpc-security.md) · [네트워크 세분화](../infrastructure-network/network-segmentation.md) · [Edge/Perimeter (WAF/Shield)](../infrastructure-network/edge-perimeter-waf-shield.md) · [DDoS 방어](../infrastructure-network/ddos-protection.md) |
| **SEC 6** | **컴퓨트** 자원을 어떻게 보호하는가 | [컴퓨트·컨테이너 보안](../application-workload/appsec/compute-container-security.md) · [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md) · [EKS·쿠버네티스 보안](../application-workload/appsec/eks-kubernetes-security.md) · [서버리스 보안](../application-workload/appsec/serverless-security.md) |

## Data protection

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 7** | 데이터를 어떻게 **분류** 하는가 | [데이터 분류 & 탐지 (Macie)](../data-protection/data-classification-macie.md) |
| **SEC 8** | **저장** 데이터를 어떻게 보호하는가 | [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) · [시크릿 관리](../data-protection/secrets-management.md) · [Nitro Enclaves](../data-protection/nitro-enclaves-confidential-computing.md) |
| **SEC 9** | **전송** 데이터를 어떻게 보호하는가 | [전송 중 암호화](../data-protection/encryption-in-transit.md) · [PKI · X.509 · TLS](./pki-x509-tls.md) |

## Incident response

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 10** | 인시던트를 어떻게 예상·대응·복구하는가 | [IR 프레임워크](../detection-response/incident-response/ir-framework.md) · [AWS 포렌식](../detection-response/incident-response/forensics-on-aws.md) · [자동 대응 오케스트레이션](../detection-response/incident-response/automation-orchestration.md) · [랜섬웨어 방어](../resilience/ransomware-defense-architecture.md) · [격리 복구 환경](../resilience/isolated-recovery-environment.md) |

## Application security

| BP | 질문 | 정렬된 가이드 페이지 |
| --- | --- | --- |
| **SEC 11** | 개발 수명주기 전반에서 앱 보안 속성을 어떻게 검증하는가 | [DevSecOps](../application-workload/appsec/devsecops.md) · [공급망 보안 (SBOM)](../advanced/supply-chain-sbom.md) · [GenAI 보안 (OWASP LLM)](../application-workload/ai-ml/genai-security-owasp-llm.md) |

---

> [전체 보안 여정](../security-journey.md)에서 진단→설계→배포→증빙 흐름과 함께 보면 이 정렬을 실무에 적용하기 쉽습니다.
