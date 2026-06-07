---
title: "서버리스 보안 — Lambda / API Gateway / Step Functions"
sidebar_label: "서버리스 보안 — Lambda / API Gateway / Step Functions"
sidebar_position: 4
tags:
  - "워크로드"
---
# 서버리스 보안

:::info[한 줄 정의]
서버리스는 OS·런타임 패치 부담을 AWS로 넘기는 대신, **함수별 최소권한 실행 역할**과 **이벤트 신뢰 경계**라는 새로운 책임을 만든다. 공격 표면이 코드·의존성·권한·이벤트 소스로 옮겨가므로 통제도 그쪽으로 옮긴다.
:::

## 1. 왜 중요한가
Lambda에서는 [공동 책임](../../foundations/shared-responsibility-model.md) 경계가 위로 이동한다. AWS가 OS·런타임 패치와 격리를 책임지므로 패치 운영 부담은 줄지만, **고객 책임은 코드·의존성·실행 역할·환경변수·이벤트 입력**으로 집중된다.

서버리스의 특성상 함수 수가 폭발적으로 늘어 권한 관리가 어려워지고, 다양한 이벤트 소스(S3, SNS, SQS, EventBridge, API Gateway)가 함수를 트리거하므로 *누가 함수를 호출할 수 있는가*와 *그 입력을 신뢰할 수 있는가*가 핵심 질문이 된다. 또한 함수가 자주 실행되므로 과도한 권한 하나가 빈번히 악용될 표면이 된다.

| 영역 | 줄어드는 부담 | 새로 생기는 책임 |
| --- | --- | --- |
| 패치 | OS/런타임 패치(AWS) | 런타임 EOL 추적, 의존성 패치 |
| 권한 | — | 함수별 최소권한 실행 역할 |
| 입력 | — | 이벤트 소스 신뢰·입력 검증 |
| 비밀 | — | 환경변수 암호화, Secrets Manager 연동 |

## 2. 실행 역할 최소권한

각 함수는 **고유한 실행 역할**을 가져야 한다. 여러 함수가 공용 역할을 공유하면 한 함수의 권한이 모든 함수로 번지고, 함정 권한이 추적 불가능해진다.

| 안티패턴 | 권장 |
| --- | --- |
| 모든 함수가 공용 역할 공유 | 함수 1개 = 역할 1개 |
| `*` 리소스/액션 와일드카드 | 특정 리소스 ARN·액션으로 좁힘 |
| 손으로 권한 부여 | IaC(SAM/CDK)로 함수별 역할 자동 생성 |

- **IaC 자동화**: SAM·CDK는 함수가 참조하는 리소스에 맞춰 최소권한 역할을 생성해준다(예: SAM policy templates). 수작업 권한 부여보다 일관적이고 검토 가능하다.
- **검증**: IAM Access Analyzer로 미사용 권한·외부 접근을 점검하고, CloudTrail로 실제 사용된 권한만 남기도록 좁힌다. → [IAM 핵심 — User/Group/Role/Policy](../../identity-access/iam-core.md)
- 호출 측 권한과 실행 측 권한을 구분: *함수를 호출할 권한*(resource-based policy)과 *함수가 다른 서비스를 호출할 권한*(execution role)은 별개다.

## 3. 이벤트 소스 신뢰와 confused deputy

함수를 트리거하는 이벤트 소스가 신뢰 경계다. 리소스 기반 정책(`lambda:InvokeFunction`)에서 **누가 호출할 수 있는지**를 제한해야 한다. 특히 SNS/S3/EventBridge 같은 AWS 서비스가 호출 주체일 때 confused deputy 문제를 막아야 한다.

| 조건 키 | 목적 |
| --- | --- |
| `aws:SourceArn` | 특정 리소스(이 버킷/이 토픽)만 호출 허용 |
| `aws:SourceAccount` | 특정 계정의 서비스만 호출 허용 |
| `Principal: <service>.amazonaws.com` | AWS 서비스 주체로 제한 |

- **Confused deputy**: AWS 서비스가 "대리인"으로 함수를 호출하므로, 출처를 제한하지 않으면 다른 계정의 동일 서비스가 우리 함수를 호출하도록 속일 수 있다. `aws:SourceArn`/`aws:SourceAccount`로 출처를 못 박는다.
- **입력 검증**: 이벤트 페이로드는 신뢰 불가 입력이다. SQS 메시지, API 본문, S3 객체 메타데이터 등을 스키마 검증하고, SQL/명령/NoSQL 인젝션 등 [injection](../../foundations/threat-modeling-attack.md) 패턴을 방어한다. 함수 코드는 입력을 그대로 쿼리·셸에 넘기면 안 된다.

## 4. API Gateway / Function URL 인가

함수를 인터넷에 노출하는 경로는 인가를 반드시 건다. 인증 없는 Function URL이나 열린 API는 즉시 남용 표면이 된다.

| 방식 | 설명 | 적합 |
| --- | --- | --- |
| **IAM authorizer** | SigV4 서명 요청만 허용 | 내부 서비스 간 호출 |
| **Cognito authorizer** | Cognito 사용자 풀 토큰 검증 | 사용자 로그인 기반 앱 |
| **Lambda authorizer** | 커스텀 토큰/정책 검증 함수 | 외부 IdP·커스텀 인가 → [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](../../foundations/authentication-protocols.md) |
| **JWT authorizer** | OIDC/OAuth2 JWT 검증(HTTP API) | 표준 OAuth2 |
| **mTLS** | 클라이언트 인증서 검증 | B2B·강한 클라 인증 |

- **Function URL**: `AuthType=AWS_IAM`을 권장하고, `NONE`(인증 없음)은 의도된 공개 엔드포인트에만 신중히 사용한다. 공개 시에는 앞단에 CloudFront/WAF를 둔다.
- API Gateway 앞단에 **WAF**를 붙여 인젝션·봇·레이트 제한을 적용한다 → [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](../../infrastructure-network/edge-perimeter-waf-shield.md).

## 5. 환경변수 암호화와 시크릿

Lambda 환경변수는 기본적으로 KMS로 저장 암호화되지만, **시크릿(DB 비밀번호·API 키)을 환경변수에 평문으로 두는 것은 피한다.** 환경변수는 콘솔/API에서 함수 설정을 볼 수 있는 사람에게 노출될 수 있다.

- **고객 관리 KMS 키(CMK)** 로 환경변수를 암호화하면 키 접근을 별도 통제·감사할 수 있다.
- 진짜 시크릿은 **Secrets Manager / SSM Parameter Store(SecureString)** 에서 런타임에 조회하고, **Lambda extension(Parameters and Secrets extension)** 으로 캐싱해 호출 비용·지연을 줄인다. → [시크릿 관리 — Secrets Manager / Parameter Store](../../data-protection/secrets-management.md)
- 시크릿을 환경변수가 아닌 외부 저장소에 두면 로테이션이 함수 재배포 없이 가능하다.

## 6. 코드 서명과 의존성/Layer 위험

서버리스의 공급망 표면은 **함수 코드 + 의존성 패키지 + Layer**다.

| 위험 | 통제 |
| --- | --- |
| 변조된 배포 패키지 | **AWS Signer + Code Signing for Lambda** — 서명된 코드만 배포 허용 |
| 취약한 의존성 | CI에서 SCA 스캔, SBOM 생성 → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](./devsecops.md) |
| 신뢰 못 할 Layer | Layer 출처·내용 검증, 외부 ARN Layer 사용 최소화 |
| 공급망 침해 | 핀 고정(lockfile), 사설 레지스트리 → [공급망 보안 — SBOM / 이미지 서명 / Signer](../../advanced/supply-chain-sbom.md) |

- **Code Signing for Lambda**: Signer로 서명한 코드 패키지만 함수에 배포되도록 강제한다. 서명 검증 실패 시 배포를 거부해 변조·미승인 코드 배포를 막는다.
- **Layer 위험**: Layer는 코드/의존성을 공유하는 편리한 메커니즘이지만, 외부에서 가져온 Layer는 사실상 신뢰하는 의존성이다. 출처를 검증하고 가급적 자체 빌드한다.

## 7. VPC Lambda

함수가 RDS·ElastiCache 등 **VPC 내부 리소스**에 접근하려면 함수를 VPC에 연결한다.

- VPC 연결 함수는 ENI를 통해 서브넷에 붙으며, 보안그룹으로 egress를 통제한다. 프라이빗 서브넷 + NAT 또는 **VPC 엔드포인트**로 AWS 서비스에 접근한다.
- VPC에 넣는다고 자동으로 안전한 것은 아니다 — 보안그룹/NACL과 라우팅을 명시적으로 좁혀야 한다. → [VPC 보안 — SG / NACL / Flow Logs / Endpoint](../../infrastructure-network/vpc-security.md)
- 인터넷 접근이 필요 없으면 인터넷 라우트를 두지 말고 VPC 엔드포인트만 사용해 egress를 봉쇄한다.

## 8. 동시성과 DoS

서버리스는 자동 확장되므로 **비용·가용성 측면의 DoS**(economic denial of sustainability)에 노출된다.

- **예약 동시성(reserved concurrency)** 으로 함수당 동시 실행 상한을 두어 폭주 시 다른 함수·계정 한도를 보호한다.
- 다운스트림(RDS 등)이 폭주 트래픽을 받지 않도록 동시성을 다운스트림 용량에 맞춘다.
- 앞단 WAF 레이트 제한, API Gateway 스로틀링으로 입력 폭주를 차단한다 → [DDoS 방어 아키텍처](../../infrastructure-network/ddos-protection.md).

## 9. 관측성 — Powertools

**Powertools for AWS Lambda**(Python/Java/.NET/TypeScript)는 구조화 로깅·트레이싱(X-Ray)·메트릭을 표준화한다. 보안 관점에서 일관된 구조화 로그는 이상 호출·인가 실패 탐지와 사고 조사의 토대가 된다. CloudTrail(관리 이벤트)·함수 로그·X-Ray를 결합해 누가 무엇을 호출했는지 추적한다. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../../detection-response/detection/logging-auditing.md)

## 핵심 고려사항
- **함수 1개 = 역할 1개**, IaC로 최소권한 역할을 자동 생성하고 Access Analyzer로 검증.
- 이벤트 소스는 `aws:SourceArn`/`aws:SourceAccount`로 출처를 못 박고, 모든 입력을 검증.
- 노출 엔드포인트(Function URL/API GW)는 반드시 인가 + 앞단 WAF.
- 시크릿은 환경변수 평문 금지 → Secrets Manager/Parameter Store + KMS.
- 코드/의존성/Layer는 서명·SCA·핀 고정으로 공급망 통제.

## 흔한 함정
- 여러 함수가 공용 실행 역할을 공유 → 권한 폭발·추적 불가.
- 실행 역할에 `*` 권한, 또는 호출 권한과 실행 권한 혼동.
- Function URL을 `AuthType=NONE`으로 열어둔 채 방치.
- 시크릿을 환경변수에 평문 저장 → 콘솔/설정 열람자에게 노출.
- 이벤트 페이로드를 신뢰 입력으로 취급(인젝션·confused deputy).
- 동시성 상한 없이 운영 → 비용 폭주·다운스트림 과부하.
- 출처 불명 Layer를 그대로 사용.

## 관련
- [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](./compute-container-security.md) · [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](./devsecops.md) · [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](../../foundations/authentication-protocols.md) · [시크릿 관리 — Secrets Manager / Parameter Store](../../data-protection/secrets-management.md) · [자동화 & 오케스트레이션 — EventBridge / SSM / Step Functions](../../detection-response/incident-response/automation-orchestration.md)

### References (권위 출처)
- **Lambda security overview / best practices** — [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html)
- **Lambda execution role** — [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)
- **Lambda environment variables / encryption** — [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- **Code Signing for Lambda (AWS Signer)** — [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/configuration-codesigning.html)
- **Lambda Function URLs auth** — [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html)
- **API Gateway controlling access** — [docs.aws.amazon.com](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)
- **Cross-service confused deputy prevention** — [docs.aws.amazon.com](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html)
- **Powertools for AWS Lambda** — [docs.powertools.aws.dev](https://docs.powertools.aws.dev/lambda/)

