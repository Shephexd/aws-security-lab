---
title: 솔루션 패키지
sidebar_label: 개요
sidebar_position: 0
---

# 솔루션 패키지 (Solutions)

기초 보안 지식을 **운영 환경에서 바로 배포 가능한 패키지**로 연결합니다.
각 솔루션은 아키텍처·배포(IaC)·비용·체크리스트를 포함하며, 구현하는 **보안 영역(지식베이스 Part)** 과 정렬(alignment)되어 있습니다.

:::info 기초 가이드와의 관계
[지식베이스](/)가 *왜 그렇게 설계하는가(원리)* 를 다룬다면, 솔루션 패키지는 *그 원리를 어떻게 운영 환경에 배포하는가* 를 다룹니다.
각 솔루션의 **관련 보안 영역** 에서 해당 Part로 연결됩니다.
:::

## 카탈로그

| 솔루션 | 무엇을 해결하나 | 관련 보안 영역 |
| --- | --- | --- |
| [AWS SRA 진단 (SRA Verify)](./sra-verify.md) | 조직 전 계정을 AWS 보안 모범사례(SRA) 기준으로 자동 진단 → 갭·조치 가이드 | 거버넌스 · 탐지·대응 · 기초 |
| [AppSec 보안 에이전트](./appsec-security-agent.md) | 설계·코드·침투 테스트를 에이전트로 자동화(설계→배포 전반) | 워크로드 · 기초 |
| [AWS 리소스 시각화](./aws-resource-visualization.md) | AWS Config 데이터를 SQL로 질의·대시보드화 → 자산 인벤토리/컴플라이언스 가시성 | 탐지·모니터링 · 거버넌스 |
| [AI 자동화 보안 알림](./ai-automated-security-alerts.md) *(출시 예정)* | 보안 이벤트를 AI로 분류·요약·알림 → 운영 부하 감소 | 탐지·대응 |
| [Claude Code 프라이빗 네트워킹](./claude-code-private-networking.md) *(출시 예정)* | Claude Code를 사설망 경로로 안전하게 연결 | 인프라·네트워크 |

> 위 솔루션은 배포 에셋(CloudFormation/IaC/스크립트)과 함께 제공됩니다. 실제 에셋 링크는 각 솔루션 페이지의 *배포* 섹션을 참조하세요.

> 각 솔루션은 관련 보안 영역(Alignment)에서 해당 지식베이스 Part로 연결됩니다. 진단부터 시작하려면 → [자주 겪는 보안 문제](../common-problems.md).
