---
title: "DevSecOps — CI/CD / SAST / DAST / IaC / SBOM"
sidebar_label: "DevSecOps — CI/CD / SAST / DAST / IaC / SBOM"
sidebar_position: 2
tags:
  - "워크로드"
---
# DevSecOps

:::info[보안을 파이프라인 좌측(shift-left)으로 당겨 코드/IaC/이미지 단계에서 자동 검증. "보안을 코드로".]
:::

## 파이프라인 단계별 보안 통제
| 단계 | 통제 | 도구/방법 |
| --- | --- | --- |
| 커밋 | 시크릿 스캔 | git-secrets, pre-commit → [시크릿 관리 — Secrets Manager / Parameter Store](../../data-protection/secrets-management.md) |
| 빌드 | **SAST**(정적분석), **SCA**(의존성) | CodeGuru, 의존성 스캐너 |
| 빌드 | **IaC 보안** | cfn-lint, checkov, tfsec, cdk-nag — 배포 전 정책 위반 차단 |
| 빌드 | **SBOM** + 이미지 서명 | Inspector SBOM, AWS Signer → [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md) |
| 배포 전 | **Policy as Code** 가드레일 | OPA / Cedar |
| 스테이징 | **DAST**(실행 동적분석) | 동적 스캐너 |
| 운영 | 런타임 모니터링(shift-right) | GuardDuty, Inspector |

## 파이프라인 자체 보안
- **키리스 배포**: GitHub Actions → IAM OIDC로 장기 키 제거. → [ID 페더레이션 — Identity Center / SAML / OIDC](../../identity-access/identity-federation.md)
- CodePipeline/CodeBuild 역할 **최소 권한**, 아티팩트 **무결성**(서명·해시) 보장.

## 핵심 통찰
- shift-left(빌드 시 차단) + shift-right(런타임 모니터링) 둘 다.
- 키리스 CI/CD(GitHub Actions → IAM OIDC) → 장기 키 제거. → [ID 페더레이션 — Identity Center / SAML / OIDC](../../identity-access/identity-federation.md)

## 자주 받는 질문
- "배포 빨리해야 하는데 보안이 발목" → 자동 게이트(통과 기준 명확)로 *속도와 보안 동시*.

## 관련
- [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](./compute-container-security.md) · [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md) · [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](../../detection-response/incident-response/automation-orchestration.md)

