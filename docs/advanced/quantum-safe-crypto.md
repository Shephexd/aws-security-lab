---
title: "양자내성 암호 (Post-Quantum Cryptography)"
sidebar_label: "양자내성 암호 (Post-Quantum Cryptography)"
sidebar_position: 3
tags:
  - "고급"
---
# 양자내성 암호 (PQC)

:::info[한 줄 정의]
양자내성 암호(PQC, Post-Quantum Cryptography)는 충분히 강력한 양자컴퓨터가 등장해도 깨지지 않도록 설계된 암호 알고리즘 체계다. RSA·ECC 같은 현행 공개키 암호는 양자 알고리즘에 취약하므로, *장기 보존 데이터와 장수명 시스템*은 지금부터 전환을 준비해야 한다. → [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md)
:::

:::tip[큰 그림]
양자컴퓨터의 실용화 시점은 불확실하지만, 위협은 이미 현재형이다. 공격자가 오늘 암호화된 트래픽을 수집해 보관했다가 미래에 복호화하는 **"Harvest now, decrypt later"**(지금 수집, 나중에 복호화) 전략 때문이다. 따라서 첫 단계는 알고리즘 전면 교체가 아니라, *알고리즘을 쉽게 바꿀 수 있는 구조*(crypto agility)를 갖추는 것이다.
:::

## 1. 왜 중요한가
양자 위협의 본질은 *비대칭 암호의 수학적 기반*이 무너진다는 점이다.

- 공격자는 미래의 복호화를 노리고 *지금* 암호문을 수집한다. 수십 년 기밀(의료·금융·지식재산·국가기밀)은 현재 암호화돼 있어도 이미 위험에 노출돼 있다.
- 펌웨어 서명·인증서·코드 서명처럼 *수명이 긴* 신뢰 구조는 양자컴퓨터 등장 전에 전환을 끝내야 한다.
- 전환에는 인벤토리 파악, 의존성 분석, 검증, 호환성 확보가 필요해 수년이 걸린다. 위협이 가시화된 뒤 시작하면 늦다.

## 2. 양자 위협의 메커니즘 (Shor / Grover)
양자 알고리즘은 비대칭 암호와 대칭 암호에 서로 다른 영향을 준다.

| 알고리즘 | 영향받는 암호 | 효과 | 대응 |
| --- | --- | --- | --- |
| **Shor** | RSA, ECC, DH 등 비대칭 | 인수분해·이산로그를 다항시간에 풀어 *사실상 무력화* | PQC(ML-KEM/ML-DSA)로 교체 |
| **Grover** | AES 등 대칭 | 키 탐색을 제곱근으로 가속 → 체감 강도 절반 | **AES-256 사용**(128비트 상당 강도 유지) |

- 비대칭 암호는 Shor에 의해 *근본적으로* 깨지므로 알고리즘 자체를 교체해야 한다.
- 대칭 암호와 해시는 키·출력 길이를 늘리면 충분하다. AES-256과 SHA-384/512 사용이 권장된다. → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)

## 3. NIST PQC 표준 (FIPS 203/204/205)
NIST는 2024년 8월 첫 PQC 표준 3종을 확정했다.

| 표준 | 알고리즘 | 구 이름 | 용도 |
| --- | --- | --- | --- |
| **FIPS 203** | ML-KEM | Kyber | 키 캡슐화(키 교환) — TLS 세션 키 보호 |
| **FIPS 204** | ML-DSA | Dilithium | 디지털 서명(격자 기반) — 범용 서명 |
| **FIPS 205** | SLH-DSA | SPHINCS+ | 해시 기반 서명 — 보수적 대안, 큰 서명 크기 |

- ML-KEM은 *키 교환*, ML-DSA·SLH-DSA는 *서명* 용도로 역할이 다르다.
- SLH-DSA는 격자가 아닌 해시 기반이라 가정이 가장 보수적이지만 서명 크기·성능 비용이 크다. 격자 계열에 대한 헤지로 쓰인다.

## 4. AWS의 하이브리드 PQC TLS
AWS는 *완전 PQC 전환에 앞서* 고전 암호와 PQC를 결합한 하이브리드 방식을 채택한다.

| 영역 | 지원 내용 |
| --- | --- |
| **KMS** | API 호출에 하이브리드 PQC TLS(ECDHE + ML-KEM) 키 교환 지원 |
| **ACM** | PQC TLS 종단점 구성 지원 |
| **Secrets Manager** | 하이브리드 PQC TLS로 시크릿 전송 보호 |
| **ALB / NLB** | PQC 키 교환을 통한 TLS 연결 보호(2025년 도입) |

:::note[하이브리드를 쓰는 이유]
고전(ECDHE)과 PQC(ML-KEM) 키 교환을 *동시에* 수행해, 둘 중 하나만 안전해도 세션이 보호된다. PQC 알고리즘은 비교적 새로워 단독 신뢰는 시기상조이므로, 검증이 충분히 쌓이기 전까지의 안전장치다.
:::

- KMS·ACM·Secrets Manager는 ML-KEM 기반 하이브리드 PQC TLS를 지원한다.
- 키 교환만 PQC로 보호되며, 서명·인증서 PQC 전환은 별개 과제로 진행된다.

## 5. Crypto agility (암호 민첩성)
마이그레이션의 선결 조건은 *알고리즘을 쉽게 교체할 수 있는 설계*다.

| 원칙 | 설명 |
| --- | --- |
| 알고리즘 하드코딩 금지 | 암호 알고리즘·키 길이를 설정/추상화 계층으로 분리 |
| 암호 인벤토리 | 어디서 어떤 알고리즘·키·인증서를 쓰는지 목록화 |
| 의존성 식별 | 라이브러리·프로토콜·HSM·인증서 체인의 PQC 지원 여부 점검 |
| 관리형 서비스 활용 | TLS 종단을 KMS/ACM/ALB 등에 위임하면 PQC 전환이 단순해짐 |

- 가장 먼저 *무엇을 어디서 암호화하는지* 인벤토리를 확보해야 우선순위를 정할 수 있다.
- 관리형 종단(ACM/ALB/KMS)에 TLS를 위임하면, AWS가 PQC를 도입할 때 애플리케이션 변경 없이 혜택을 받는다.

## 핵심 고려사항
- **장기 데이터부터**: 보존 기간이 길수록 "harvest now, decrypt later" 위험이 크다. 장수명 기밀을 우선 식별한다.
- **대칭은 키 길이로 대응**: AES-256·SHA-384 이상으로 Grover 영향을 흡수한다.
- **하이브리드로 점진 전환**: PQC 단독보다 고전+PQC 결합이 현 단계의 안전한 선택이다.
- **agility가 먼저**: 알고리즘 교체 가능성을 설계에 내장하는 것이 단일 알고리즘 채택보다 중요하다.
- **인증서·서명 전환은 별도 과제**: 키 교환 PQC와 서명 PQC는 일정·의존성이 다르다.

## 흔한 함정
- "양자는 먼 미래"라고 미루다 *이미 수집된* 장기 기밀의 미래 복호화 위험을 방치.
- 암호 알고리즘을 코드에 하드코딩해 전환 시 전면 재작성 필요.
- 대칭 암호까지 PQC로 바꾸려는 과잉 대응(대칭은 키 길이 증대로 충분).
- 인벤토리 없이 전환을 시작해 누락된 종단점이 남음.
- PQC 단독 채택으로 신생 알고리즘에 대한 단일 의존 위험 자초.

## 관련
- [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md) · [PKI · X.509 · TLS 핸드셰이크](../foundations/pki-x509-tls.md) · [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)

### References
- **FIPS 203 / 204 / 205** (NIST, 2024-08) — [nist.gov](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)
- **ML-KEM PQC TLS in AWS KMS, ACM, Secrets Manager** — [aws.amazon.com](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/)
- **Hybrid post-quantum TLS with AWS KMS** — [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/pqtls.html)
- **AWS post-quantum cryptography** — [aws.amazon.com](https://aws.amazon.com/security/post-quantum-cryptography/)

