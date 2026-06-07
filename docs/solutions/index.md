---
title: 솔루션 패키지
sidebar_label: 개요
sidebar_position: 0
---

# 솔루션 패키지 (Solutions)

기초 보안 지식을 **운영 환경에서 바로 배포 가능한 패키지**로 연결합니다.
각 솔루션은 아키텍처·배포(IaC)·비용·체크리스트를 포함하며, 구현하는 **보안 영역(지식베이스 Part)** 과 정렬(alignment)되어 있습니다.

:::info 진단도구 vs 솔루션
- **[진단도구](../diagnostics/index.md)** = *현재 상태 점검*(SRA Verify·ASA·Service Screener·리소스 시각화).
- **솔루션** = *보안 역량 배포* — 운영 환경에 통제를 구현(이 페이지).

진단으로 갭을 찾고 → 솔루션/가이던스로 해결하세요.
:::

## 카탈로그

각 솔루션은 아키텍처·배포(IaC)·비용·체크리스트를 포함하며, 구현하는 **보안 영역(지식베이스 Part)** 과 정렬됩니다.

| 솔루션 | 무엇을 해결하나 | 관련 보안 영역 |
| --- | --- | --- |
| [AppSec 보안 에이전트](./appsec-security-agent.md) | 설계·코드·침투 테스트를 에이전트로 자동화(설계→배포 전반) | 워크로드 · 기초 |
| [SIEM on OpenSearch](./siem-opensearch.md) | 다계정 로그를 수집·상관분석·시각화 → 인시던트 조사 | 탐지·대응 |
| [Claude Code on Bedrock](./claude-code-bedrock.md) | Claude Code/Cowork를 Bedrock+기존 IdP로 키리스 엔터프라이즈 배포 | 자격증명 · 거버넌스 |
| [AI 자동화 보안 알림](./ai-automated-security-alerts.md) *(출시 예정)* | 보안 이벤트를 AI로 분류·요약·알림 → 운영 부하 감소 | 탐지·대응 |

> 진단부터 시작하려면 → [진단도구](../diagnostics/index.md) · [자주 겪는 보안 문제](../common-problems.md).
