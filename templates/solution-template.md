---
title: <솔루션 이름>
sidebar_label: <짧은 이름>
sidebar_position: <순번>
---

{/*
  새 솔루션 추가 방법:
  1. 이 파일을 content-overrides/solutions/<solution-slug>.md 로 복사
  2. 아래 섹션을 채우고, "관련 보안 영역"에서 해당 지식베이스 Part로 링크
  3. content-overrides/solutions/index.md 카탈로그에 한 줄 추가
  4. npm run sync && npm run build
*/}

# <솔루션 이름>

> **한 줄 요약** — 무엇을, 누구를 위해, 어떤 운영 문제를 해결하는가.

:::info 개요
이 솔루션이 제공하는 가치와 적용 시나리오를 2~3문장으로 설명합니다.
:::

## 관련 보안 영역 (Alignment)

이 솔루션이 구현·강화하는 지식베이스 영역입니다.

- [Part N · ...](../<part-slug>/index.md) — 어떤 통제를 운영 수준으로 구현하는지
- [관련 세부 문서](../<part-slug>/<doc>.md) — 배경 원리

## 아키텍처

```
(아키텍처 다이어그램 또는 구성도)
```

**핵심 구성요소**

| 구성요소 | 역할 |
| --- | --- |
| ... | ... |

## 사전 요구사항 (Prerequisites)

- [ ] ...
- [ ] ...

## 배포 (Deployment)

### 단일 계정

```bash
# 배포 명령 / CloudFormation 스택 / IaC 링크
```

### 멀티 계정 (선택)

```bash
# source-account 템플릿 등
```

> 📦 **배포 에셋**: <CloudFormation/Terraform/스크립트 저장소 또는 다운로드 링크>

## 비용 (Cost)

| 시나리오 | 월 예상 비용 |
| --- | --- |
| ... | ... |

## 자주 묻는 질문 (FAQ)

**Q. ...?**
A. ...

## 리소스 정리 (Cleanup)

```bash
# 정리 스크립트 / 스택 삭제
```

## 고객 배포 체크리스트

- [ ] ...

## 참고자료

- [AWS 문서 링크](...)
