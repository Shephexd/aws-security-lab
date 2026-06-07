---
title: "컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda"
sidebar_label: "컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda"
sidebar_position: 1
tags:
  - "워크로드"
---
# 컴퓨트 & 컨테이너 보안

:::info[한 줄 정의]
컴퓨트 워크로드 보안은 **이미지 · 런타임 · 자격증명 · 패치** 4축으로 압축된다. 불변 인프라(immutable infrastructure)로 드리프트를 없애고, 워크로드마다 최소권한 역할을 부여하며, 빌드 시점부터 런타임까지 계층 방어를 적용하는 것이 기본 원칙이다.
:::

## 1. 왜 중요한가
EC2, ECS, Lambda 같은 컴퓨트는 애플리케이션이 실제로 실행되는 곳이며, **자격증명이 노출되는 1차 표면**이다. 인스턴스/태스크 역할의 임시 자격이 탈취되면 권한 범위만큼의 AWS 리소스가 모두 위험해진다(→ [IMDSv2 & SSRF 방어](../../infrastructure-network/imdsv2-ssrf-defense.md)). 동시에 컨테이너 이미지는 OS 패키지·언어 의존성까지 통째로 배포되므로, 취약한 베이스 이미지 하나가 수백 개 워크로드로 전파된다.

[공동 책임 모델](../../foundations/shared-responsibility-model.md)에서 컴퓨트는 고객 책임이 크게 늘어나는 구간이다. EC2는 게스트 OS·런타임·패치까지 모두 고객 몫이고, ECS/EKS는 컨테이너 이미지와 워크로드 권한이, Fargate는 노드 운영이 빠지는 대신 이미지·권한·네트워크가 여전히 고객 책임으로 남는다.

| 서비스 | AWS 책임 | 고객 책임 |
| --- | --- | --- |
| EC2 | 하이퍼바이저, 물리 인프라 | 게스트 OS·패치, 런타임, 앱, 인스턴스 역할, 네트워크 |
| ECS on EC2 | 컨트롤플레인 | 노드 OS·패치, 이미지, 태스크/인스턴스 역할 |
| ECS on Fargate | 노드·OS·런타임 격리 | 이미지, 태스크 역할, 네트워크/시크릿 |
| Lambda | OS·런타임 패치, 격리 | 코드, 실행 역할, 의존성, 환경변수 → [서버리스 보안 — Lambda / API Gateway / Step Functions](./serverless-security.md) |

## 2. EC2 하드닝 — 골든 AMI와 패치

골든 AMI(golden AMI)는 OS 하드닝·에이전트·CIS 벤치마크 설정을 미리 적용해 검증한 **표준 베이스 이미지**다. 인스턴스를 부팅 후 설정하는 대신, 검증된 이미지에서 시작하면 드리프트와 부팅 시 구성 오류를 줄인다.

| 항목 | 권장 사항 |
| --- | --- |
| 베이스 | CIS 벤치마크 또는 STIG 적용, 불필요 패키지/포트 제거 |
| 빌드 자동화 | **EC2 Image Builder** 파이프라인으로 패치·테스트·배포·공유 자동화 |
| 메타데이터 | **IMDSv2 강제**(`HttpTokens=required`), hop limit=1 → [IMDSv2 & SSRF 방어](../../infrastructure-network/imdsv2-ssrf-defense.md) |
| 패치 | **SSM Patch Manager**로 패치 baseline·유지보수 윈도우 정의 |
| 접속 | SSH 키 대신 **SSM Session Manager**(키·인바운드 포트 불필요, 로깅) |
| 스캔 | **Amazon Inspector**로 EC2 OS/언어 패키지 CVE 상시 평가 |

- **SSM Session Manager**: 인바운드 22번 포트·베스천 호스트 없이 셸 접속이 가능하고 세션 로그가 CloudTrail/S3/CloudWatch로 남는다. 인스턴스에 퍼블릭 IP나 인바운드 규칙을 열지 않아도 된다.
- **Patch Manager**: 정기 스캔/설치를 유지보수 윈도우로 스케줄링한다. 다만 불변 인프라 패턴에서는 *살아있는 인스턴스를 패치하기보다* 새 골든 AMI를 굽고 교체하는 방식을 선호한다(아래 6절).
- **Fleet Manager / Inventory**: SSM Inventory로 설치 패키지·패치 상태를 가시화해 어떤 인스턴스가 뒤처졌는지 추적한다.

## 3. ECR 이미지 스캔과 서명

컨테이너 이미지는 빌드 시점에 검증하는 것이 가장 비용이 낮다. ECR은 **Amazon Inspector 기반 향상된 스캔(enhanced scanning)** 으로 OS 패키지뿐 아니라 언어 패키지(npm, pip, Go 등) 취약점까지 푸시 시 자동 평가하고, 새로운 CVE가 공개되면 기존 이미지도 재평가한다.

| 단계 | 통제 | 도구 |
| --- | --- | --- |
| 빌드 | SBOM 생성, 의존성 스캔 | CI 파이프라인 → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](./devsecops.md) |
| 푸시 | 이미지 취약점 스캔 | ECR enhanced scanning(Inspector) |
| 저장 | 태그 불변성, 레지스트리 권한 최소화 | ECR repository policy, immutable tags |
| 배포 | 서명 검증, 신뢰 이미지만 허용 | ECR + 정책(EKS는 admission) |
| 런타임 | 재평가, 이상행위 탐지 | Inspector 재스캔, GuardDuty |

- **기본 스캔 vs 향상된 스캔**: 기본(basic)은 Clair 기반 OS 패키지만, 향상된(enhanced)은 Inspector로 OS+언어 패키지를 지속 평가한다. 엔터프라이즈는 향상된 스캔을 권장한다.
- **이미지 서명**: 이미지의 출처·무결성을 보장하려면 서명을 사용한다. AWS Signer의 컨테이너 이미지 서명 또는 Notation/Sigstore 같은 OSS로 서명하고, 배포 단계(EKS admission 등)에서 검증한다. 공급망 관점은 → [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md).
- **태그 불변성(immutable tags)**: 같은 태그를 덮어쓰는 공격/실수를 막아 "스캔한 이미지 ≠ 실행한 이미지" 상황을 방지한다.

## 4. 워크로드 역할 최소권한

컴퓨트 자격증명은 **장기 액세스 키를 박지 않고** 역할로 임시 자격을 자동 수급하는 것이 원칙이다. 핵심은 권한을 *워크로드 단위로* 잘게 쪼개는 것이다.

| 주체 | 역할 | 핵심 원칙 |
| --- | --- | --- |
| EC2 | 인스턴스 프로파일 역할 | 호스트 전체가 공유 → 최소권한·IMDSv2로 노출 봉쇄 |
| ECS 태스크 | **Task Role** | 태스크(컨테이너)별 권한, 인스턴스 역할과 분리 |
| ECS 에이전트 | **Task Execution Role** | 이미지 풀·로그 전송용, 앱 권한과 분리 |
| Lambda | 실행 역할 | 함수별 별도 역할 → [서버리스 보안 — Lambda / API Gateway / Step Functions](./serverless-security.md) |

- **Task Role ≠ Execution Role**: 실행 역할(execution role)은 ECS 에이전트가 ECR 이미지를 풀하고 로그를 보내는 데 쓰는 인프라 권한이고, 태스크 역할(task role)은 *컨테이너 안 애플리케이션 코드*가 쓰는 권한이다. 둘을 섞으면 앱이 불필요한 인프라 권한을 갖게 된다.
- **태스크별 자격 분리**: 한 인스턴스에 여러 태스크가 떠도 각 태스크는 자기 태스크 역할만 받는다. ECS는 태스크 자격을 별도 엔드포인트로 제공하므로 인스턴스 역할을 그대로 상속하지 않는다.
- **검증**: IAM Access Analyzer로 미사용 권한·외부 접근을 점검하고, CloudTrail로 실제 사용 권한을 좁힌다. → [IAM 핵심 — User/Group/Role/Policy](../../identity-access/iam-core.md)

## 5. Fargate vs EC2 launch type

| 구분 | EC2 launch type | Fargate |
| --- | --- | --- |
| 노드 운영 | 고객이 EC2 노드 관리·패치 | AWS가 노드/OS 관리 |
| 격리 | 호스트 공유(같은 인스턴스 다수 태스크) | **태스크당 전용 마이크로 VM** 수준 격리 |
| IMDS | 인스턴스 IMDS 노출 주의 | 호스트 IMDS 접근 없음 |
| 패치 책임 | 노드 OS 고객 책임 | OS 패치 AWS 책임 |
| 적합 | 세밀한 노드 제어, GPU/특수 인스턴스 | 운영 부담 최소화, 강한 워크로드 격리 |

- Fargate는 태스크마다 격리된 컴퓨트 환경을 제공해 **테넌트 간/태스크 간 측면 이동을 줄인다.** 또한 호스트 IMDS가 노출되지 않아 인스턴스 역할 탈취 표면이 사라진다.
- EC2 launch type은 노드 운영 책임이 따라오므로 골든 AMI·Patch Manager·Inspector를 노드에도 적용해야 한다.

## 6. 불변 인프라와 빠른 교체

살아있는 서버에 SSH로 접속해 패치/설정을 바꾸는 방식(mutable)은 구성 드리프트와 추적 불가 변경을 낳는다. **불변 인프라**는 변경 시 *기존 인스턴스를 패치하지 않고* 새 이미지로 교체한다.

- 패치 → 새 골든 AMI 빌드(EC2 Image Builder) → 새 인스턴스 배포 → 기존 인스턴스 폐기.
- 이점: 모든 인스턴스가 동일 이미지(드리프트 0), 롤백이 이전 이미지로의 재배포로 단순화, 변경이 코드/파이프라인으로 추적됨.
- 컨테이너는 본질적으로 이 패턴에 부합한다 — 이미지를 다시 빌드/배포할 뿐, 실행 중 컨테이너를 고치지 않는다.

## 7. 런타임 보안

빌드 시 스캔은 *알려진* 취약점만 잡는다. 실행 중 이상 행위(악성 프로세스, 자격 탈취 시도, C2 통신)는 런타임 통제로 탐지한다.

| 통제 | 설명 |
| --- | --- |
| **GuardDuty Runtime Monitoring** | EC2/ECS/EKS 런타임에서 프로세스·파일·네트워크 이상행위 탐지(eBPF 기반 에이전트) |
| GuardDuty Malware Protection | EBS 볼륨/오브젝트 멀웨어 스캔 |
| 인스턴스 자격 탈취 탐지 | `UnauthorizedAccess:...InstanceCredentialExfiltration` — 역할 자격이 EC2 밖에서 사용 시 |
| 읽기전용 루트 FS | 컨테이너 `readOnlyRootFilesystem`, 비-root 사용자 실행 |
| 권한 최소화 | privileged 컨테이너·과도한 Linux capability 제거 |

- 컨테이너 하드닝: 비-root 사용자로 실행, 루트 파일시스템 읽기전용, 불필요 capability 제거, 호스트 네트워크/PID 공유 금지.
- 탐지 후 대응은 격리/포렌식으로 연결된다 → [AWS 포렌식 — 격리 / 스냅샷 / 타임라인](../../detection-response/incident-response/forensics-on-aws.md).

## 핵심 고려사항
- 자격증명은 **장기 키 금지, 역할로 임시 수급**. ECS는 task role/execution role 분리, EC2는 IMDSv2 강제.
- 이미지는 **빌드 시 스캔 + 서명 + 태그 불변성**, 런타임은 GuardDuty로 이상행위 탐지(계층 방어).
- 패치는 *살아있는 서버 수정*보다 **불변 인프라 교체**를 우선. 골든 AMI는 Image Builder로 자동화.
- 격리가 중요하면 Fargate, 세밀한 노드 제어가 필요하면 EC2 launch type.

## 흔한 함정
- ECS task role과 execution role을 하나로 합쳐 앱이 인프라 권한까지 보유.
- 인스턴스 역할을 과도하게 부여 → SSRF/IMDS 탈취 시 피해 확대(→ IMDSv2 미강제).
- 한 번 스캔한 뒤 방치 — 새 CVE 공개 후 재평가 안 함(Inspector 지속 스캔 미사용).
- `latest` 태그 + mutable tag로 "스캔한 이미지 ≠ 배포된 이미지".
- 컨테이너를 root·privileged로 실행, 루트 FS 쓰기 허용.
- SSH 키/베스천 의존 — Session Manager 미사용으로 인바운드 포트 노출.

## 관련
- [EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy](./eks-kubernetes-security.md) · [서버리스 보안 — Lambda / API Gateway / Step Functions](./serverless-security.md) · [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](./devsecops.md) · [IAM 핵심 — User/Group/Role/Policy](../../identity-access/iam-core.md) · [IMDSv2 & SSRF 방어](../../infrastructure-network/imdsv2-ssrf-defense.md)

### References (권위 출처)
- **EC2 Image Builder** — [docs.aws.amazon.com](https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html)
- **SSM Patch Manager / Session Manager** — [Patch Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager.html) · [Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- **Amazon ECR image scanning (Inspector)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html)
- **ECS task IAM roles (task vs execution role)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- **AWS Fargate security** — [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- **GuardDuty Runtime Monitoring** — [docs.aws.amazon.com](https://docs.aws.amazon.com/guardduty/latest/ug/runtime-monitoring.html)
- **AWS Signer (container image signing)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/signer/latest/developerguide/Welcome.html)

