---
title: "인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2"
sidebar_label: "인증 프로토콜 — OAuth2 / OIDC / SAML / JWT / FIDO2"
sidebar_position: 1
tags:
  - "기초"
---
# 인증 프로토콜 (Authentication Protocols)

:::info[한 줄 정의]
**인증(Authentication, AuthN)** = "너 누구냐"를 증명. **인가(Authorization, AuthZ)** = "뭘 할 수 있냐". 둘은 다르다. OAuth2는 인가 프레임워크, OIDC는 그 위의 인증 레이어다 — 이 구분이 절반이다.
:::

## 1. 왜 중요한가
Cognito, IAM Identity Center, ALB OIDC, API Gateway authorizer 설계는 전부 이 프로토콜 위에 있다. "토큰을 어디서 검증하나", "왜 implicit flow를 쓰면 안 되나" 같은 질문에 답하려면 흐름을 알아야 한다.

## 2. OAuth 2.0 (인가 위임 프레임워크)
"비밀번호를 주지 않고 제3자에게 제한된 권한을 위임".
- 역할: Resource Owner(사용자) · Client(앱) · Authorization Server · Resource Server(API).
- 토큰: **Access Token**(짧은 수명, 자원 접근) · **Refresh Token**(긴 수명, 재발급).

### Grant Type (어느 흐름을 언제)
| Grant | 용도 | 비고 |
|---|---|---|
| **Authorization Code + PKCE** | 웹/모바일/SPA | ✅ 현재 표준. PKCE로 코드 가로채기 방어 |
| Client Credentials | 서버↔서버(M2M) | 사용자 없음 |
| Device Code | TV/CLI 등 입력 제약 기기 | |
| ~~Implicit~~ | (구) SPA | ❌ 폐기 — 토큰이 URL 노출 |
| ~~Resource Owner Password~~ | 레거시 | ❌ 비밀번호를 앱이 직접 다룸 |

> 권장: SPA에서는 Implicit 대신 **Authorization Code + PKCE**를 사용한다. 이미 implicit를 쓰고 있다면 마이그레이션을 권장한다.

## 3. OIDC (OpenID Connect)
OAuth2 **위에 인증을 얹은 것**. Access Token(인가)에 더해 **ID Token(JWT, 신원 정보)** 을 발급.
- `id_token`에 sub(사용자 식별), iss, aud, exp, nonce 포함.
- AWS: Cognito, IAM Identity Center, EKS IRSA(서비스계정 OIDC), GitHub Actions→IAM OIDC(키 없는 CI/CD).

## 4. SAML 2.0 (엔터프라이즈 SSO)
XML 기반 어서션으로 IdP↔SP 간 신원 전달. 기업 AD/Okta 연동의 전통 강자.
- 흐름: 사용자→SP→IdP 리다이렉트→인증→**서명된 SAML Assertion**→SP가 서명 검증.
- AWS: IAM Identity Center, IAM SAML federation(→ 임시 STS 자격증명), AWS Console SSO.
- OIDC vs SAML: 신규/모바일/API = OIDC(JSON/JWT), 레거시 엔터프라이즈 = SAML(XML). Identity Center가 둘 다 중개.

## 5. JWT 심화 (RFC 8725)
구조: `header.payload.signature` (Base64URL). **payload는 암호화 아님 — 그냥 인코딩**. 누구나 디코드 가능(민감정보 금지). 보안 가이드는 **RFC 8725 (JWT Best Current Practices)**.
- **HS256**(대칭, HMAC, 공유 비밀) vs **RS256/ES256**(비대칭, 서명) — 공개 검증이 필요하면 비대칭(RS/ES).
- 반드시 검증할 것: ① 서명 ② `iss`(발급자) ③ `aud`(대상) ④ `exp`/`nbf`(시간) ⑤ **알고리즘 화이트리스트 고정** ⑥ `kid` 검증(키 주입 방지).
- **치명적 함정 (RFC 8725가 명시)**:
  - **`alg: none` 수용** → 서명 검증 없이 통과. 라이브러리가 none을 신뢰하면 인증 우회.
  - **알고리즘 혼동(RS256→HS256)**: 공격자가 헤더를 HS256으로 바꾸고, *서버의 RSA 공개키*(공개됨)를 HMAC 비밀키로 사용해 서명 위조. 서버가 alg를 토큰에서 읽으면 그대로 검증돼버림.
  - **방어 원칙**: "**토큰의 `alg`를 절대 신뢰하지 말 것.**" 서버가 허용 알고리즘을 *고정(pin)* 하고, 라이브러리가 호출자 지정 알고리즘 집합만 쓰도록 강제. → none/혼동 모두 차단.
  - payload에 민감정보(주민번호 등) 넣기 → 평문 노출(서명은 기밀성 제공 안 함).
  - 만료 검증 누락, **폐기 불가**(JWT는 stateless라 즉시 무효화 어려움 → 짧은 수명 + refresh token + (필요 시) 거부 목록).

## 6. FIDO2 / WebAuthn / Passkey (피싱 내성 MFA)
공개키 기반, 비밀번호 없는 인증. 개인키는 기기(보안칩)에서 안 나오고, 도메인에 바인딩 → **피싱 불가**.
- SMS/TOTP보다 강함(SMS는 SIM 스와핑·피싱 취약).
- AWS: IAM/Identity Center가 passkey·보안키 MFA 지원. 루트 계정 MFA에 하드웨어 키 권장.

## 7. Kerberos / AD (온프레 연동)
티켓 기반(KDC, TGT). Windows 도메인의 핵심. AWS Managed Microsoft AD, FSx, RDS의 Kerberos/AD 연동 시 등장.

## 8. 자주 받는 질문 / 흔한 함정
- 토큰 검증 위치는 API Gateway(JWT/Lambda authorizer), ALB(OIDC), 앱 내부 등이 가능하다. **검증 없이 디코드만 하면 누구나 위조할 수 있다**.
- MFA는 적용 여부만이 아니라 **피싱 내성 여부**가 중요하다(passkey > TOTP > SMS).
- 장수명 토큰에 refresh가 없는 설계는 유출 시 피해가 장기화된다.

## 관련
- [인가 모델 — RBAC / ABAC / ReBAC / Cedar](./authorization-models.md) · [암호 기초 — 대칭/비대칭/해시/서명](./cryptography-fundamentals.md) (서명/HMAC) · [ID 페더레이션 — Identity Center / SAML / OIDC](../identity-access/identity-federation.md)
- IAM Identity Center, Cognito 노트와 연결

### References
- **RFC 6749** (OAuth 2.0), **RFC 7636** (PKCE), **RFC 7519** (JWT), **RFC 8725** (JWT BCP), **RFC 9700** (OAuth 2.0 Security BCP)
- **OIDC Core 1.0** (OpenID Foundation), **SAML 2.0** (OASIS), **FIDO2/WebAuthn** (W3C/FIDO Alliance)
- [RFC 8725 — JWT Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725) · OWASP JWT/Authentication Cheat Sheets

