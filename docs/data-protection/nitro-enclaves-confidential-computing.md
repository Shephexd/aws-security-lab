---
title: "Nitro Enclaves / Confidential Computing"
sidebar_label: "Nitro Enclaves / Confidential Computing"
sidebar_position: 5
tags:
  - "데이터보호"
---
# Nitro System & Confidential Computing

:::info[한 줄 정의]
데이터는 저장(at-rest)·전송(in-transit)뿐 아니라 **사용 중(in-use, 메모리)** 에도 보호되어야 한다. AWS Nitro System은 하이퍼바이저/AWS 운영자조차 인스턴스 메모리에 접근 못 하게 설계됐고, Nitro Enclaves는 격리된 실행 환경을 제공한다.
:::

## 1. 왜 (세 번째 상태)
암호화 논의는 보통 at-rest/in-transit에 집중하지만, 처리 중 평문이 메모리에 존재한다. 규제·민감 워크로드(FSI, 의료, 키 처리)는 "운영 주체조차 데이터를 못 본다"는 보증을 원한다.

## 2. Nitro System
- 가상화를 전용 Nitro 카드/칩으로 오프로드, 최소화된 하이퍼바이저.
- **AWS 운영자도 인스턴스 메모리·데이터에 접근할 운영 경로가 없도록** 설계(NCC Group 등 제3자 검증 보고서 존재 → 고객 증빙으로 활용).

## 3. Nitro Enclaves
- EC2 안에 격리된 CPU/메모리 환경. 영구 저장소·네트워크·대화형 접근 **없음** → 공격면 극소화.
- 부모 인스턴스와 보안 로컬 채널(vsock)로만 통신.
- **Cryptographic Attestation**: enclave의 측정값(PCR)을 KMS 키 정책 조건으로 사용 → "이 검증된 enclave만 키 사용 가능".

## 4. 사용 사례
- 민감 데이터 처리(PII/PHI/카드정보) 격리, 키/시크릿 처리, 다자간 데이터 협업(서로 원본 비공개), 블록체인 키 관리.
- KMS XKS / 외부 HSM과 결합한 최고 수준 키 통제.

## 5. 자주 받는 질문
- "AWS도 우리 데이터 못 보게" → CMK + Nitro 아키텍처 + 제3자 검증 보고서로 설명.
- FSI/의료의 "처리 중 보호" 요구 → Enclaves + attestation 기반 키 접근.

## 관련
- [KMS & Envelope Encryption](./kms-envelope-encryption.md) · [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md) · [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md)

