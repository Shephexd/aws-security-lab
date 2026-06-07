---
title: "IMDSv2 & SSRF 방어"
sidebar_label: "IMDSv2 & SSRF 방어"
sidebar_position: 4
tags:
  - "네트워크"
---
# IMDSv2 & SSRF 방어

:::info[한 줄 정의]
EC2의 인스턴스 메타데이터 서비스(IMDS, `169.254.169.254`)는 인스턴스 역할의 **임시 자격증명**을 노출한다. SSRF로 이걸 호출당하면 역할 권한이 통째로 탈취된다. **IMDSv2 강제**가 표준 방어.
:::

## 1. 왜 중요한가 (실제 사고)
2019 **Capital One** 사건: WAF(앱) SSRF 취약점 → 공격자가 IMDS 호출 → S3 접근 역할 자격 탈취 → 1억 건 데이터 유출. 클라우드 보안에서 가장 자주 인용되는 사례이며, 고객 모두 묻는다.

## 2. IMDS란
- EC2 내부에서 인스턴스 메타데이터·**연결된 IAM 역할의 임시 자격**을 받는 link-local 엔드포인트.
- 정상 용도: SDK가 자동으로 자격을 가져옴(키 하드코딩 불필요 — 좋은 것).
- 위험: 앱이 *공격자가 지정한 URL을 대신 요청(SSRF)* 하면, IMDS도 호출 가능 → 자격 유출.

## 3. IMDSv1 vs IMDSv2
| | IMDSv1 | **IMDSv2** |
|---|---|---|
| 방식 | 단순 GET 요청 | **세션 토큰 필수**(PUT으로 토큰 발급 후 GET) |
| SSRF 내성 | ❌ 취약 | ✅ 대부분 SSRF는 PUT/헤더 못 보냄 → 차단 |
| hop limit | - | TTL=1 기본 → 컨테이너/프록시 우회 어려움 |

> IMDSv2는 토큰 발급에 `PUT` + 커스텀 헤더(`X-aws-ec2-metadata-token-ttl-seconds`)를 요구. 전형적 SSRF(단순 GET, 헤더 주입 불가)는 이 단계를 못 넘는다.

## 4. 방어 설정 (실무 체크리스트)
- [ ] 신규/기존 인스턴스 **IMDSv2 강제**(`HttpTokens=required`), IMDSv1 비활성.
- [ ] **hop limit = 1** (컨테이너에서 굳이 필요 없으면), 필요 시 조정.
- [ ] 메타데이터 자체가 불필요하면 **IMDS 완전 비활성**(`HttpEndpoint=disabled`).
- [ ] 신규 인스턴스 기본값을 계정/조직 차원에서 IMDSv2로(launch template, **SCP/Declarative Policy**로 강제).
- [ ] 기존 인스턴스 스캔: 어느 인스턴스가 아직 IMDSv1 허용인지 → AWS Config 규칙, `ec2:MetadataHttpTokens`.

## 5. SSRF 자체 방어 (계층 방어)
IMDSv2는 SSRF의 *영향*을 줄이지만 SSRF 자체를 막는 건 앱이다.
- 앱: URL 입력 검증/allowlist, 내부 IP·link-local(`169.254.0.0/16`) 차단, 리다이렉트 추적 제한.
- 네트워크: egress 통제, 메타데이터 IP로의 트래픽 통제.
- → defense in depth: [Defense in Depth (심층 방어)](../foundations/defense-in-depth.md)

## 6. 더 넓은 자격 위생
- EC2에 장기 키 하드코딩 ❌ → 인스턴스 역할 사용(자격 자동 로테이션).
- 컨테이너: ECS task role / EKS IRSA·Pod Identity로 인스턴스 역할 노출 최소화.
- 탈취 탐지: GuardDuty `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration`(역할 자격이 EC2 *밖*에서 사용되면 탐지).

## 7. 자주 받는 질문
- "우리 EC2 다 IMDSv2 쓰나요?" → Config로 즉시 점검 가능. 안 쓰면 1순위 개선.
- "SSRF는 앱팀 문제 아닌가요?" → 맞지만 IMDSv2/네트워크로 *피해를 봉쇄*하는 게 핵심.
- GuardDuty 인스턴스 자격 탈취 finding이 뜨면 즉시 [격리/포렌식](../detection-response/incident-response/forensics-on-aws.md).

## 관련
- [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md) · [VPC 보안 — SG / NACL / Flow Logs / Endpoint](./vpc-security.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection-response/detection/threat-detection-guardduty.md)

