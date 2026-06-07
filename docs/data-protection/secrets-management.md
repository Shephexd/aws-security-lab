---
title: "시크릿 관리 — Secrets Manager / Parameter Store"
sidebar_label: "시크릿 관리 — Secrets Manager / Parameter Store"
sidebar_position: 6
tags:
  - "데이터보호"
---
# 시크릿 관리

:::info[한 줄 정의]
비밀번호·API 키·DB 자격은 코드/환경변수가 아니라 **전용 저장소 + 자동 로테이션 + 최소권한 접근**으로. 궁극은 [단기 자격(역할/OIDC)](../identity-access/iam-core.md)로 *시크릿 자체를 줄이는* 것.
:::

## 1. Secrets Manager vs Parameter Store (선택 기준)
| | **Secrets Manager** | **SSM Parameter Store** |
|---|---|---|
| 자동 로테이션 | **네이티브**(RDS/Redshift/DocumentDB), 기타 Lambda 로테이션 | ❌ (직접 구현) |
| 암호화 | KMS | SecureString(KMS) |
| 교차계정/리소스 정책 | ✅ | 제한적 |
| 복제(멀티리전) | ✅ | ❌ |
| 비용 | 시크릿당 과금 | **표준 무료**(advanced 유료) |
| 용도 | 로테이션·교차계정 필요한 *비밀* | 설정값·간단 시크릿 저렴하게 |

> 가이드: 로테이션/교차계정/복제 필요 → Secrets Manager. 단순 구성값·저비용 → Parameter Store. 둘 다 KMS로 암호화.

## 2. 자동 로테이션
- RDS류는 Secrets Manager가 *암호 변경 + 시크릿 갱신* 을 자동 수행 → 유출 시 피해 창 최소화.
- 애플리케이션은 시크릿을 캐싱하되 만료 시 재조회(로테이션 반영).

## 3. 애플리케이션 접근 패턴
- IAM 최소권한으로 *그 시크릿만* 읽기, 절대 로그/환경변수/이미지에 평문 노출 금지.
- **EKS**: External Secrets Operator, Secrets Store CSI Driver. → [EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy](../application-workload/appsec/eks-kubernetes-security.md)
- Lambda: 확장(extension)으로 캐싱.

## 4. 시크릿 유출 방지 (DevSecOps)
- 깃 커밋 사고 방지: pre-commit 스캐너(git-secrets), 파이프라인 시크릿 스캔. → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md)
- 유출 시 핵심은 **즉시 로테이션** → 장기 키 대신 단기 자격 지향.

## 5. 자주 받는 질문
- "DB 비번이 코드에 박혀 있어요" → Secrets Manager + 자동 로테이션 + IRSA/실행역할.
- "키가 깃허브에 노출" → 즉시 로테이션 + 스캐너 도입 + 근본적으로 OIDC/Roles Anywhere로 키 제거. → [IAM 핵심 — User/Group/Role/Policy](../identity-access/iam-core.md)

## 관련
- [KMS & Envelope Encryption](./kms-envelope-encryption.md) · [IAM 핵심 — User/Group/Role/Policy](../identity-access/iam-core.md) · [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md)

### References
- AWS — [Secrets Manager 로테이션](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html) · SSM Parameter Store(SecureString) 문서

