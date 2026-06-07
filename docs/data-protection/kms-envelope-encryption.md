---
title: "KMS & Envelope Encryption"
sidebar_label: "KMS & Envelope Encryption"
sidebar_position: 4
tags:
  - "데이터보호"
---
# KMS & Envelope Encryption

:::info[한 줄 정의]
KMS는 작은 **루트키(KEK)** 를 HSM 안에 안전히 보관하고, 실제 데이터는 그 키로 보호된 **데이터 키(DEK)** 로 암호화한다. 이 2단 구조가 envelope encryption이며, 성능과 보안을 동시에 잡는다.
:::

## 1. 왜 Envelope Encryption인가 (First Principle)
- KMS는 대칭/비대칭 키를 HSM 밖으로 평문 노출하지 않는다 → KMS로 직접 암호화하면 데이터를 매번 KMS로 보내야 함(4KB 제한, 느림, 비쌈).
- 대신: KMS에 **DEK 생성 요청** → KMS가 *평문 DEK + KMS키로 암호화된 DEK* 를 반환 → 앱은 평문 DEK로 대용량 데이터를 로컬 암호화 → **평문 DEK 폐기**, 암호화된 DEK만 데이터 옆에 저장.
- 복호화 시: 암호화된 DEK를 KMS에 보내 복호화 → 평문 DEK로 데이터 복호화.
- → 대용량을 빠른 대칭키로 처리하면서, 루트키는 HSM에 안전. 정확히 [하이브리드 암호](../foundations/cryptography-fundamentals.md) 패턴.

```
KMS(KEK, HSM) ──암호화──▶ DEK(데이터키)
                              │
                       데이터 ◀─ 평문 DEK로 로컬 암호화
                              │
                       [암호화된 데이터 + 암호화된 DEK] 저장
```

## 2. 키 종류
| 종류 | 통제 주체 | 용도 |
|---|---|---|
| AWS owned | AWS | 서비스 내부, 고객 안 보임 |
| **AWS managed** (`aws/서비스`) | AWS(정책은 서비스) | 간편, 무료에 가까움, 로테이션 자동 |
| **Customer managed (CMK)** | **고객** | 키 정책·로테이션·감사 통제 — 규제 시 필수 |
| **Imported key material (BYOK)** | 고객(외부 생성) | 키 출처를 고객이 보장 |
| **CloudHSM 기반 / External key store(XKS)** | 고객 HSM/온프레 | 최고 수준 통제, AWS 밖 키 |

## 3. Key Policy vs Grant vs IAM (자주 헷갈림)
- **Key Policy**: KMS 키의 *주(主) 접근통제*. 키마다 존재. 이게 없으면 IAM 권한도 무력(키 정책이 위임을 허용해야 IAM이 작동).
- **Grant**: 임시·세분화된 위임(서비스가 일시적으로 키 사용). 프로그래밍적, revoke 가능.
- **IAM 정책**: 키 정책이 위임을 허용한 범위에서 주체 권한 부여.
- 핵심: "IAM에 kms 권한 줬는데 안 돼요" → 키 정책에서 그 계정/주체에 위임 허용했는지 확인.

### 키 정책 구조 예시
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnableIAMDelegation",      // ① 계정 root에 위임 → 이제 IAM 정책으로도 권한 부여 가능
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "KeyAdministrators",          // ② 키 관리자(사용X, 관리만): 로테이션/정책변경
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/KeyAdmin" },
      "Action": ["kms:Create*","kms:Describe*","kms:Enable*","kms:Put*",
                 "kms:Update*","kms:Revoke*","kms:Disable*","kms:ScheduleKeyDeletion"],
      "Resource": "*"
    },
    {
      "Sid": "KeyUsers",                    // ③ 키 사용자: 암복호화 + envelope용 데이터키 생성
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/AppRole" },
      "Action": ["kms:Encrypt","kms:Decrypt","kms:ReEncrypt*",
                 "kms:GenerateDataKey*","kms:DescribeKey"],
      "Resource": "*",
      "Condition": { "StringEquals": { "kms:ViaService": "s3.ap-northeast-2.amazonaws.com" } }
    }
  ]
}
```
> 통찰: ①이 없으면 IAM 정책이 무력(키 정책이 위임의 *게이트*). **관리(admin)와 사용(use) 권한을 분리**하는 게 직무분리(SoD)의 기본 — 관리자도 평문 데이터엔 접근 못 하게. `kms:GenerateDataKey`가 바로 envelope의 DEK 발급 권한.

## 4. 운영 핵심
- **키 로테이션**: AWS managed/대부분 CMK 자동 연 1회(또는 설정 주기). 과거 데이터는 과거 키 버전으로 복호화(백워드 호환).
- **멀티리전 키**: 동일 키 ID를 여러 리전에 복제(DR, 글로벌 테이블 암호화).
- **삭제 보호**: 키 삭제는 7~30일 대기(pending deletion) → 랜섬웨어/실수 방어. 키 삭제 = 데이터 영구 손실.
- **그랜트/정책 변경, 키 사용 전부 CloudTrail에 기록** → 감사 핵심.

## 5. 서비스별 암호화 매핑
| 서비스 | 방식 |
|---|---|
| S3 | SSE-S3 / **SSE-KMS** / SSE-C / DSSE-KMS(이중) |
| EBS | KMS, 계정 기본 암호화 강제 가능 |
| RDS/Aurora | KMS(생성 시 지정, 나중 변경 어려움) |
| DynamoDB | 기본 암호화, CMK 옵션 |
| Secrets Manager / SSM | KMS로 보호 |

> 함정: RDS는 생성 시 암호화 안 하면 나중에 스냅샷 복사로만 전환 → 처음부터 켜라.

## 6. 자주 받는 질문
- "암호화 켰으니 안전?" → "키를 누가 통제하나? AWS managed면 *AWS 권한자*도 정책상 접근 가능 구조. CMK + 엄격한 키 정책 + CloudTrail이 규제 답."
- FSI/공공: 종종 **CMK + 키 로테이션 + 키 사용 로그 + (때로)CloudHSM/XKS** 요구 → [한국 금융 클라우드 규제 — 전자금융감독규정 / FSI 평가 / 망분리](../governance-compliance/korea-fsi-regulations.md)
- "AWS 운영자도 못 보게" → CMK 키 정책 최소화 + [Nitro](./nitro-enclaves-confidential-computing.md) + XKS.

## 7. 흔한 함정
- 키와 데이터 접근 권한을 같은 주체에 몰면 envelope 의미 약화.
- 멀티 계정에서 cross-account 키 사용 시 키 정책 + IAM 둘 다.
- 키 삭제 정책 미설정 → 단일 실수로 데이터 영구 손실.

## 관련
- [암호 기초 — 대칭/비대칭/해시/서명](../foundations/cryptography-fundamentals.md) · [Nitro Enclaves / Confidential Computing](./nitro-enclaves-confidential-computing.md) · [시크릿 관리 — Secrets Manager / Parameter Store](./secrets-management.md)

