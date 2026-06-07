---
title: Service Screener v2
sidebar_label: Service Screener v2
sidebar_position: 3
tags:
  - 거버넌스
---

# Service Screener v2

> **한 줄 요약** — AWS 환경을 **Well-Architected 베스트 프랙티스** 기준으로 다중 서비스 스캔하여, 개선 권고와 프레임워크 준수 현황을 **HTML 리포트**로 생성하는 오픈소스 가이드 도구입니다.

:::info 개요
여러 AWS 서비스 구성을 한 번에 점검하고, Trusted Advisor 데이터·프레임워크 준수 시각화를 포함한 리포트를 만듭니다. 병렬 스캔으로 빠르며, 최신 버전은 Cloudscape 기반 UI(차트·필터)를 제공합니다. 오픈소스: [`aws-samples/service-screener-v2`](https://github.com/aws-samples/service-screener-v2)
:::

:::warning 리포트 취급
생성된 리포트는 **로컬에서만** 열람해야 하며 **인터넷에 공개하면 안 됩니다**(계정 구성 정보 포함).
:::

## 관련 보안 영역 (Alignment)

- WAF [SEC 1 · 보안 기초](../foundations/well-architected-alignment.md#security-foundations) — Well-Architected 기준 점검
- [Well-Architected 보안 기둥](../foundations/well-architected-security-pillar.md) — 도구가 따르는 기준
- 교차 점검: [SRA Verify](./sra-verify.md) · [ASA(Prowler)](./aws-security-assessment.md)

## 주요 기능
| 기능 | 내용 |
| --- | --- |
| 다중 서비스 스캔 | 여러 AWS 서비스를 Well-Architected 기준으로 점검 |
| 병렬 실행 | 동시 모드로 빠른 점검(`--sequential` 로 비활성) |
| Trusted Advisor 통합 | TA 데이터 기반 권고 |
| 프레임워크 준수 | 프레임워크별 준수 현황 시각화 |
| 리포트 | 자체 완결형 HTML(차트·필터, Cloudscape UI) |

## 실행
```bash
# Python 환경에서 실행 → HTML 리포트 생성 (로컬 열람)
# 설치/옵션은 저장소 README 참조. 예: 베타 UI 활성화
screener --beta 1
```
> 📦 **에셋**: [Service Screener v2 (GitHub)](https://github.com/aws-samples/service-screener-v2) — CLI + HTML 리포트.

## 핵심 고려사항
- *시점 평가*이며, 권고는 Well-Architected 관점 — 지속 점검은 Security Hub로 보강.
- 리포트는 계정 정보를 포함하므로 **접근 통제**(로컬/사내 한정).
- SRA Verify(SRA)·ASA(Prowler)와 기준이 달라 **교차 점검**에 유용.

## 참고자료
- [Service Screener v2 (GitHub)](https://github.com/aws-samples/service-screener-v2) · [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)
