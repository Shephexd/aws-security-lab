---
title: "암호 기초 — 대칭/비대칭/해시/서명"
sidebar_label: "암호 기초 — 대칭/비대칭/해시/서명"
sidebar_position: 3
tags:
  - "기초"
---
# 암호 기초 (Cryptography Fundamentals)

:::info[한 줄 정의]
암호는 **기밀성(Confidentiality)·무결성(Integrity)·인증(Authenticity)·부인방지(Non-repudiation)** 를 수학적으로 보장하는 도구다. KMS·ACM·Secrets Manager는 모두 이 4가지의 포장지일 뿐이다.
:::

:::tip[표준의 큰 그림 (외워둘 가치 있음)]
- **FIPS**(연방정보처리표준) = "무엇을 쓸 수 있는가"의 *의무* 알고리즘 사양 (AES, SHA, 서명, PQC).
- **NIST SP 800 시리즈** = "어떻게 안전하게 쓰는가"의 *가이드* (운영모드, 키관리, 전환).
- **RFC** = 프로토콜에서의 *실제 사용* (TLS, JWT 등).
- 한국 FSI/ISMS-P는 종종 "**검증된 암호모듈**(KCMVP) + 승인된 알고리즘"을 요구 → 알고리즘 자체보다 *모듈 검증*이 쟁점인 경우가 많다.
:::

## 1. 왜 중요한가 (First Principle)
고객이 "S3 암호화 켜면 안전한가요?"라고 물을 때, *무엇으로부터* 안전한지 구분해야 한다. 저장 암호화(at-rest)는 디스크 탈취·스냅샷 유출을 막지만, 권한 있는 API 호출자는 평문을 받는다. 이걸 알아야 "암호화만으로 접근통제를 대체할 수 없다"는 핵심 조언을 할 수 있다.

암호는 보호하는 데이터의 **상태 3가지**로 나눠 생각한다:
- **저장(at-rest)** — 디스크/객체. AES, envelope encryption.
- **전송(in-transit)** — 네트워크. TLS. → [PKI · X.509 · TLS 핸드셰이크](./pki-x509-tls.md)
- **사용 중(in-use)** — 메모리. Confidential Computing. → [Nitro Enclaves / Confidential Computing](../data-protection/nitro-enclaves-confidential-computing.md)

## 2. 대칭키 암호 (Symmetric)
같은 키로 암호화/복호화. 빠르다(하드웨어 AES-NI) → 대용량 데이터 암호화에 사용. 표준: **FIPS 197 (AES)**, 운영모드: **NIST SP 800-38 시리즈**.

| 알고리즘 | 표준/모드 | 비고 |
| --- | --- | --- |
| **AES-256-GCM** | SP 800-38D | **AEAD**(암호화+무결성 동시). TLS·AWS 기본. nonce 재사용 금지 |
| AES-GCM-SIV | RFC 8452 | nonce 오용에 내성(nonce-misuse resistant). 상태/난수 보장 어려울 때 |
| AES-256-CBC | SP 800-38A | 무결성 별도(Encrypt-then-MAC 필요), **padding oracle** 취약 이력 |
| AES-XTS | SP 800-38E | 디스크/블록 암호화 전용(EBS류) |
| ChaCha20-Poly1305 | RFC 8439 | AES-NI 없는 모바일/저전력에서 유리, AEAD |
| ~~DES/3DES~~ | - | **폐기**(SP 800-131A) — 사용 금지 |

- **AEAD (Authenticated Encryption with Associated Data)**: 암호화 + 무결성 + (헤더 등) 관련 데이터 인증을 한 번에. "암호화는 됐는데 무결성이 없다"는 흔한 설계 실수를 GCM이 구조적으로 막는다. CBC는 별도 MAC을 **Encrypt-then-MAC** 순서로 붙여야 안전.
- **GCM nonce(IV) 재사용 = 치명적(catastrophic)**: 같은 키로 nonce를 두 번 쓰면 인증 서브키(H)가 노출되어 *위조(forgery)* 가 가능해지고 평문 차이가 새어나간다. NIST SP 800-38D는 IV 유일성을 **결정적 카운터** 또는 *충분한 강도의 난수*로 보장하라고 규정. 96-bit 랜덤 nonce는 같은 키로 약 2³²회 이후 충돌 위험 → 대량 암호화 시 키 로테이션 또는 **AES-GCM-SIV** 고려.
- 흔한 함정: 앱이 직접 GCM을 쓰며 nonce를 카운터 없이 재사용하는 경우로, 실무 사고가 잦다. KMS/Encryption SDK가 nonce와 키를 관리해주는 이유다.

## 3. 비대칭키 암호 (Asymmetric / Public-key)
공개키-개인키 쌍. 느리다 → **키 교환·서명·작은 데이터**에만. 서명 표준: **FIPS 186-5**.

| 용도 | 알고리즘 | 비고 |
| --- | --- | --- |
| 키 합의(교환) | **ECDH(E)**, (구)RSA 키교환 | TLS 1.3은 ECDHE만(PFS) |
| 디지털 서명 | **ECDSA**(P-256/384), **EdDSA**(Ed25519), RSA-PSS | FIPS 186-5는 EdDSA 추가 |
| 작은 데이터 암호화 | RSA-OAEP | 키 래핑 등 |

### 키 강도 등가표 (NIST SP 800-57 Part 1 Rev.5)
"RSA 2048이면 충분한가" 같은 질문의 근거가 된다. *보안 강도(security strength, 비트)* 기준으로 비대칭 키는 대칭보다 훨씬 길어야 한다.

| 보안강도 | 대칭(AES) | RSA(모듈러스) | ECC(곡선) | 비고 |
| --- | --- | --- | --- | --- |
| 112-bit | 3TDEA | RSA-2048 | P-224 | 레거시 최저선(2030 전후 단계적 종료) |
| **128-bit** | **AES-128** | **RSA-3072** | **P-256** | 현재 표준 권장 |
| 192-bit | AES-192 | RSA-7680 | P-384 | 고보증 |
| 256-bit | AES-256 | RSA-15360 | P-521 | 장기/최고 |

> 통찰: **256-bit ECC(P-256) ≈ RSA-3072 ≈ AES-128**. RSA는 보안강도를 올릴수록 키가 *기하급수적으로* 커져(15360-bit!) 비현실적 → 그래서 TLS/모바일/IoT가 ECC로 이동. 정수 분해(RSA)는 준지수적, AES 무차별대입은 지수적이라 생기는 차이.

- **하이브리드 암호 (실제 동작)**: 비대칭으로 *대칭 세션키를 안전하게 합의/전달* → 이후 빠른 대칭키로 데이터 암호화. TLS 핸드셰이크와 KMS **envelope encryption**이 정확히 이 패턴. → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)

## 4. 해시 & MAC (무결성)
| 종류 | 용도 | 알고리즘 / 표준 |
| --- | --- | --- |
| 암호학적 해시 | 무결성·핑거프린트 | **SHA-256/384/512** (FIPS 180-4), **SHA-3** (FIPS 202). MD5/SHA-1 **금지** |
| MAC | 키 있는 무결성/인증 | **HMAC**(FIPS 198-1), KMAC, AES-GMAC |
| 비밀번호 해시 | 저장용 (느려야 함) | **Argon2id**(RFC 9106) > scrypt > bcrypt > PBKDF2 |
| KDF | 키 파생 | HKDF(RFC 5869), PBKDF2(SP 800-132) |

- **해시의 3대 성질**: 역상저항(preimage)·제2역상저항·충돌저항(collision). SHA-1은 충돌이 실증되어(2017 SHAttered) 서명/인증서에서 퇴출. MD5는 오래전 붕괴.
- **HMAC ≠ 해시**: HMAC = 데이터가 *변조되지 않았고 + 비밀키를 아는 사람이 만들었음* 을 증명. JWT의 HS256이 이것. 단순 `SHA256(key‖msg)`는 length-extension 공격 가능 → 반드시 HMAC 구조 사용.

### 비밀번호 저장 (OWASP 권장 파라미터)
일반 해시(SHA-256)는 *빠른 게 장점*이라 비밀번호엔 **부적합**(GPU로 초당 수십억 회 대입). 비밀번호는 **느리고 + salt + (메모리 강성)** 알고리즘으로.

| 알고리즘 | 권장 파라미터 (OWASP) | 언제 |
| --- | --- | --- |
| **Argon2id** | 최소 m=19 MiB, t=2, p=1 (또는 m=46 MiB, t=1, p=1) | 1순위 |
| scrypt | N=2¹⁷, r=8, p=1 | Argon2 없을 때 |
| bcrypt | work factor ≥ 10, **입력 72 byte 제한 주의** | 레거시 |
| PBKDF2 | HMAC-SHA256, 반복수 높게(수십만+) | FIPS 필수 환경 |

- bcrypt는 72바이트 초과를 잘라버림 → 긴 패스프레이즈 취약. 사전 SHA-256 해시 후 입력 등 우회 필요.
- salt(사용자별 고유)는 레인보우테이블 방어, pepper(서버 비밀)는 DB 유출 시 추가 방어.

## 5. 디지털 서명 vs 암호화 (자주 혼동)
- **암호화(기밀성)**: 공개키로 잠그고 → 개인키로 연다.
- **서명(인증+무결성+부인방지)**: 개인키로 서명하고 → 공개키로 검증한다.
- 실제로는 *데이터 전체가 아니라 데이터의 해시*에 서명한다(성능+안전).
- 적용처: 코드 서명(AWS Signer), 컨테이너 이미지 서명(→ [공급망 보안 — SBOM / 이미지 서명 / Signer](../advanced/supply-chain-sbom.md)), JWT 서명, TLS 인증서, SAML assertion.

## 6. 키 관리 라이프사이클 (서비스 선택의 진짜 기준)
생성 → 배포 → 사용 → **로테이션** → 폐기 → 백업/복구. 알고리즘이 아무리 강해도 키 관리가 약하면 전부 무너진다. 가이드: **NIST SP 800-57**.
- **Key hierarchy / Envelope**: 루트키(KEK, HSM 보관) → 데이터 암호화 키(DEK) → 데이터. 상위 키만 잘 지키면 됨. → [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md)
- **Cryptoperiod**: 키마다 사용 기간 한도 설정(SP 800-57) → 정기 로테이션.
- **FIPS 140-3 검증 HSM** = 키가 하드웨어 밖으로 평문으로 안 나온다. 등급(Level 1~4) 중 **Level 3**가 물리적 변조 방지+신원기반 인증.
  - **AWS KMS**: 2024년 말 기준 **FIPS 140-3 Security Level 3** 검증 HSM 사용 → 과거 Level 3 충족을 위해 CloudHSM이 필수였던 요건을 KMS 단독으로 충족 가능해짐(고객에게 중요한 변화).
  - **AWS CloudHSM**: 신형 `hsm2m.medium`이 FIPS 140-3 Level 3 인증(Cert #4703, 2024 GA). 단일 테넌트 전용 HSM.
  - 선택: 멀티테넌트 관리형 = KMS / 전용 단일테넌트·키 완전통제·XKS = CloudHSM. → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 7. 알고리즘 선택 & 폐기 (Crypto Agility)
"무엇을 쓰지 말아야 하나"가 실무에선 더 중요. 전환 가이드: **NIST SP 800-131A**.
- ❌ 금지/퇴출: DES/3DES, RC4, MD5, SHA-1(서명), RSA-1024, ECB 모드, TLS 1.0/1.1, SSL 전부.
- ✅ 현재 기준선: AES-128 이상, SHA-256 이상, RSA-3072 또는 ECC P-256 이상, TLS 1.2(가능하면 1.3).
- **Crypto agility**: 알고리즘을 코드에 하드코딩하지 말고 *교체 가능*하게 설계 → 다음 절(PQC) 대비의 핵심.

## 8. 양자내성 암호 (PQC)
충분히 강한 양자컴퓨터는 Shor 알고리즘으로 **RSA/ECC(비대칭)를 무력화**한다. 대칭(AES)·해시는 Grover로 *체감 강도 절반* → AES-256이면 사실상 안전.
- **"Harvest now, decrypt later"**: 지금 암호문을 훔쳐 두었다가 미래에 복호화 → *장기 기밀(수십 년 보존) 데이터는 지금부터 위험*. FSI/의료/국가기밀에서 실질 이슈.
- **NIST 최초 PQC 표준 (2024-08-14 확정)**:
  - **FIPS 203 — ML-KEM** (구 CRYSTALS-Kyber): 키 캡슐화(키 교환) → RSA/ECDH 대체.
  - **FIPS 204 — ML-DSA** (구 CRYSTALS-Dilithium): 격자기반 디지털 서명(기본).
  - **FIPS 205 — SLH-DSA** (구 SPHINCS+): 해시기반 서명(백업 가정).
- **AWS 적용**: KMS·ACM·Secrets Manager가 **하이브리드 PQC TLS(ECDH + ML-KEM)** 지원. s2n-tls로 클라이언트가 PQC 선호 설정 가능. (구) Kyber 지원은 2025년까지, 2026년 ML-KEM으로 전면 전환 예정. ALB/NLB도 PQC 키교환 지원 추가(2025).
- 고객 조언: "양자는 먼 얘기"가 아니라 → ① **crypto agility 먼저 확보** ② 장기 기밀은 하이브리드 PQC TLS 적용 검토. → [양자내성 암호 (Post-Quantum Cryptography)](../advanced/quantum-safe-crypto.md)

## 9. 자주 받는 질문
- 암호화를 켰다고 곧 안전한 것은 아니다. *누구로부터* 보호하는지를 따져야 하며, **키 접근 권한이 곧 데이터 접근 권한**이다.
- 어떤 알고리즘을 쓰는지보다 **키를 누가 통제하는지(CMK vs AWS-managed), 로테이션 주기, 접근 로그(CloudTrail)** 가 실제 리스크를 좌우한다.
- RSA 2048은 112-bit 강도로 단계적 종료 대상이다. 신규는 RSA-3072/P-256(128-bit) 이상을 권장한다.
- 컴플라이언스(FSI/ISMS-P) 환경에서는 고객의 키 통제(CMK/BYOK/CloudHSM)와 검증된 암호모듈(FIPS 140-3 / KCMVP) 요구가 흔하다. → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)

## 10. 흔한 함정
- GCM **nonce/IV 재사용**, CBC를 MAC 없이 사용, ECB 모드, MD5/SHA-1 잔존.
- 비밀번호를 일반 SHA-256(빠른 해시)로만 저장(salt·느린 KDF 없음).
- 단순 `hash(key‖msg)` (length-extension) — HMAC을 써야 함.
- RSA 키교환(PFS 없음) 잔존, 키와 데이터를 같은 신뢰 경계에 보관.
- 알고리즘 하드코딩 → PQC/폐기 전환 불가(crypto agility 부재).

## 관련
- [PKI · X.509 · TLS 핸드셰이크](./pki-x509-tls.md) · [KMS & Envelope Encryption](../data-protection/kms-envelope-encryption.md) · [인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2](./authentication-protocols.md) · [양자내성 암호 (Post-Quantum Cryptography)](../advanced/quantum-safe-crypto.md)

### References (권위 출처)
- **FIPS 197** (AES), **FIPS 180-4** (SHA-2), **FIPS 202** (SHA-3), **FIPS 198-1** (HMAC), **FIPS 186-5** (디지털 서명)
- **FIPS 203/204/205** (PQC, 2024-08) — [NIST 발표](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)
- **NIST SP 800-57** Part 1 Rev.5 (키관리·강도 등가표) — [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final)
- **NIST SP 800-38D** (GCM/GMAC), **SP 800-131A** (알고리즘 전환), **SP 800-132** (PBKDF2)
- **OWASP** Password Storage Cheat Sheet — [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · **RFC 9106** (Argon2)
- **AWS KMS FIPS 140-3 Level 3** — [AWS Security Blog](https://aws.amazon.com/blogs/security/aws-kms-now-fips-140-2-level-3-what-does-this-mean-for-you/)
- **AWS ML-KEM PQC TLS** (KMS/ACM/Secrets Manager) — [AWS Security Blog](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/) · [hybrid PQ TLS for KMS](https://docs.aws.amazon.com/kms/latest/developerguide/pqtls.html)

