---
title: "SIEM 연동 — Security Lake / OCSF / 3rd party"
sidebar_label: "SIEM 연동 — Security Lake / OCSF / 3rd party"
sidebar_position: 3
tags:
  - "탐지·대응"
---
# SIEM 통합 & Security Lake

:::info[한 줄 정의]
Security Lake가 멀티 계정·리전·소스의 보안 로그를 표준 스키마(**OCSF**) + 컬럼 포맷(**Parquet**)으로 정규화해 S3에 모으고, SIEM/분석 도구가 *벤더 종속 없이* 공통 포맷으로 소비한다.
:::

## 1. 왜 (문제)
로그는 소스마다 스키마가 제각각 → SIEM마다 별도 파서·정규화 비용. 멀티클라우드·하이브리드면 더 심함. "수집·정규화"와 "분석"을 분리하면 SIEM 교체·병행이 쉬워진다.

## 2. Amazon Security Lake
- **OCSF(Open Cybersecurity Schema Framework)**: 벤더 중립 보안 이벤트 스키마(AWS·Splunk·CrowdStrike 등 참여) → 정규화의 표준.
- **저장**: 리전별 S3 버킷에 **Apache Parquet**(컬럼 포맷, Athena/쿼리 효율)로.
- **네이티브 소스**: CloudTrail(management + data events), EKS 감사 로그, VPC Flow Logs, Route 53 Resolver query logs, Security Hub findings 등 — *자동 OCSF 변환*.
- **커스텀 소스**: 외부 로그도 OCSF+Parquet 규격을 맞추면 통합.
- **구독자(subscriber)**: SIEM·분석 도구가 데이터 접근(쿼리/조회) 권한을 받아 소비.

## 3. SIEM/분석 연동 옵션
- **3rd party SIEM**: Splunk, IBM QRadar, Microsoft Sentinel, Datadog 등이 OCSF/Security Lake 구독.
- **AWS 네이티브**: Athena(서버리스 SQL), OpenSearch(검색·대시보드), QuickSight(시각화).
- **CloudWatch Logs Insights**: 운영 로그 ad-hoc 질의.

## 4. 설계 통찰
- **수집(Security Lake) ↔ 분석(SIEM)** 분리 → SIEM 종속 완화, 수집 비용 단일화.
- 비용: 핫(즉시 분석) vs 콜드(장기 보존, Glacier) 계층화. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](./logging-auditing.md)
- 멀티클라우드/하이브리드 통합 가시성 → [멀티클라우드 & 하이브리드 보안](../../advanced/multi-cloud-hybrid.md)

## 5. 자주 받는 질문
- "이미 Splunk 써요" → Security Lake로 정규화 후 구독, 또는 직접 연동. 수집 단가 최적화.
- "로그가 계정·리전에 흩어져 가시성이 없다" → Security Lake 중앙화 + OCSF 단일 스키마.
- "SIEM을 바꾸고 싶은데 종속이 심하다" → OCSF로 추상화하면 교체·병행 용이.

## 관련
- [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](./logging-auditing.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](./threat-detection-guardduty.md) · [지속 모니터링 — Config Rules / Conformance Pack](./continuous-monitoring.md)

### References
- [Amazon Security Lake — OCSF](https://docs.aws.amazon.com/security-lake/latest/userguide/open-cybersecurity-schema-framework.html) · [What is Security Lake](https://docs.aws.amazon.com/security-lake/latest/userguide/what-is-security-lake.html)
- [OCSF 프로젝트](https://schema.ocsf.io/)

