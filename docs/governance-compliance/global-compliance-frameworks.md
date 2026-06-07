---
title: "글로벌 프레임워크 — ISO27001 / SOC2 / PCI-DSS / HIPAA / FedRAMP"
sidebar_label: "글로벌 프레임워크 — ISO27001 / SOC2 / PCI-DSS / HIPAA / FedRAMP"
sidebar_position: 3
tags:
  - "거버넌스"
---
# 글로벌 컴플라이언스 프레임워크

:::info[한 줄 정의]
국제 보안 표준들은 한국 규제(ISMS-P, FSI, CSAP 등)의 토대이며, 다국적·수출 워크로드에는 직접 요구된다. 핵심은 "통제를 한 번 구현하고 여러 표준에 **매핑(crosswalk)** 한다"는 것, 그리고 각 표준에서 **AWS 책임과 고객 책임의 경계**(책임 공유)를 정확히 가르는 것이다.
:::

:::tip[표준의 성격 구분]
- **인증(certification)**: 제3자가 *체계가 갖춰졌음*을 증명 → ISO 27001, CSA STAR.
- **감사보고서(attestation)**: 감사인이 *기간 동안 통제가 작동했음*을 보고 → SOC 1/2/3.
- **적합성(compliance) 검증**: 규정 기준 충족 여부 → PCI DSS, HIPAA, FedRAMP.
- **통제 카탈로그(framework)**: 다른 표준의 재료가 되는 통제 목록 → NIST CSF / SP 800-53.
:::

## 1. 왜 중요한가
대부분의 조직은 ISO·SOC·PCI를 동시에 요구받는다. 표준마다 통제를 새로 구현하면 비용·중복이 폭증한다. 실제로는 표준 간 통제가 70~80% 겹치므로, **공통 통제를 한 번 설계·구현하고 표준별로 매핑**하는 것이 정석이다(NIST 800-53/CSF가 공통 모체 역할).

또한 각 표준은 AWS가 받은 인증(→ [AWS Artifact](./aws-compliance-services.md))이 *AWS 인프라 범위*를 충당하고, 그 위의 워크로드 통제는 고객이 증명한다는 **책임 공유** 구조 위에서만 정확히 해석된다. → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)

## 2. 프레임워크 한눈에

| 프레임워크 | 성격 | 핵심 내용 |
|---|---|---|
| **ISO 27001** | 정보보안 관리체계(ISMS) 인증 | Annex A 통제, 위험기반. 국제 공통 기준선 |
| **ISO 27017** | 클라우드 보안 가이드 | 27001 위에 클라우드 특화 통제 추가 |
| **ISO 27018** | 클라우드 PII 보호 | 클라우드 내 개인정보 처리자 통제 |
| **SOC 1 / 2 / 3** | AICPA 감사보고서 | SOC1=재무 관련 통제, SOC2=신뢰서비스기준(NDA), SOC3=공개 요약 |
| **PCI DSS** | 카드결제 데이터 보안 | 암호화·세분화·로깅, TLS 1.2+, 12개 요구사항 |
| **HIPAA** | 미국 의료정보(PHI) | Privacy/Security Rule, **BAA** 필요 |
| **FedRAMP** | 미국 연방 클라우드 승인 | Low/Moderate/High. AWS GovCloud·표준 리전 |
| **CSA STAR** | 클라우드 보안 인증/등록 | CCM 기반. Self-assessment ~ 제3자 인증 |
| **NIST CSF / SP 800-53** | 통제 카탈로그·프레임워크 | 다수 표준의 모체. Identify~Recover |

## 3. ISO 27001 / 27017 / 27018 (관리체계 + 클라우드)
- **ISO 27001**: 위험평가 → 통제 선택(SoA, 적용성 명세서) → 운영 → 지속 개선(PDCA)의 *관리체계* 인증. 특정 기술이 아니라 "프로세스가 돌아가는가"를 본다.
- **27017**은 클라우드 서비스 제공자/이용자 양측의 추가 통제(가상 환경 분리, 관리자 작업 모니터링 등), **27018**은 클라우드 내 PII 처리(동의·통지·삭제) 통제를 더한다.
- AWS는 이 인증들을 보유하며 인증서를 → [Artifact](./aws-compliance-services.md)에서 제공. 고객은 자신의 ISMS 범위에 AWS 통제를 *상속(inherit)* 받는다고 문서화하고, 나머지를 직접 통제한다.

## 4. SOC 1 / 2 / 3 (감사보고서)
- **Type I vs Type II**: Type I은 *특정 시점*의 통제 설계 적정성, **Type II**는 *일정 기간(보통 6~12개월)* 동안 통제가 실제로 작동했는지를 검증한다. 실무에서 의미 있는 것은 Type II.
- **신뢰서비스기준(TSC)** 5종: 보안(공통), 가용성, 처리 무결성, 기밀성, 프라이버시. SOC 2는 이 중 보안을 필수로 선택적 조합한다.
- AWS SOC 2 보고서는 NDA 동의 후 Artifact에서 열람. 보고서의 **CUEC**(고객 보완 통제) 절이 고객 숙제다. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)

## 5. PCI DSS (카드결제)
- 카드회원 데이터(CHD)·민감 인증데이터(SAD)를 다루는 모든 조직 대상. v4.0으로 전환됨.
- 핵심 요구: 네트워크 세분화(CDE 범위 축소), 저장/전송 암호화(TLS 1.2 이상), 강한 접근통제·MFA, 로깅·모니터링, 정기 취약점 점검.
- **AWS 매핑**: 세분화는 VPC/SG/NACL(→ [네트워크 세분화 — Lattice / Verified Access / PrivateLink](../infrastructure-network/network-segmentation.md)), 암호화는 KMS/ACM(→ [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) · [전송 중 암호화 — ACM / TLS termination](../data-protection/encryption-in-transit.md)), 로깅은 CloudTrail(→ [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)), 상시 측정은 PCI Conformance Pack/Security Hub PCI 표준(→ [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)).
- AWS는 PCI DSS Level 1 서비스 제공자. 단, **범위 내 서비스 목록**을 확인해 CDE를 적격 서비스로만 구성해야 한다.

## 6. HIPAA / FedRAMP / CSA STAR
- **HIPAA**: 미국 의료정보(PHI). AWS와 **BAA**(Business Associate Addendum)를 Artifact에서 수락해야 PHI를 적격 서비스에서 처리할 수 있다. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)
- **FedRAMP**: 미국 연방기관 대상 클라우드 보안 인증(Low/Moderate/High 영향 수준). AWS GovCloud(US)와 표준 상용 리전 일부가 승인 범위. NIST SP 800-53 통제 기반.
- **CSA STAR**: Cloud Security Alliance의 **CCM(Cloud Controls Matrix)** 기반. Level 1(self-assessment, CAIQ) → Level 2(제3자 인증/검증)로 단계화. 클라우드 특화 통제 매핑에 유용한 crosswalk 도구.

## 7. NIST CSF / SP 800-53 (공통 모체)
- **NIST CSF**: Govern·Identify·Protect·Detect·Respond·Recover(CSF 2.0은 Govern 추가)의 기능 분류. 표준이라기보다 위험관리 프레임워크.
- **SP 800-53**: 상세 통제 카탈로그. FedRAMP·다수 정부/산업 표준이 이를 차용한다. 다른 표준 간 매핑의 *기준 좌표* 역할.
- 활용: 내부 통제를 800-53/CSF 좌표로 표준화해두면 ISO·SOC·PCI·한국 ISMS-P로 매핑이 수월하다.

## 8. 책임 공유 매핑과 한국 규제 연결
- 모든 글로벌 표준은 책임 공유 위에서 해석된다: **AWS = of the cloud(인프라·물리·하이퍼바이저), 고객 = in the cloud(구성·데이터·접근통제)**. → [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)
- 한국 규제는 이 국제 표준들을 토대로 한다:
  - **ISMS-P**: ISO 27001/27701 계열과 통제가 상당 부분 대응 → [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md)
  - **CSAP**: 공공 클라우드 보안인증 → [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md)
  - **금융(FSI)**: 전자금융감독규정·금융보안원 평가 → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md)
  - **개인정보**: PIPA, ISO 27018과 연계 → [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](./pipa-privacy.md)

## 핵심 고려사항
- **어떤 표준이 강제인가 vs 권장인가**: 규제로 강제되는 표준(PCI, HIPAA, FedRAMP, 한국 CSAP/FSI)과 시장이 기대하는 베이스라인(ISO, SOC2)을 구분해 우선순위를 둔다.
- **crosswalk 우선 설계**: 800-53/CSF 또는 CCM을 기준 좌표로 통제를 한 번 정의하고 표준별 매핑표를 운영하면 중복 감사 비용이 줄어든다.
- **AWS 인증 범위 확인**: 표준마다 *적격 서비스·리전 목록*이 다르다. 워크로드가 쓰는 서비스가 해당 인증 범위에 포함되는지 확인.
- **증빙 운영**: AWS측은 Artifact, 고객측은 Audit Manager·Config·Security Hub로 상시 증거화. → [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md)

## 흔한 함정
- "AWS가 인증을 받았으니 우리도 준수" — 인증은 AWS 인프라 범위. 고객 워크로드는 별도 증명.
- SOC 2 Type I만 받고 Type II로 오인 — 시점 검증과 기간 검증은 신뢰 수준이 다르다.
- PCI에서 범위(CDE) 미축소 — 세분화 없이 전 환경이 감사 대상이 되어 비용 폭증.
- 표준마다 통제를 따로 구현 — crosswalk 없이 중복 운영하면 감사 피로가 누적.
- 비적격 서비스로 PHI/CHD 처리 — BAA·PCI 범위 밖 서비스 사용으로 적합성 상실.

## 관련
- [AWS 컴플라이언스 서비스 — Artifact / Audit Manager](./aws-compliance-services.md) · [ISMS-P 통제항목 ↔ AWS 매핑](./ismsp-aws-control-mapping.md) · [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](./korea-fsi-regulations.md) · [CSAP 공공 클라우드 보안인증 (상/중/하)](./csap.md) · [개인정보보호법(PIPA) — 가명정보 / 마이데이터 / 데이터 주권](./pipa-privacy.md) · [AWS 책임 공유 모델 (Shared Responsibility)](../foundations/shared-responsibility-model.md)

### References
- [AWS Compliance Programs](https://aws.amazon.com/compliance/programs/) · [Services in Scope by Compliance Program](https://aws.amazon.com/compliance/services-in-scope/)
- [ISO/IEC 27001 at AWS](https://aws.amazon.com/compliance/iso-27001-faqs/) · [SOC at AWS](https://aws.amazon.com/compliance/soc-faqs/)
- [PCI DSS at AWS](https://aws.amazon.com/compliance/pci-dss-level-1-faqs/) · [HIPAA at AWS](https://aws.amazon.com/compliance/hipaa-compliance/) · [FedRAMP at AWS](https://aws.amazon.com/compliance/fedramp/)
- [CSA STAR at AWS](https://aws.amazon.com/compliance/csa/) · [NIST CSF](https://www.nist.gov/cyberframework) · [NIST SP 800-53](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

