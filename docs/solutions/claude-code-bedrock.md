---
title: Claude Code on Amazon Bedrock (엔터프라이즈 배포)
sidebar_label: Claude Code on Bedrock
sidebar_position: 5
tags:
  - 자격증명
  - 거버넌스
---

# Claude Code on Amazon Bedrock — 엔터프라이즈 배포

> **한 줄 요약** — Claude Code(CLI)와 Claude Cowork(Desktop)를 **Amazon Bedrock + 기존 IdP**로 조직 전반에 안전하게 배포합니다. **API 키 배포 없이** 중앙 접근통제·감사·사용량 모니터링을 갖춘 키리스 방식입니다.

:::info 개요
한 번 배포하면 Claude Code CLI와 Claude Cowork Desktop을 모두 사용할 수 있고, 기존 OIDC IdP(Okta·Microsoft Entra·Auth0 등) 또는 IAM Identity Center로 로그인합니다. 장기 자격증명(API 키) 배포·교체가 사라지고, 사용은 AWS 계약 기준 종량제로 청구됩니다. 가이던스: [`guidance-for-claude-code-with-amazon-bedrock`](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock)
:::

## 관련 보안 영역 (Alignment)

- [Part 2 · ID 페더레이션](../identity-access/identity-federation.md) — 기존 IdP/IAM Identity Center 연동, 키리스 인증
- [Part 2 · IAM 핵심](../identity-access/iam-core.md) — 단기 자격증명·최소권한
- [Part 8 · 거버넌스 & 컴플라이언스](../governance-compliance/index.md) — 중앙 접근통제·감사
- WAF [SEC 2 · ID 관리](../foundations/well-architected-alignment.md#identity-and-access-management)

## 핵심 가치

| 관점 | 내용 |
| --- | --- |
| **조직** | 기존 OIDC IdP / IAM Identity Center 연동, 중앙 접근통제, **API 키 관리 불필요**, 리전·파티션(GovCloud 포함) 제어 |
| **감사/비용** | CloudWatch 대시보드로 사용량·비용 추적, AWS 계약 종량 청구(별도 시트 라이선스 불필요) |
| **사용자** | 회사 자격증명으로 로그인, 자동 토큰 갱신, Windows/macOS/Linux 지원 |
| **배포** | MDM(Jamf·Intune·Group Policy)로 `.mobileconfig`/`.reg` 배포, CLI·Desktop 동시 지원 |

## 아키텍처

```mermaid
flowchart LR
  U["사용자 (회사 자격증명)"] --> IDP["기존 IdP / IAM Identity Center"]
  IDP --> CH["자격증명 헬퍼 (단기 토큰)"]
  CH --> BR["Amazon Bedrock (Claude)"]
  CH -. 사용량/비용 .-> CW["CloudWatch 대시보드"]
```

## 사전 요구사항
- [ ] Amazon Bedrock에서 Claude 모델 액세스 활성화
- [ ] 기존 OIDC IdP 또는 IAM Identity Center
- [ ] 배포 리전/파티션(Commercial 또는 GovCloud) 결정

## 배포
```bash
# 조직 1회 배포로 Claude Code CLI + Cowork Desktop 활성화
# IaC/배포 절차는 가이던스 저장소의 Quick Start 참조
```
> 📦 **배포 에셋**: [Guidance for Claude Code on Amazon Bedrock (GitHub)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock) — IaC + 자격증명 헬퍼.

## 핵심 고려사항
- **키리스가 핵심 가치**: 장기 API 키를 없애 유출·교체 리스크를 제거 → [[identity-federation]] 원칙과 정렬.
- 리전·파티션 제어로 데이터 주권/규제(예: GovCloud, 국내 리전) 요구를 충족.
- 사용량 대시보드로 비용·접근을 거버넌스 관점에서 상시 점검.

## 참고자료
- [Guidance for Claude Code on Amazon Bedrock (GitHub)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock)
- [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/) · [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
