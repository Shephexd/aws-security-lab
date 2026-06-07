---
title: "EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy"
sidebar_label: "EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy"
sidebar_position: 3
tags:
  - "워크로드"
---
# EKS / Kubernetes 보안

:::info[한 줄 정의]
EKS는 **K8s 자체 RBAC**와 **AWS IAM** 두 개의 인가 평면을 동시에 가진다. 파드에 IAM 권한을 최소로 부여하는 IRSA/Pod Identity, 파드 간 트래픽을 통제하는 Network Policy, 위험 파드를 막는 Pod Security Standards가 세 기둥이다.
:::

## 1. 왜 중요한가
Kubernetes는 *클러스터 안의* 인가(RBAC)와 *AWS 리소스에 대한* 인가(IAM)를 별개로 다룬다. 이 두 평면의 일관성이 무너지면 권한 구멍이 생긴다. 또한 컨테이너 워크로드의 동적 특성(파드가 수시로 생성/소멸, 노드 공유) 때문에 [컴퓨트·컨테이너 보안](./compute-container-security.md)의 이미지·런타임·자격 원칙이 그대로 적용되면서, 거기에 K8s 고유의 통제(admission, network policy, RBAC)가 더해진다.

EKS의 [공동 책임](../../foundations/shared-responsibility-model.md) 경계는 컨트롤플레인을 기준으로 갈린다. AWS는 관리형 컨트롤플레인(API 서버·etcd)을 운영·패치하지만, **워커 노드·워크로드·RBAC·네트워크 정책·이미지·시크릿은 고객 책임**이다.

| 영역 | AWS 책임 | 고객 책임 |
| --- | --- | --- |
| 컨트롤플레인 | API 서버·etcd 운영·패치, etcd 암호화 | 컨트롤플레인 로깅 활성화, 엔드포인트 노출 통제 |
| 데이터플레인 | (Fargate는 노드 OS) | 노드 OS·패치, 워크로드, RBAC |
| 워크로드 | — | 이미지, 권한, 네트워크 정책, 시크릿 |

## 2. 인증/인가 — 두 평면

EKS 접근은 두 단계다: (1) **AWS IAM**으로 클러스터 API에 *인증*, (2) **K8s RBAC**으로 클러스터 내 *인가*. 이 매핑을 정확히 해야 한다.

- **EKS access entries**: 과거의 `aws-auth` ConfigMap을 대체하는 방식으로, IAM 주체를 K8s 권한에 매핑하는 것을 EKS API로 관리한다. ConfigMap 수작업 편집의 오류·드리프트를 줄인다.
- **K8s RBAC**: `Role`/`ClusterRole` + `RoleBinding`으로 클러스터 내 동작을 최소권한으로 부여한다. `cluster-admin` 남발을 피한다.

## 3. IRSA vs EKS Pod Identity

파드가 AWS 리소스(S3·DynamoDB 등)에 접근할 때, 노드 인스턴스 역할을 그대로 쓰면 *그 노드의 모든 파드가 동일 권한*을 갖는다. 파드별 최소권한을 주는 두 방식이 있다.

| 구분 | **IRSA** | **EKS Pod Identity** |
| --- | --- | --- |
| 원리 | OIDC 제공자 + 서비스계정 토큰 → `AssumeRoleWithWebIdentity` | EKS Pod Identity Agent + 서비스계정 연결 |
| 신뢰 설정 | 클러스터별 OIDC provider 등록 필요 | OIDC 등록 불필요, EKS API로 연결 |
| 다중 클러스터 | 클러스터마다 신뢰관계·OIDC 설정 | 역할 재사용 용이 |
| 성숙도 | 오래되고 널리 검증됨 | 신규, 운영 단순화 |

- **IRSA(IAM Roles for Service Accounts)**: 서비스계정에 IAM 역할 ARN을 annotation으로 붙이면, 파드가 프로젝션된 토큰으로 역할을 assume한다. OIDC 기반이라 클러스터마다 OIDC provider를 IAM에 등록해야 한다.
- **EKS Pod Identity**: 더 최근 방식으로 OIDC provider 등록 없이 EKS API로 서비스계정↔역할을 연결한다. 신뢰관계가 단순해 다중 클러스터에서 역할 재사용이 쉽다.
- 어느 쪽이든 핵심은 **노드 역할이 아닌 파드(서비스계정) 단위 최소권한**이다. 노드 인스턴스 역할은 노드 운영에 필요한 최소 권한만 남긴다. → [02. IAM & Identity — MOC](../../identity-access/index.md)

## 4. Pod Security Standards와 admission control

구 PodSecurityPolicy(PSP)는 폐기되었고, 현재는 **Pod Security Standards(PSS)** 를 내장 Pod Security Admission(PSA)으로 적용하거나 정책 엔진으로 강제한다.

| 수준 | 의미 |
| --- | --- |
| `privileged` | 제한 없음(시스템/인프라 워크로드 한정) |
| `baseline` | 알려진 권한 상승 차단(최소 안전선) |
| `restricted` | 강한 하드닝(비-root, 권한 상승 금지, capability 제거 등) |

- **Pod Security Admission**: 네임스페이스 라벨로 PSS 수준을 `enforce`/`audit`/`warn` 모드로 적용한다. 애플리케이션 네임스페이스는 `restricted`를 지향한다.
- **정책 엔진(OPA Gatekeeper / Kyverno)**: PSS로 부족한 커스텀 정책(예: 특정 레지스트리 이미지만 허용, 라벨 강제, 이미지 서명 검증)을 admission webhook으로 강제한다.
- **이미지 서명 검증**: admission 단계에서 서명 검증(Notation/Sigstore/Kyverno)으로 *서명된 신뢰 이미지만* 클러스터에 배포되게 한다 → [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md).

## 5. Network Policy — east-west 통제

기본적으로 K8s 파드는 서로 자유롭게 통신한다(평면 네트워크). **Network Policy**로 파드 간 east-west 트래픽을 명시적으로 통제해 침해 시 측면 이동을 제한한다.

- EKS의 VPC CNI가 Kubernetes Network Policy를 지원하며, **Cilium**(eBPF) 등 서드파티 CNI로 L3/L4 + L7·아이덴티티 기반 정책을 확장할 수 있다.
- 기본 거부(default-deny) 정책을 베이스로 두고 필요한 통신만 allow하는 것이 권장 패턴이다.
- 클러스터 내부 미세분할은 VPC 수준 분할과 함께 계층을 이룬다 → [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../../infrastructure-network/network-segmentation.md).

## 6. 시크릿 관리

| 방식 | 설명 |
| --- | --- |
| **KMS envelope encryption** | etcd의 K8s Secret을 KMS 키로 봉투 암호화(secrets encryption) → [KMS & Envelope Encryption](../../data-protection/kms-envelope-encryption.md) |
| **External Secrets Operator** | Secrets Manager/SSM의 시크릿을 K8s Secret으로 동기화 |
| **Secrets Store CSI Driver** | 시크릿을 파드 볼륨으로 마운트(클러스터에 평문 Secret 미저장) |

- EKS는 K8s Secret을 **KMS로 봉투 암호화**해 etcd에 저장된 시크릿을 추가 보호한다. K8s Secret 자체는 기본 base64일 뿐 암호화가 아니므로 KMS 암호화를 활성화한다.
- 진짜 시크릿의 원본은 **Secrets Manager/Parameter Store**에 두고 External Secrets Operator나 Secrets Store CSI Driver로 가져온다 → [시크릿 관리 — Secrets Manager / Parameter Store](../../data-protection/secrets-management.md). 로테이션을 외부에서 관리할 수 있다.

## 7. 노드/런타임 보안

| 통제 | 설명 |
| --- | --- |
| **Bottlerocket** | 컨테이너 전용 최소 OS, 불변·읽기전용 루트, 자동 업데이트로 노드 공격면 축소 |
| Managed Node Group / Fargate | 패치·교체 자동화, Fargate는 파드별 격리(노드 운영 제거) |
| **GuardDuty EKS Protection** | 컨트롤플레인 감사 로그 분석 + Runtime Monitoring(런타임 이상행위) |
| 컨트롤플레인 로깅 | API 서버·audit·authenticator 로그를 CloudWatch로 전송 |

- **Bottlerocket**: SSH/패키지매니저 등 불필요 요소를 제거하고 루트 파일시스템을 읽기전용으로 두어 노드 변조 표면을 줄인다. 컨테이너 호스트로 권장된다 → [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](./compute-container-security.md).
- **GuardDuty EKS Protection**: (1) EKS 감사 로그 기반 위협 탐지(이상 API 호출·권한 상승 시도)와 (2) Runtime Monitoring으로 파드 내 프로세스·네트워크 이상행위를 탐지한다 → [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../../detection-response/detection/threat-detection-guardduty.md).
- **컨트롤플레인 로깅**을 켜지 않으면 클러스터 API에서 무슨 일이 있었는지 사후 추적이 불가능하다 — 활성화는 기본 위생이다.

## 핵심 고려사항
- **두 평면(IAM ↔ RBAC)의 일관성**을 IaC로 관리(access entries), `cluster-admin` 남발 금지.
- 파드 권한은 노드 역할이 아닌 **IRSA/Pod Identity로 파드별 최소권한**.
- 애플리케이션 네임스페이스는 **PSS `restricted`** + 정책 엔진으로 강제, admission에서 이미지 서명 검증.
- **default-deny Network Policy**로 측면 이동 차단.
- K8s Secret은 **KMS 봉투 암호화**, 원본은 외부 시크릿 저장소.
- 노드는 Bottlerocket·관리형 노드그룹, GuardDuty EKS Protection + 컨트롤플레인 로깅으로 탐지.

## 흔한 함정
- 파드가 **노드 인스턴스 역할 권한을 전부 상속** — IRSA/Pod Identity 미사용.
- IAM↔RBAC 매핑 드리프트(과거 `aws-auth` ConfigMap 수작업 편집).
- `cluster-admin`/privileged 컨테이너 남발, PSS·admission 미적용.
- Network Policy 부재로 파드 간 평면 통신 → 침해 시 즉시 측면 확산.
- K8s Secret을 "암호화"로 오인(base64일 뿐) — KMS 암호화 미활성.
- 컨트롤플레인 로깅 미활성으로 사고 조사 불가.
- 클러스터 API 엔드포인트를 퍼블릭으로 광범위 노출.

## 관련
- [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](./compute-container-security.md) · [02. IAM & Identity — MOC](../../identity-access/index.md) · [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md) · [시크릿 관리 — Secrets Manager / Parameter Store](../../data-protection/secrets-management.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../../detection-response/detection/threat-detection-guardduty.md)

### References (권위 출처)
- **EKS Best Practices Guide (Security)** — [aws.github.io/aws-eks-best-practices](https://aws.github.io/aws-eks-best-practices/security/docs/)
- **IAM roles for service accounts (IRSA)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
- **EKS Pod Identities** — [docs.aws.amazon.com](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)
- **EKS access entries** — [docs.aws.amazon.com](https://docs.aws.amazon.com/eks/latest/userguide/access-entries.html)
- **Pod Security Standards (Kubernetes)** — [kubernetes.io](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- **EKS secrets envelope encryption (KMS)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/eks/latest/userguide/envelope-encryption.html)
- **GuardDuty EKS Protection** — [docs.aws.amazon.com](https://docs.aws.amazon.com/guardduty/latest/ug/kubernetes-protection.html)
- **Bottlerocket** — [docs.aws.amazon.com](https://docs.aws.amazon.com/bottlerocket/latest/userguide/what-is-bottlerocket.html)

