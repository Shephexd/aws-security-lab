---
title: "공급망 보안 — SBOM / 이미지 서명 / Signer"
sidebar_label: "공급망 보안 — SBOM / 이미지 서명 / Signer"
sidebar_position: 4
tags:
  - "고급"
---
# 공급망 보안 (Supply Chain Security)

:::info[한 줄 정의]
"우리 코드"만이 아니라 *우리가 끌어다 쓰는 모든 것*(오픈소스 의존성·베이스 이미지·빌드 도구·아티팩트)의 **출처(provenance)와 무결성(integrity)** 을 증명·검증하는 것. SolarWinds·Log4Shell 이후 이사회 안건이 됐다.
:::

## 1. 왜 중요한가
현대 소프트웨어는 직접 작성한 코드가 일부에 불과하고, 대부분은 외부 의존성·베이스 이미지·CI 파이프라인 산출물이다. 공격자는 가장 약한 고리—오염된 패키지, 변조된 빌드, 탈취된 서명 키—를 노린다. 방어의 핵심 질문은 세 가지다.

- **무엇이 들어있나?** 구성요소를 알아야 취약점에 대응한다 → SBOM.
- **어디서 왔고 어떻게 만들어졌나?** 출처·빌드 과정을 증명한다 → provenance / SLSA.
- **변조되지 않았나?** 배포물의 무결성을 서명으로 검증한다 → code signing / 이미지 서명.

이 셋이 빠지면 Log4Shell 같은 사고 때 "우리가 영향받나?"에 즉답할 수 없다.

## 2. SBOM — 소프트웨어 자재명세
SBOM은 소프트웨어에 포함된 모든 구성요소·버전·라이선스·의존관계 목록이다. 표준 포맷이 있어 도구 간 교환·자동 분석이 가능하다.

| 포맷 | 주관 | 특징 |
| --- | --- | --- |
| **SPDX** | Linux Foundation (ISO/IEC 5962) | 라이선스 컴플라이언스 강점, 국제표준 |
| **CycloneDX** | OWASP | 보안·취약점 중심, 경량 |

- **Amazon Inspector SBOM 내보내기**: Inspector가 스캔한 리소스(EC2·Lambda·ECR 이미지)의 SBOM을 **CycloneDX/SPDX** 포맷으로 S3에 내보낸다. 이를 외부 분석 도구에 연계할 수 있다.
- SBOM은 한 번 만들고 끝이 아니라 **빌드마다 생성·보관**해야 한다. 새 취약점이 공개되면 보관된 SBOM을 질의해 영향받는 빌드를 즉시 식별한다.

## 3. 의존성 / 이미지 스캔 (SCA)
| 대상 | 도구 | 내용 |
| --- | --- | --- |
| 컨테이너 이미지 | **Amazon ECR 이미지 스캔**(기본/향상) | 푸시 시·지속 스캔, 향상 스캔은 Inspector 기반 |
| EC2·Lambda·ECR | **Amazon Inspector** | OS·언어 패키지 취약점 지속 평가, 우선순위화 |
| 신뢰 레지스트리 | ECR | 승인된 이미지 출처로 사용, 리포지토리 정책·태그 불변성 |

- ECR **향상 스캔(enhanced scanning)** 은 Amazon Inspector를 백엔드로 OS+언어 패키지를 지속 스캔하고, 새 CVE가 나오면 기존 이미지도 재평가한다(기본 스캔은 OS 중심·푸시 시점).
- **태그 불변성(immutable tags)** 으로 같은 태그가 다른 이미지로 덮어써지는 것을 막아 공급망 혼동을 방지한다. → [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](../application-workload/appsec/compute-container-security.md)

## 4. 코드 서명 & 이미지 서명 (무결성)
서명은 "이 아티팩트가 신뢰된 빌더가 만든 그대로이며 변조되지 않았다"를 검증 가능하게 한다. 디지털 서명 기초는 → [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md)

| 대상 | 도구 | 내용 |
| --- | --- | --- |
| Lambda·컨테이너 이미지 | **AWS Signer** | 코드 서명 프로파일로 서명, 배포 시 서명 검증 |
| Lambda 코드 서명 | AWS Signer + Lambda Code Signing 구성 | 미서명/변조 코드 배포 차단 |
| 컨테이너 이미지 | AWS Signer 컨테이너 서명 / Sigstore(cosign) | OCI 레지스트리에 서명 첨부 |
| 검증 시점 | 배포·어드미션 단계 | 정책으로 미서명 이미지 거부 |

- 서명만으로는 부족하다: **검증을 강제**해야 한다. Lambda Code Signing 구성이나 쿠버네티스 어드미션 정책으로 "검증 통과 아티팩트만 실행"을 강제한다. → [EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy](../application-workload/appsec/eks-kubernetes-security.md)
- 서명 키는 KMS/HSM으로 보호하고 발급 권한을 IAM으로 통제한다(키 탈취 = 서명 위조).

## 5. 빌드 출처 증명 (Provenance / SLSA / Attestation)
서명이 "변조 여부"라면, **provenance**는 "어떻게·무엇으로부터 만들어졌나"를 증명한다.

| 개념 | 의미 |
| --- | --- |
| **Attestation** | 빌드 입력·환경·산출물에 대한 서명된 진술(증명서) |
| **SLSA** | 공급망 무결성 성숙도 프레임워크(빌드 출처·격리·검증 수준을 단계로 정의) |
| in-toto | attestation 생성·검증 사양 |
| 원천 | SBOM + provenance attestation으로 "구성요소 + 빌드 경로" 완성 |

- **SLSA(Supply-chain Levels for Software Artifacts)** 는 빌드 출처를 얼마나 강하게 증명·격리·검증하는지 단계로 정의한다. 낮은 단계는 "출처 기록 존재", 높은 단계는 "위변조 불가능한 격리 빌드 + 검증"으로 올라간다.
- CI/CD가 attestation을 생성하고 배포 게이트가 이를 검증하면, "신뢰된 파이프라인이 만든 것"만 프로덕션에 들어간다. CI/CD 무결성 전반은 → [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md)

## 6. CI/CD 파이프라인 무결성
- 파이프라인 자체가 공급망의 일부다: 빌드 자격증명·러너·아티팩트 저장소가 오염되면 모든 산출물이 위험하다.
- 통제: 최소권한 빌드 역할, OIDC 단기 자격증명(장기 키 제거), 격리된 빌더, 아티팩트 출처 고정, 시크릿을 Secrets Manager로. → [시크릿 관리 — Secrets Manager / Parameter Store](../data-protection/secrets-management.md)
- "왼쪽으로 이동(shift-left)": SBOM 생성·SCA·서명을 파이프라인 단계로 내재화해 빌드 시점에 검증한다.

## 핵심 고려사항
- 빌드마다 SBOM(SPDX/CycloneDX)을 생성·보관해 신규 CVE에 대한 영향 분석을 가능하게 한다.
- ECR 향상 스캔 + Inspector로 OS·언어 패키지를 지속 평가하고, 태그 불변성으로 혼동을 막는다.
- AWS Signer로 서명하고, 배포/어드미션 단계에서 **검증을 강제**한다(서명만으로는 불충분).
- SLSA/attestation으로 빌드 출처를 증명하고, 검증된 파이프라인 산출물만 배포한다.
- 빌드 키·자격증명을 KMS/Secrets Manager·OIDC 단기 토큰으로 보호한다.

## 흔한 함정
- 의존성을 끌어 쓰면서 SBOM을 만들지 않아 신규 취약점 영향 범위를 모름.
- 이미지를 서명만 하고 배포 시 검증을 강제하지 않아 의미가 없음.
- 같은 태그를 덮어쓰는 가변 태그 사용으로 어떤 이미지가 돌고 있는지 불확실.
- 빌드 파이프라인에 장기 IAM 키·과대권한 부여 → 파이프라인 탈취 시 전면 오염.
- 베이스 이미지·서드파티 모델/패키지의 출처·서명을 검증하지 않고 신뢰.

## 관련
- [DevSecOps — CI/CD / SAST / DAST / IaC / SBOM](../application-workload/appsec/devsecops.md) · [컴퓨트 & 컨테이너 보안 — EC2 / ECS / ECR / Lambda](../application-workload/appsec/compute-container-security.md) · [EKS / Kubernetes 보안 — IRSA / Pod Identity / Network Policy](../application-workload/appsec/eks-kubernetes-security.md) · [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md) · [시크릿 관리 — Secrets Manager / Parameter Store](../data-protection/secrets-management.md)

### References
- [Amazon Inspector SBOM 내보내기](https://docs.aws.amazon.com/inspector/latest/user/sbom-export.html)
- [Amazon ECR 이미지 스캔](https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html)
- [AWS Signer](https://docs.aws.amazon.com/signer/latest/developerguide/Welcome.html) · [Lambda 코드 서명](https://docs.aws.amazon.com/lambda/latest/dg/configuration-codesigning.html)
- [SLSA 프레임워크](https://slsa.dev/) · [SPDX](https://spdx.dev/) · [CycloneDX](https://cyclonedx.org/)

