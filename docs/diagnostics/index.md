---
title: 진단도구
sidebar_label: 개요
sidebar_position: 0
---

# 진단도구 (Assessment Tools)

**지금 내 AWS 환경이 어떤 상태인가**를 점검하는 도구 모음입니다. 보안 여정의 **① 진단** 단계 — 무엇을 고쳐야 할지(갭)부터 파악합니다.

:::info 진단도구 vs 솔루션
- **진단도구** = *현재 상태 점검* — 계정/구성을 스캔해 갭·위험을 보고. (이 페이지)
- **[솔루션](../solutions/index.md)** = *보안 역량 배포* — 운영 환경에 통제를 구현.

진단으로 갭을 찾고 → 솔루션/가이던스로 해결하는 흐름입니다. → [보안 여정](../security-journey.md)
:::

## 카탈로그

| 도구 | 기준 | 무엇을 점검하나 | 형태 |
| --- | --- | --- | --- |
| [AWS SRA 진단 (SRA Verify)](./sra-verify.md) | **AWS SRA** | 조직 전 계정의 보안 서비스 구성이 SRA에 부합하는지 | CodeBuild/로컬, CSV·대시보드 |
| [AWS Security Assessment (ASA / SATv2)](./aws-security-assessment.md) | **Prowler** | 베스트 프랙티스 기준 점검(수백 개 체크) | CloudFormation, 대시보드 |
| [Service Screener v2](./service-screener.md) | **Well-Architected** | 다중 서비스 구성 + Trusted Advisor + 프레임워크 준수 | CLI, HTML 리포트 |
| [AWS 리소스 시각화](./aws-resource-visualization.md) | **AWS Config** | 자산 인벤토리·구성 가시성(SQL·대시보드) | CloudFormation |

## 어떤 도구를 언제

- **SRA 정렬 여부**가 궁금하다 → **SRA Verify** (관리/감사/로그 계정 역할까지 점검)
- **빠른 종합 점검·리포트**가 필요하다 → **ASA(Prowler)** 또는 **Service Screener**
- **자산이 무엇이 떠 있는지**부터 봐야 한다 → **리소스 시각화**
- 셋은 **상호 보완적**입니다 — 기준(SRA·Prowler·Well-Architected)이 달라 교차 점검하면 사각지대를 줄입니다. 지속 점검은 **Security Hub 표준**으로 보강하세요.

> 진단 결과 → 우선순위화 → [솔루션](../solutions/index.md)/가이던스로 해결 → 재진단의 루프로 운영하세요.
