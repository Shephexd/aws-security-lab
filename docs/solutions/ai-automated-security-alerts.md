---
title: AI 자동화 보안 알림
sidebar_label: AI 자동화 보안 알림 (출시 예정)
sidebar_position: 4
---

# AI 자동화 보안 알림 (AI Automated Security Alerts)

> **한 줄 요약** — GuardDuty·Security Hub 등에서 발생한 보안 이벤트를 **AI로 분류·요약·우선순위화**하여, 운영팀이 실제로 행동해야 할 알림만 받도록 합니다.

:::info 개요
보안 이벤트는 많지만 사람이 다 보기 어렵습니다. 이 솔루션은 탐지 신호를 AI로 가공해 노이즈를 줄이고, 핵심 알림을 요약·라우팅합니다.
:::

:::note 출시 예정
이 솔루션 패키지는 준비 중입니다. 아래는 예상 구성이며, 배포 에셋과 함께 정식 공개될 예정입니다.
:::

## 관련 보안 영역 (Alignment)

- [Part 6 · 탐지 & 대응 → 위협 탐지 (GuardDuty)](../detection-response/detection/threat-detection-guardduty.md)
- [Part 6 · 탐지 & 대응 → SIEM / Security Lake](../detection-response/detection/siem-security-lake.md)
- [Part 6 · 탐지 & 대응 → 자동 대응 오케스트레이션](../detection-response/incident-response/automation-orchestration.md)

## 아키텍처

```
(GuardDuty/Security Hub) → EventBridge → (AI 분류·요약) → 알림 채널(Slack/Email)
```

## 사전 요구사항 (Prerequisites)

- [ ] GuardDuty / Security Hub 활성화
- [ ] 알림 채널 (예: Slack, SNS)

## 배포 (Deployment)

> 📦 **배포 에셋**: *IaC/스크립트 저장소 링크를 연결하세요.*

## 자주 묻는 질문 (FAQ)

*작성 예정*

## 고객 배포 체크리스트

- [ ] *작성 예정*
