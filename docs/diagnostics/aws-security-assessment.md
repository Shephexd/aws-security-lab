---
title: AWS Security Assessment (ASA / SATv2)
sidebar_label: AWS Security Assessment (Prowler)
sidebar_position: 2
tags:
  - 거버넌스
---

# AWS Security Assessment Solution (SATv2)

> **한 줄 요약** — 오픈소스 **[Prowler](https://github.com/prowler-cloud/prowler)** 기반으로 AWS 계정을 **시점(point-in-time) 보안 평가**하여 위험 영역을 빠르게 식별하는, 저비용·빠른 배포 솔루션입니다.

:::info 개요
빠르게 클라우드로 이전했지만 GuardDuty·Security Hub·Config 등 권장 서비스를 아직 갖추지 못한 환경에서, **신속한 보안 평가 리포트**가 필요할 때 적합합니다. Prowler가 AWS 베스트 프랙티스 기준 수백 개 체크를 수행하고 SATv2 대시보드로 시각화합니다. 오픈소스: [`awslabs/aws-security-assessment-solution`](https://github.com/awslabs/aws-security-assessment-solution)
:::

:::note Prowler 고지
Prowler는 AWS 소유 솔루션이 아닙니다. 실행 전 독립적으로 검토하고, 의존성을 최신으로 유지하세요. (본 솔루션은 pip 최신 버전을 설치)
:::

## 관련 보안 영역 (Alignment)

- WAF [SEC 1 · 보안 기초](../foundations/well-architected-alignment.md#security-foundations) — 베스트 프랙티스 대비 태세 측정
- [거버넌스 & 컴플라이언스](../governance-compliance/index.md) — 평가 리포트를 통제 근거로
- 다른 진단과 교차: [SRA Verify](./sra-verify.md)(SRA 기준) · [Service Screener](./service-screener.md)(WA 기준)

## SRA Verify와의 차이
| | 기준 | 강점 |
| --- | --- | --- |
| **SRA Verify** | AWS SRA | 계정 유형(관리/감사/로그)별 SRA 정렬 점검 |
| **ASA(SATv2)** | Prowler 베스트 프랙티스 | 광범위한 체크·빠른 1회성 리포트 |

## 배포
- **단일 계정**: CloudShell 또는 콘솔에서 CloudFormation 스택 배포 → 스캔 → 대시보드.
- **다계정**: ① 멤버 역할 배포 → ② 위임 관리자 활성화 → ③ SATv2 솔루션 배포.

```bash
# 예: CloudShell에서 단일 계정 스캔 (자세한 파라미터는 저장소 README)
# CloudFormation 템플릿으로 Prowler 실행 → 결과를 S3/대시보드로 확인
```
> 📦 **배포 에셋**: [AWS Security Assessment Solution (GitHub)](https://github.com/awslabs/aws-security-assessment-solution) — CloudFormation + SATv2/Prowler 대시보드.

## 결과 확인
- **SATv2 Dashboard**(권장) 또는 **Prowler Dashboard**로 발견사항 검토.
- Security Hub로 결과를 통합하거나, 지속 점검은 **Security Hub FSBP 표준** 활성화로 보강.

## 핵심 고려사항
- *시점 평가*입니다 — 지속 모니터링은 Security Hub/Config로 이어가세요.
- Prowler 버전·의존성을 최신으로 유지(보안·정확도).
- 발견사항을 [위협 모델링](../foundations/threat-modeling-attack.md)·중요도로 우선순위화해 조치.

## 참고자료
- [AWS Security Assessment Solution (GitHub)](https://github.com/awslabs/aws-security-assessment-solution) · [Prowler](https://github.com/prowler-cloud/prowler)
- [Security Hub FSBP 표준](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp.html)
