---
title: "보안 기초"
sidebar_label: "개요"
sidebar_position: 0
tags:
  - "기초"
---
> 모든 클라우드 보안 설계의 토대가 되는 원칙과 암호·신뢰 모델을 다룹니다.

## A. 보안 원칙 (Principles)
- [AWS 책임 공유 모델](./shared-responsibility-model.md)
- [Well-Architected — Security Pillar](./well-architected-security-pillar.md)
- [Zero Trust Architecture](./zero-trust-architecture.md)
- [Defense in Depth (심층 방어)](./defense-in-depth.md)

## B. 암호 알고리즘 / 신뢰
- [암호 기초 — 대칭/비대칭/해시/서명](./cryptography-fundamentals.md)
- [PKI · X.509 · TLS 핸드셰이크](./pki-x509-tls.md)

## C. 인증 · 인가
- [인증 프로토콜 — OAuth2/OIDC/SAML/JWT/FIDO2](./authentication-protocols.md)
- [인가 모델 — RBAC/ABAC/ReBAC/Cedar](./authorization-models.md)

## D. 공격자 관점
- [위협 모델링 & 공격 프레임워크 — STRIDE/MITRE ATT&CK/OWASP](./threat-modeling-attack.md)

---
## 자주 다루는 질문
- "TLS 1.3은 1.2 대비 뭐가 안전해졌나요?"
- "Envelope encryption이 왜 필요한가요? 그냥 KMS로 다 암호화하면 안 되나요?"
- "JWT를 그냥 디코드해서 쓰면 왜 위험한가요?"
- "RBAC로 충분한데 왜 ABAC을 도입하나요?"
- "공격자는 클라우드 환경에서 처음에 무엇을 노리나요?" → IMDS, 노출된 키, 과도한 IAM 권한

