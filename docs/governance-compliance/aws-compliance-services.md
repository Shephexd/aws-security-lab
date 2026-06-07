---
title: "AWS 컴플라이언스 서비스 — Artifact / Audit Manager"
sidebar_label: "AWS 컴플라이언스 서비스 — Artifact / Audit Manager"
sidebar_position: 1
tags:
  - "거버넌스"
---
# AWS 컴플라이언스 서비스

:::info[한 줄 정의]
컴플라이언스 증빙은 두 갈래다. **AWS측 책임에 대한 증빙(AWS Artifact)** 과 **고객 책임에 대한 증거 수집·측정(Audit Manager · Config · Security Hub)**. 책임 공유 모델(→ [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md))에서 "누구의 통제를 무엇으로 증명하는가"를 서비스에 매핑하는 것이 핵심이다.
:::

:::tip[큰 그림]
- **AWS Artifact** = "AWS가 인프라(of the cloud) 책임을 다하고 있다"는 제3자 감사 증빙을 받는 곳. (SOC, ISO, PCI 등)
- **Audit Manager** = "고객이 클라우드 안(in the cloud)에서의 통제를 운영하고 있다"는 증거를 프레임워크 기준으로 자동 수집.
- **Config Conformance Pack + Security Hub 표준** = 그 통제 상태를 일회성이 아니라 **상시(continuous)** 측정·이탈 탐지.
:::

## 1. 왜 중요한가
감사·인증은 두 가지 질문에 답해야 한다. (1) AWS가 책임지는 부분(데이터센터 물리보안, 하이퍼바이저, 관리형 서비스 내부 등)은 무엇으로 증명하나? (2) 고객이 책임지는 부분(IAM, 암호화 설정, 로깅, 네트워크)은 어떻게 통제하고 그 증거를 남기나?

AWS Artifact는 (1)을, Audit Manager·Config·Security Hub는 (2)를 담당한다. 이 경계를 흐리면 "AWS가 ISO 인증을 받았으니 우리도 자동으로 준수"라는 흔한 오해로 이어진다. AWS의 인증은 **AWS 인프라 범위**에 대한 것이며, 고객 워크로드의 준수는 고객이 별도로 증명해야 한다. → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)

## 2. AWS Artifact — AWS측 증빙

AWS가 제3자 감사인으로부터 받은 **인증서·감사보고서**를 셀프서비스로 내려받는 포털이다. 영업 담당자를 거치지 않고 콘솔에서 즉시 다운로드한다.

| 보고서/인증 | 성격 | 감사인 기준 |
|---|---|---|
| **SOC 1 / SOC 2 / SOC 3** | 신뢰서비스기준 감사보고서 | AICPA. SOC 1=재무보고 관련 통제, SOC 2=보안·가용성 등(NDA 필요), SOC 3=일반공개용 요약 |
| **ISO 27001 / 27017 / 27018 / 9001** | 관리체계 인증서 | 27017=클라우드 보안, 27018=클라우드 PII |
| **PCI DSS AOC / RoC** | 카드결제 적합성 증명 | PCI SSC. AWS는 Level 1 서비스 제공자 |
| **국가/산업별** | FedRAMP, IRAP, C5, K-ISMS 등 | 지역·산업 규제별 |

- **Artifact Reports**: 위 증빙 문서를 다운로드. 대부분 NDA 동의(클릭) 후 열람 가능하며, 일부는 공개(SOC 3, ISO 인증서 등).
- **Artifact Agreements**: BAA(HIPAA), GDPR 부속서(AWS GDPR DPA) 등 **AWS와의 계약 조항을 조직/계정 단위로 수락·관리**.
- 활용: 고객사 감사인이 "클라우드 사업자의 통제를 보여달라"고 할 때, 해당 보고서로 AWS 범위를 충당하고 고객은 자신의 범위에 집중한다.

:::warning[감사보고서는 보고서일 뿐]
Artifact의 SOC/ISO 보고서는 *AWS가 책임지는 범위*를 다룬다. 보고서 안의 **CUEC(고객이 구현해야 하는 보완 통제, Complementary User Entity Controls)** 섹션이 곧 고객의 숙제다. 이 부분이 Audit Manager·Config로 증명할 대상이 된다.
:::

## 3. AWS Audit Manager — 고객 증거 수집 자동화

특정 프레임워크(예: PCI DSS, SOC 2, GDPR, HIPAA, CIS 등)를 선택하면, 해당 통제에 매핑된 **증거(evidence)를 자동으로 지속 수집**해 감사 준비 보고서를 만든다.

| 구성요소 | 의미 |
|---|---|
| **Framework** | 통제 집합. AWS 제공 표준 프레임워크 또는 **커스텀 프레임워크** 정의 가능 |
| **Control** | 개별 통제. 증거 소스(데이터)를 매핑 |
| **Assessment** | 특정 범위(계정/리전)에 프레임워크를 적용해 실행하는 평가 단위 |
| **Evidence** | 자동 수집되는 근거. 수동 증거(문서) 업로드도 가능 |
| **Assessment Report** | 감사인 제출용 보고서. 증거를 묶어 산출 |

- **증거 소스 3종**: ① CloudTrail 사용자 활동 로그, ② AWS Config 규칙 평가 결과(구성 준수), ③ Security Hub 점검 결과. 여기에 API 호출 스냅샷, 수동 첨부를 더한다.
- **공통 통제 한 번 수집 → 여러 프레임워크 재사용**: 동일한 증거를 ISO·SOC·PCI 등 여러 평가에 매핑해 중복 수집을 줄인다(crosswalk).
- 효과: 감사 시즌마다 스크린샷·로그를 손으로 모으던 작업을 상시 자동화해 부담을 분산한다.

## 4. 상시 측정 — Config Conformance Pack + Security Hub 표준

증거는 "현재 상태가 기준을 충족하는가"를 **계속** 보여줘야 의미가 있다. 두 서비스가 상시 측정 축을 담당한다. → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md)

| 서비스 | 단위 | 역할 |
|---|---|---|
| **AWS Config** | 리소스 구성 + 규칙 | 리소스 변경 추적, 규칙으로 준수/위반 평가 |
| **Config Conformance Pack** | 규칙·교정 묶음(YAML 템플릿) | 프레임워크 단위 규칙 세트를 **조직 전체에 일괄 배포** |
| **Security Hub** | 보안 표준 + 통합 findings | 표준 점검(아래) + GuardDuty 등 결과 집계, 점수화 |

- **Config Conformance Pack**: PCI DSS, NIST, CIS, FedRAMP 등에 대응하는 **샘플 팩**을 제공하며, Organizations 연동으로 조직 단위 배포가 가능하다. 규칙과 자동 교정(remediation)을 코드로 묶어 관리한다.
- **Security Hub 보안 표준**: AWS Foundational Security Best Practices(FSBP), CIS AWS Foundations Benchmark, PCI DSS, NIST SP 800-53 등 표준에 따른 자동 점검을 수행하고 준수 점수를 산출한다. 결과는 ASFF(AWS Security Finding Format)로 통합된다. → [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md)
- **Config vs Security Hub**: Config는 *구성 상태와 변경*의 원천, Security Hub는 *보안 관점의 표준 점검과 집계 대시보드*. Audit Manager는 둘의 결과를 증거로 끌어다 쓴다.

## 5. 증빙 자동화 파이프라인

감사 시즌 부담을 줄이는 전형적 흐름:

1. **AWS Artifact** — AWS측 SOC/ISO/PCI 보고서·계약(BAA 등)을 조직 단위로 수락·보관.
2. **Config Conformance Pack** — 대상 프레임워크 규칙 세트를 조직 OU에 일괄 배포(상시 평가). → [Landing Zone & Control Tower — Preventive / Detective](./landing-zone-control-tower.md)
3. **Security Hub 표준** — FSBP/CIS/PCI 등 표준 활성화, 위반을 findings로 집계.
4. **Audit Manager** — 위 Config·Security Hub·CloudTrail 결과를 프레임워크 통제에 매핑해 증거 자동 수집.
5. **Assessment Report** — 감사인 제출용 보고서 생성, 부족분은 수동 증거 보완.

## 핵심 고려사항
- **범위(scope) 정의 우선**: 어떤 계정·리전·워크로드가 인증 범위인가를 먼저 확정해야 Audit Manager assessment와 Config 배포 범위가 정확해진다.
- **프레임워크 선택**: 규제가 직접 요구하는 표준(PCI, HIPAA 등)인지, 내부 베이스라인(CIS, FSBP)인지에 따라 표준/팩 조합이 달라진다. 한국 규제는 → [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md) · [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md)로 매핑.
- **자동 vs 수동 증거**: 정책·절차 문서, 교육 이수 같은 *조직적 통제*는 자동 수집되지 않으므로 수동 증거 업로드 프로세스를 병행해야 한다.
- **다중 계정**: Organizations 위임 관리자 계정에서 Config·Security Hub·Audit Manager를 중앙 집계하는 구조가 운영상 유리하다. → [멀티 계정 전략 — Organizations / SCP / RCP / Control Tower](../identity-access/multi-account-organizations.md)
- **비용**: Config는 기록된 구성 항목·규칙 평가 건수에, Security Hub는 점검·findings 수에 과금된다. 전 리소스 무차별 기록보다 범위 설계가 비용을 좌우한다.

## 흔한 함정
- "AWS가 ISO/PCI 인증을 받았으니 우리 워크로드도 준수" — 인증 범위는 AWS 인프라. 고객 범위(CUEC)는 별도 증명 대상이다.
- Artifact 보고서를 한 번 받고 끝 — 보고서엔 **유효기간/대상 기간**이 있다. 갱신본 추적 필요.
- Config 기록만 켜고 규칙·팩을 안 붙임 — 변경 이력은 쌓이나 *준수 판정*이 없어 증거로 약하다.
- Security Hub 표준을 켜고 findings를 방치 — 점수만 있고 교정·예외 처리 워크플로가 없으면 감사에서 역효과.
- 단일 계정 기준 설계 후 조직 확장 시 일관성 붕괴 — 처음부터 조직 단위 배포를 전제. → [Landing Zone & Control Tower — Preventive / Detective](./landing-zone-control-tower.md)

## 관련
- [글로벌 프레임워크 — ISO27001 / SOC2 / PCI-DSS / HIPAA / FedRAMP](./global-compliance-frameworks.md) · [지속 모니터링 — Config Rules / Conformance Pack](../detection-response/detection/continuous-monitoring.md) · [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md) · [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md)

### References
- [AWS Artifact 사용 설명서](https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html)
- [AWS Audit Manager 사용 설명서](https://docs.aws.amazon.com/audit-manager/latest/userguide/what-is.html) · [지원 프레임워크 목록](https://docs.aws.amazon.com/audit-manager/latest/userguide/framework-overviews.html)
- [AWS Config Conformance Packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html)
- [AWS Security Hub 보안 표준](https://docs.aws.amazon.com/securityhub/latest/userguide/standards-reference.html)
- [AWS Compliance Programs(인증 프로그램 전체)](https://aws.amazon.com/compliance/programs/)

