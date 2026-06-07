---
title: "위협 탐지 — GuardDuty / Inspector / Security Hub / Detective"
sidebar_label: "위협 탐지 — GuardDuty / Inspector / Security Hub / Detective"
sidebar_position: 4
tags:
  - "탐지·대응"
---
# 위협 탐지

:::info[한 줄 정의]
GuardDuty(위협 *행위* 탐지), Inspector(*취약점* 스캔), Security Hub(통합·표준 점수), Detective(조사). 역할이 다르고 **함께** 쓴다. 핵심 통찰: 탐지는 [로그](./logging-auditing.md)를 입력으로 하고, finding은 [자동 대응](../incident-response/automation-orchestration.md)의 트리거가 된다.
:::

## 1. 서비스 역할 구분 (자주 혼동)
| 서비스 | 무엇을 | 입력 |
|---|---|---|
| **GuardDuty** | *위협 행위* 탐지(ML+위협인텔) | 로그(에이전트 거의 불필요) |
| **Inspector** | *취약점(CVE)*·취약 패키지 자동 스캔 | EC2/ECR/Lambda |
| **Security Hub (CSPM)** | finding 통합 + 보안 표준 준수 점수 | 위 서비스들 + 파트너 |
| **Detective** | finding의 *근본 원인·범위* 그래프 조사 | CloudTrail/VPC/GuardDuty |
| **Macie** | S3 민감 데이터 발견 | S3 → [데이터 분류 & 탐지 — Macie](../../data-protection/data-classification-macie.md) |

## 2. GuardDuty — Protection Plans
기본(Foundational)은 CloudTrail·VPC Flow·DNS 로그를 분석. 워크로드에 따라 보호 플랜을 *추가*한다.

| Plan | 대상/탐지 |
|---|---|
| **Foundational** | 계정/네트워크 이상(비정상 API, 악성 IP, 정찰) — 기본 |
| **S3 Protection** | S3 객체 API 이상(ListBucket→비정상 위치 GetObject 등) |
| **EKS Protection** | EKS 감사 로그(컨트롤 플레인) 위협 |
| **Runtime Monitoring** | EC2/EKS/ECS-Fargate **런타임**(프로세스·파일·네트워크, OS레벨) |
| **Malware Protection** | EC2의 EBS 볼륨 스캔 + **S3 업로드 객체 스캔** |
| **RDS Protection** | Aurora/RDS 로그인 이상(자격 침해) |
| **Lambda Protection** | 함수의 이상 네트워크(크립토마이닝/C2) |

- **Extended Threat Detection**: 개별 finding을 *공격 시퀀스(attack sequence)* 로 상관분석 → 다단계 공격을 하나의 고신뢰 finding으로.
- **Finding**: 유형(예: `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration`, `CryptoCurrency:EC2/BitcoinTool.B`), 심각도(Low/Med/High), ATT&CK 전술 라벨 포함. → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../../foundations/threat-modeling-attack.md)

## 3. Inspector — 취약점 관리
- EC2/ECR(컨테이너 이미지)/Lambda를 **지속 스캔**, CVE + 네트워크 도달성으로 위험 점수.
- ECR 푸시 시 자동 스캔 → [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](../../application-workload/appsec/compute-container-security.md)

## 4. Security Hub (CSPM) — 통합 & 표준
- **ASFF(AWS Security Finding Format)**: 모든 소스 finding을 단일 포맷으로 정규화 → 멀티 소스 관리 부담 제거.
- 지원 **보안 표준**: **FSBP**(AWS Foundational Security Best Practices), **CIS AWS Foundations Benchmark**(v1.2/1.4/3.0/**5.0**), **PCI DSS**, **NIST SP 800-53 Rev.5**.
- 컨트롤별 PASS/FAIL + 보안 점수 → 규정 준수 대시보드. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](../../governance-compliance/aws-compliance-services.md)
- (참고) 위협 중심의 신형 통합 기능과 CSPM(자세 점검)을 구분해 설명.

## 5. Detective — 조사
- GuardDuty finding을 시작점으로 *언제부터·어디까지·어떻게* 를 그래프로 시각화 → 범위 산정(scoping). → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](../incident-response/forensics-on-aws.md)

## 6. 운영 패턴
- **위임 관리자 + 조직 전체 자동 활성화**(신규 계정 포함) — Security Tooling 계정에 집중.
- finding → **EventBridge → Lambda/SSM 자동 대응**(격리/알림). → [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](../incident-response/automation-orchestration.md)
- 노이즈 관리: suppression rule, 심각도 기반 우선순위, Security Hub 집계.

## 7. 자주 받는 질문
- "GuardDuty 알림 폭주" → suppression + Security Hub 집계 + 고신뢰(Extended Threat Detection) 우선.
- "에이전트 설치 부담?" → GuardDuty 기본은 로그 기반(에이전트 불필요), 런타임만 에이전트.
- 대표 finding: IMDS 자격 탈취, 크립토마이닝, 비정상 API, S3 유출 → [IMDSv2 & SSRF 방어](../../infrastructure-network/imdsv2-ssrf-defense.md)

## 관련
- [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](./logging-auditing.md) · [지속 모니터링 — Config Rules / Conformance Pack](./continuous-monitoring.md) · [SIEM 연동 — Security Lake / OCSF / 3rd party](./siem-security-lake.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../../foundations/threat-modeling-attack.md)

### References
- [Amazon GuardDuty — protection plans & Extended Threat Detection](https://aws.amazon.com/blogs/security/navigating-amazon-guardduty-protection-plans-and-extended-threat-detection/) · [GuardDuty 문서](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html)
- [Security Hub CSPM — standards reference (FSBP/CIS/PCI/NIST)](https://docs.aws.amazon.com/securityhub/latest/userguide/standards-reference.html) · [ASFF](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-findings-format.html)
- Amazon Inspector, Amazon Detective 문서

