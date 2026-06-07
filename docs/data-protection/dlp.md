---
title: "데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail"
sidebar_label: "데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail"
sidebar_position: 2
tags:
  - "데이터보호"
---
# 데이터 유출 방지 (DLP)

:::info[한 줄 정의]
클라우드 DLP는 "나가는 경로"를 모두 닫고 통제하는 것. **퍼블릭화 · cross-account 공유 · egress** 가 3대 유출 경로. 발견(Macie) 다음의 *차단* 단계.
:::

## 1. S3 퍼블릭 노출 차단 (가장 흔한 사고)
- **S3 Block Public Access(BPA)** 4개 설정 — 계정·버킷 모두 ON 권장.
- **기본값 변경(2023.4)**: 신규 버킷은 **BPA 자동 ON + ACL 비활성(BucketOwnerEnforced)** 가 기본(콘솔뿐 아니라 API/CLI/SDK/CFn 모두). ⚠️ **기존 버킷은 변경 없음** → 레거시 버킷 점검 필요.
- ACL 비활성 → 정책(IAM/버킷정책)만으로 접근 통제(ACL 우회 사고 제거).

## 2. 조직 차원 차단 — RCP (게임체인저)
- **RCP(Resource Control Policy)**: "조직 외부(`aws:PrincipalOrgID`≠) 는 S3 접근 불가"를 *조직 전체에 강제* → **개발자가 버킷을 퍼블릭/외부공유로 설정해도 무력화**. SCP로는 못 막는 외부 principal을 차단. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md)

## 3. egress / 데이터 이동 통제
- **VPC Endpoint + endpoint policy**: 승인된 버킷/계정만(인터넷 우회 + org 조건). → [VPC 보안 — SG / NACL / Flow Logs / Endpoint](../infrastructure-network/vpc-security.md)
- **스냅샷/AMI 외부 계정 공유 차단**(SCP/RCP), cross-region 복제 통제.
- **KMS 키 정책**으로 cross-account 데이터키 사용 제한. → [KMS & Envelope Encryption](./kms-envelope-encryption.md)
- 네트워크 egress: Network Firewall, DNS Firewall(데이터 exfiltration·C2). → [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](../infrastructure-network/edge-perimeter-waf-shield.md)

## 4. 모니터링
- **CloudTrail data events**로 S3 객체 접근 기록(사후 추적은 사전 활성화 필요). → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)
- GuardDuty S3 Protection(이상 접근), Macie(민감데이터 위치). → [데이터 분류 & 탐지 — Macie](./data-classification-macie.md)

## 5. 유출 경로 체크리스트
1. S3 퍼블릭/잘못된 버킷 정책 → BPA + Access Analyzer external access.
2. 스냅샷·AMI 외부 공유 → SCP/RCP.
3. KMS 키 cross-account 사용 → 키 정책.
4. egress 외부 전송 → 네트워크 통제.
5. (ATT&CK T1537 Transfer Data to Cloud Account) → [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

## 6. 자주 받는 질문
- "내부자가 데이터를 빼가면?" → endpoint 정책(org 제한) + data event 로깅 + 이상 탐지 + **RCP**.
- "퍼블릭 버킷 사고 반복" → 신규는 기본 차단되나 *레거시 버킷*과 *조직 강제(RCP)* 가 핵심.

## 관련
- [데이터 분류 & 탐지 — Macie](./data-classification-macie.md) · [VPC 보안 — SG / NACL / Flow Logs / Endpoint](../infrastructure-network/vpc-security.md) · [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

### References
- [S3 — 신규 버킷 BPA/ACL 기본값 변경(2023.4)](https://aws.amazon.com/about-aws/whats-new/2022/12/amazon-s3-automatically-enable-block-public-access-disable-access-control-lists-buckets-april-2023/) · [Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- RCP / VPC Endpoint policy 문서

