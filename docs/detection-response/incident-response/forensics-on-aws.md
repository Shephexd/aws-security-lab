---
title: "AWS 포렌식 — 격리 / 스냅샷 / 타임라인"
sidebar_label: "AWS 포렌식 — 격리 / 스냅샷 / 타임라인"
sidebar_position: 2
tags:
  - "탐지·대응"
---
# AWS 포렌식

:::info[증거를 훼손하지 않고 보존하면서 격리한다. 순서가 중요: 격리 → 증거 보존 → 분석.]
:::

## 침해 인스턴스 대응 순서
1. **격리**: 보안그룹을 격리 SG로 교체(모든 트래픽 차단, 세션은 유지), Auto Scaling에서 분리.
2. **증거 보존**: EBS **스냅샷**(디스크), **메모리 덤프**(SSM/도구), 인스턴스 메타데이터 기록.
3. **자격 무효화**: 인스턴스 역할 자격 회수/정책 차단(추가 lateral movement 차단).
4. **분석**: 포렌식 전용 계정에서 스냅샷을 마운트해 분석(원본 격리 유지).
5. **타임라인**: **CloudTrail** + Flow Logs + Detective로 시간순 재구성.

## 핵심 기법
| 항목 | 내용 |
| --- | --- |
| 격리 패턴 | 격리 SG / 격리 NACL로 교체, 자동 격리(EventBridge + Lambda) |
| 스냅샷 공유 | EBS 스냅샷을 별도 포렌식 계정으로 공유 — **KMS 키 공유 권한** 주의 |
| 증거 보관 | 메모리 수집 도구, 디스크 이미지의 **chain-of-custody**(보관 연속성) 기록 |
| 범위 분석 | **Amazon Detective**로 범위·근본원인 추적 |
| 컨테이너 | EKS 노드/파드 포렌식(노드 격리, 파드 스냅샷) |

## 자주 받는 질문
- "감염 인스턴스 그냥 종료하면?" → 메모리/증거 소실. 격리 후 보존이 먼저.
- 자동 격리 vs 수동 승인 트레이드오프(오탐 시 서비스 영향).

## 관련
- [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](./automation-orchestration.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection/threat-detection-guardduty.md) · [IMDSv2 & SSRF 방어](../../infrastructure-network/imdsv2-ssrf-defense.md)

