---
title: AppSec 보안 에이전트 (AWS Security Agent)
sidebar_label: AppSec 보안 에이전트
sidebar_position: 2
tags:
  - 워크로드
---

# AppSec 보안 에이전트 — AWS Security Agent

> **한 줄 요약** — 설계부터 배포까지 애플리케이션 개발 수명주기 전반에서 **설계 리뷰·코드 리뷰·침투 테스트**를 자동 수행하는 에이전트형(AI) 보안 서비스입니다. (Preview)

:::info 개요
[AWS Security Agent](https://aws.amazon.com/ko/blogs/korea/new-aws-security-agent-secures-applications-proactively-from-design-to-deployment-preview/)는 조직이 정의한 보안 요구사항에 맞춰 애플리케이션을 *선제적으로* 점검합니다. 일반적인 보안 가이드가 아니라 **조직 고유 정책 기준**으로 평가해, 수동 리뷰 병목을 줄입니다.
:::

:::warning Preview
프리뷰 단계 서비스입니다. 리전·가용성·세부 기능은 변동될 수 있으니 최신 공지를 확인하세요.
:::

## 관련 보안 영역 (Alignment)

- [Part 1 · 위협 모델링](../foundations/threat-modeling-attack.md) — 설계 단계 위협 식별
- [Part 5 · DevSecOps](../application-workload/appsec/devsecops.md) — 파이프라인 내 보안 자동화
- [Part 5 · 공급망 보안 (SBOM)](../advanced/supply-chain-sbom.md) — 코드·의존성 무결성
- WAF [SEC 11 · 애플리케이션 보안](../foundations/well-architected-alignment.md)

## 세 가지 기능 (설계 → 코드 → 배포)

| 단계 | 기능 | 무엇을 하나 |
| --- | --- | --- |
| **설계** | 설계 리뷰 | 아키텍처 문서·제품 사양을 코딩 전에 분석해 조직 요구사항 대비 보안 리스크 식별 |
| **코드** | 코드 리뷰 | GitHub Pull Request를 검사 — SQL 인젝션·XSS 등 취약점 + **정책 위반**(예: 정책은 90일인데 감사 로그 365일 보존) 탐지 |
| **배포** | 침투 테스트 | 소스코드·API 사양·비즈니스 문서를 학습해 **다단계 공격 시나리오**를 실행, 응답에 따라 공격 전략을 동적으로 조정 |

## 동작 방식

- **GitHub 저장소 연동**으로 PR 코드 리뷰 자동화
- 애플리케이션/프로젝트별 **격리된 에이전트 공간(컨테이너)** 에서 동작
- **IAM 및 SSO** 접근 관리 지원
- AWS가 산업 표준 기반 **기본 요구사항**을 관리하고, 팀이 **조직 고유 정책**을 추가 → 세 가지 리뷰 모두에 일관 적용

## 핵심 고려사항

- **조직 요구사항 정의가 핵심**: 일반 가이드가 아닌 *우리 정책* 기준 평가이므로, 정책(보존기간·암호화·접근 등)을 명확히 정의할수록 정확도가 올라갑니다.
- 기존 SAST/DAST·코드 리뷰를 대체가 아니라 **보강**하는 관점으로 도입 → 사람 리뷰 병목 감소.
- 침투 테스트는 비즈니스 문서까지 학습하므로 **민감 정보 취급 범위**를 사전 합의하세요.

## 다른 솔루션과의 관계

- **SRA Verify**가 *계정/인프라 구성*을 진단한다면, **AppSec 보안 에이전트**는 *애플리케이션 코드·설계*를 진단합니다. 둘은 상호 보완적입니다. → [SRA Verify](../diagnostics/sra-verify.md)

## 참고자료

- [AWS Security Agent 발표 블로그(한국어)](https://aws.amazon.com/ko/blogs/korea/new-aws-security-agent-secures-applications-proactively-from-design-to-deployment-preview/)
