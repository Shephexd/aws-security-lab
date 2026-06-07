---
title: 자주 겪는 보안 문제
sidebar_label: 자주 겪는 문제
sidebar_position: 1
---

# 자주 겪는 보안 문제 → 해결로 가는 길

Security Lab은 "어떤 AWS 보안 서비스를 켤까"가 아니라, **고객이 실제로 겪는 문제에서 출발**합니다.
아래에서 지금 고민과 가장 가까운 항목을 고르면 **① 진단 → ② 솔루션 → ③ 기반 지식** 으로 이어집니다.

:::info 솔루션의 범위
여기서 "솔루션"은 단순 서비스 활성화가 아니라 **배포 패키지**(우리 자산) · **AWS 네이티브 활성화** · **설계 가이던스**(지식베이스)의 *조합* 입니다. 배포 패키지가 아직 없는 문제는 가이던스/네이티브로 안내합니다.
:::

## 모범사례 vs 자주 겪는 문제

둘은 **같은 통제를 보는 두 관점**입니다.

- **모범사례(Best Practice)** = *목표 상태*. "이렇게 설계해야 한다." → [Well-Architected 정렬(SEC 1–11)](./foundations/well-architected-alignment.md)
- **자주 겪는 문제(Common Problem)** = *현재 증상*. "지금 이게 안 되어 있거나 위험하다." → 이 페이지

모범사례를 **충족하지 못하면 문제로 나타나고**, 문제를 **해결하면 모범사례를 충족**합니다. 그 사이를 잇는 것이 **서비스/솔루션**입니다.

> 아래 표의 **모범사례** 열은 각 문제가 어떤 WAF 베스트 프랙티스(SEC) 미충족에 해당하는지 보여줍니다.

## 문제 → 솔루션 한눈에 보기

| 영역 | 자주 겪는 문제 | 모범사례 | ① 진단 | ② 서비스/솔루션 | ③ 기반 지식 |
|------|---------------|----------|--------|------------------|-------------|
| 가시성 | 내 계정 보안 상태를 모른다 | [SEC 1](./foundations/well-architected-alignment.md#security-foundations) | [SRA Verify](./diagnostics/sra-verify.md) | 📦 [SRA Verify](./diagnostics/sra-verify.md) · [리소스 시각화](./solutions/aws-resource-visualization.md) | [WAF 정렬](./foundations/well-architected-alignment.md) |
| 자격증명 | IAM 권한이 과도하거나 미사용 | [SEC 3](./foundations/well-architected-alignment.md#identity-and-access-management) | Access Analyzer | 네이티브 + 가이던스 | [정책 평가 로직](./identity-access/iam-policy-evaluation-logic.md) |
| 자격증명 | 루트·장기 액세스 키 위험 | [SEC 2](./foundations/well-architected-alignment.md#identity-and-access-management) | [SRA Verify](./diagnostics/sra-verify.md) | Identity Center · MFA | [IAM 핵심](./identity-access/iam-core.md) |
| 데이터 | S3·데이터가 노출될 수 있다 | [SEC 8](./foundations/well-architected-alignment.md#data-protection) | Macie | BPA · DLP (가이던스) | [데이터 분류](./data-protection/data-classification-macie.md) · [DLP](./data-protection/dlp.md) |
| 데이터 | 키 통제·암호화가 미흡하다 | [SEC 8](./foundations/well-architected-alignment.md#data-protection) | [SRA Verify](./diagnostics/sra-verify.md) | KMS (가이던스) | [KMS·봉투암호화](./data-protection/kms-envelope-encryption.md) |
| 노출면 | 인터넷 노출·SSRF/IMDS 위험 | [SEC 5](./foundations/well-architected-alignment.md#infrastructure-protection) | — | 세분화 · IMDSv2 강제 (가이던스) | [IMDSv2·SSRF](./infrastructure-network/imdsv2-ssrf-defense.md) |
| 노출면 | 컨테이너/서버리스 워크로드 취약 | [SEC 6](./foundations/well-architected-alignment.md#infrastructure-protection) | Inspector | 📦 [AppSec 보안 에이전트](./solutions/appsec-security-agent.md) · 가이던스 | [워크로드 보안](./application-workload/index.md) |
| 애플리케이션 | 코드·설계 단계의 취약점을 못 잡는다 | [SEC 11](./foundations/well-architected-alignment.md#application-security) | — | 📦 [AppSec 보안 에이전트](./solutions/appsec-security-agent.md) | [DevSecOps](./application-workload/appsec/devsecops.md) · [위협 모델링](./foundations/threat-modeling-attack.md) |
| 애플리케이션 | AI 코딩 도구를 거버넌스 하에 도입하고 싶다 | [SEC 2](./foundations/well-architected-alignment.md#identity-and-access-management) | — | 📦 [Claude Code on Bedrock](./solutions/claude-code-bedrock.md) | [ID 페더레이션](./identity-access/identity-federation.md) |
| 탐지·대응 | 위협을 탐지하지 못한다 | [SEC 4](./foundations/well-architected-alignment.md#detection) | [SRA Verify](./diagnostics/sra-verify.md) | 📦 [SIEM on OpenSearch](./solutions/siem-opensearch.md) · [AI 자동화 알림](./solutions/ai-automated-security-alerts.md) · GuardDuty | [탐지 & 대응](./detection-response/index.md) |
| 탐지·대응 | 로그가 흩어져 상관분석·조사가 어렵다 | [SEC 4](./foundations/well-architected-alignment.md#detection) | — | 📦 [SIEM on OpenSearch](./solutions/siem-opensearch.md) | [SIEM / Security Lake](./detection-response/detection/siem-security-lake.md) |
| 탐지·대응 | 인시던트 대응 체계가 없다 | [SEC 10](./foundations/well-architected-alignment.md#incident-response) | — | 자동 대응 (가이던스) | [IR 프레임워크](./detection-response/incident-response/ir-framework.md) |
| 복원력 | 랜섬웨어에 대비가 안 됐다 | [SEC 10](./foundations/well-architected-alignment.md#incident-response) | — | 불변백업 · 격리복구 (가이던스) | [복원력](./resilience/index.md) |
| 거버넌스 | 규제(ISMS-P/FSI/CSAP) 준수를 입증해야 한다 | [SEC 1](./foundations/well-architected-alignment.md#security-foundations) | [SRA Verify](./diagnostics/sra-verify.md) | 컴플라이언스 서비스 | [거버넌스](./governance-compliance/index.md) |
| 거버넌스 | 신규 계정·환경 표준화가 없다 | [SEC 1](./foundations/well-architected-alignment.md#security-foundations) | — | Landing Zone/Control Tower | [Landing Zone](./governance-compliance/landing-zone-control-tower.md) |

> 📦 = 배포 가능한 솔루션 패키지 보유. 그 외는 AWS 네이티브 활성화 + 설계 가이던스로 안내합니다.

## 영역별 자세히

### 가시성 — "지금 상태를 모른다"
가장 흔한 출발점입니다. 무엇이 떠 있고 어디가 모범사례에서 벗어났는지부터 측정합니다.
- **진단**: [SRA Verify](./diagnostics/sra-verify.md)로 조직 전 계정을 AWS SRA 기준 점검 → 발견사항 목록.
- **솔루션**: 자산 가시성은 [리소스 시각화](./solutions/aws-resource-visualization.md).
- **지식**: [Well-Architected 정렬(SEC 1–11)](./foundations/well-architected-alignment.md).

### 자격증명 — "권한이 과도하거나 통제가 안 된다"
침해의 가장 흔한 경로입니다.
- **진단**: IAM Access Analyzer(미사용/외부 공유 권한), SRA Verify(루트·키).
- **솔루션**: 최소권한 설계 + Identity Center 중앙화 + 권한 경계(가이던스).
- **지식**: [정책 평가 로직](./identity-access/iam-policy-evaluation-logic.md) · [특권 접근 관리](./identity-access/privileged-access-management.md).

### 데이터 — "노출되거나 통제가 약하다"
- **진단**: Macie(민감데이터), SRA Verify(S3 공개차단/암호화).
- **솔루션**: S3 퍼블릭 액세스 차단 + 분류 + DLP(가이던스).
- **지식**: [데이터 분류](./data-protection/data-classification-macie.md) · [KMS·봉투암호화](./data-protection/kms-envelope-encryption.md).

### 노출면·애플리케이션 — "공격 표면이 넓다 / 코드에 취약점이 있다"
- **솔루션**: 코드·설계·침투테스트는 [AppSec 보안 에이전트](./solutions/appsec-security-agent.md), AI 코딩 도구의 안전한 도입은 [Claude Code on Bedrock](./solutions/claude-code-bedrock.md).
- **지식**: [IMDSv2·SSRF](./infrastructure-network/imdsv2-ssrf-defense.md) · [DevSecOps](./application-workload/appsec/devsecops.md).

### 탐지·대응 — "탐지·대응이 약하다"
- **진단**: SRA Verify(GuardDuty/Security Hub 활성 여부).
- **솔루션**: [AI 자동화 보안 알림](./solutions/ai-automated-security-alerts.md) + GuardDuty/Security Hub.
- **지식**: [탐지 & 대응](./detection-response/index.md).

### 복원력·거버넌스 — "복구 보증·규제 입증이 필요하다"
- **솔루션**: 불변 백업·격리 복구(가이던스), 규제는 컴플라이언스 서비스 + 매핑.
- **지식**: [복원력](./resilience/index.md) · [거버넌스 & 컴플라이언스](./governance-compliance/index.md).

---

> 전체 흐름(진단→우선순위→설계→배포→증빙)을 단계로 보려면 → **[보안 여정](./security-journey.md)**.
