---
title: "위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP"
sidebar_label: "위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP"
sidebar_position: 7
tags:
  - "기초"
---
# 위협 모델링 & 공격 프레임워크

:::info[한 줄 정의]
방어를 설계하려면 공격자처럼 생각해야 한다. 위협 모델링은 "무엇이 잘못될 수 있는가"를 체계적으로 도출하는 작업이고, ATT&CK/OWASP는 실제 공격 사전이다.
:::

## 1. 왜 중요한가
아키텍처를 설계할 때 "이 구조의 위협은 X, Y, Z이고 각각의 통제는…"을 체계적으로 도출할 수 있으면, 사후 대응이 아니라 설계 단계에서 위험을 줄일 수 있다.

## 2. STRIDE (위협 분류 — 설계 단계)
| 위협 | 침해 속성 | 예 | AWS 통제 |
|---|---|---|---|
| **S**poofing | 인증 | 자격 위조 | IAM, MFA, mTLS |
| **T**ampering | 무결성 | 데이터 변조 | 서명, 무결성 해시, Object Lock |
| **R**epudiation | 부인방지 | 행위 부인 | CloudTrail, 로그 |
| **I**nformation disclosure | 기밀성 | 데이터 유출 | 암호화, S3 BPA, VPC Endpoint |
| **D**enial of Service | 가용성 | 서비스 마비 | Shield, WAF, Auto Scaling |
| **E**levation of privilege | 인가 | 권한 상승 | 최소권한, SCP, Boundary |

> 실무: 아키텍처 다이어그램의 각 **데이터 흐름/신뢰 경계**마다 STRIDE 6개를 던져본다.

## 3. DREAD (위험 점수화 — 우선순위)
Damage·Reproducibility·Exploitability·Affected users·Discoverability를 점수화해 무엇부터 막을지 결정. 요즘은 **CVSS**나 단순 Likelihood×Impact 매트릭스를 더 많이 씀.

## 4. MITRE ATT&CK — Cloud / IaaS Matrix (공격자 행동 사전)
실제 공격을 단계(Tactic)별로 매핑. 클라우드 핵심 단계:
- **Initial Access**: 유출된 액세스 키, 피싱, 퍼블릭 노출 리소스.
- **Execution / Persistence**: 새 IAM 사용자·키 생성, Lambda 백도어.
- **Privilege Escalation**: 과한 IAM(`iam:PassRole`, `iam:CreatePolicyVersion` 등 알려진 에스컬레이션 경로).
- **Defense Evasion**: CloudTrail 끄기, GuardDuty 비활성화.
- **Credential Access**: **IMDS 탈취(SSRF)**, Secrets/Parameter 덤프. → [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md)
- **Discovery / Lateral Movement**: `iam:List*`, `s3:List*`로 정찰, AssumeRole 체이닝.
- **Exfiltration**: S3 퍼블릭화, 외부 계정으로 스냅샷 공유, cross-account 복제.
- **Impact**: 랜섬웨어(데이터 삭제·KMS 키 폐기). → [랜섬웨어 방어 아키텍처](../resilience/ransomware-defense-architecture.md)

> GuardDuty/Detective의 finding은 ATT&CK 전술로 라벨링됨 → 탐지를 공격 단계로 해석.

### ATT&CK Cloud(IaaS) 기법 ID 매핑 (고객/탐지팀과 공용어)
탐지 룰·GuardDuty finding을 아래 **Technique ID**로 매핑하면 커버리지 갭을 정량화할 수 있다.

| Tactic(단계) | Technique (ID) | AWS 맥락 | 방어/탐지 |
|---|---|---|---|
| Initial Access / Persistence / PrivEsc | **Valid Accounts: Cloud Accounts (T1078.004)** | 유출된 액세스 키·페더레이션 자격 | MFA, 단기자격, GuardDuty 이상 로그인 |
| Persistence / PrivEsc | **Account Manipulation (T1098)** | 새 IAM 사용자/키 생성, 정책 추가 | CloudTrail `CreateUser/CreateAccessKey`, Access Analyzer |
| Credential Access | **Unsecured Credentials: Cloud Instance Metadata API (T1552.005)** | SSRF→IMDS 자격 탈취(Capital One) | **IMDSv2** → [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md) |
| Defense Evasion | **Impair Defenses: Disable/Modify Cloud Logs (T1562.008)** | CloudTrail 중지·삭제, GuardDuty off | SCP로 비활성 차단, EventBridge 알림 |
| Collection | **Data from Cloud Storage (T1530)** | S3 직접 대량 조회 | Macie, S3 data event, 이상 접근 |
| Exfiltration | **Transfer Data to Cloud Account (T1537)** | 스냅샷/AMI를 외부 계정 공유, cross-account 복제 | RCP/SCP 차단, GuardDuty exfil finding |
| Impact | **Resource Hijacking (T1496)** | 크립토마이닝(Compute/Cloud Service Hijacking) | GuardDuty CryptoCurrency finding |
| Impact | **Data Destruction / Encrypted for Impact** | 랜섬웨어: 데이터 삭제·KMS 키 폐기 | 불변 백업 → [랜섬웨어 방어 아키텍처](../resilience/ransomware-defense-architecture.md) |

## 5. 클라우드 대표 공격 패턴
- **SSRF → IMDSv1 자격 탈취**: 앱 SSRF로 `169.254.169.254` 호출 → 역할 자격 획득 (Capital One 사건). 방어 = **IMDSv2 강제**.
- **Confused Deputy**: 제3자 서비스가 내 역할을 대신 호출 악용 → `aws:SourceArn`/`ExternalId` 조건.
- **IAM Privilege Escalation**: 위험 권한 조합으로 관리자화 → Access Analyzer, 권한 boundary.
- **퍼블릭 노출**: S3 퍼블릭, 보안그룹 0.0.0.0/0, 노출된 RDS/ES → Config 규칙 + BPA.
- **자격증명 유출**: 깃허브에 키 커밋 → 단기 자격(역할/OIDC)로 키 자체를 없앤다.

## 6. OWASP — 어플리케이션 관점
- **OWASP Top 10 (2021)**: **A01 Broken Access Control이 1위**(5위→1위 상승, 가장 흔한 심각 위험). A03 Injection, A10 SSRF 등. (2025 개정판도 A01이 1위 유지)
- **OWASP API Security Top 10 (2023)**: **API1 BOLA**(Broken Object Level Authorization, 구 IDOR)가 1위 — API 공격의 ~40%. `/api/orders/12345`처럼 *객체 소유 검증 누락*. 웹의 Broken Access Control이 API에선 객체 수준으로 구체화된 것.
- **OWASP Top 10 for LLM**: 프롬프트 인젝션, 민감정보 유출, 과도한 에이전시 → [생성형 AI 보안 — OWASP LLM Top 10 / Bedrock Guardrails](../application-workload/ai-ml/genai-security-owasp-llm.md)
- 통찰: 웹·API·LLM Top 10 모두 **인가(Authorization)** 가 1순위 → [인가 모델 — RBAC / ABAC / ReBAC / Cedar](./authorization-models.md)가 방어의 핵심.

## 7. 위협 모델링 워크샵 운영
1. 범위/자산 식별 → 2. 아키텍처/데이터 흐름도 → 3. 신뢰 경계 표시 → 4. STRIDE로 위협 도출 → 5. 위험 점수화 → 6. 통제 매핑 → 7. 백로그화.

## 8. 자주 받는 질문
- "우리 환경은 안전한가요?"라는 질문에는, 공격자가 처음 노리는 노출된 키, IMDS, 과도한 IAM 권한부터 점검하는 것을 권장한다.
- 탐지 룰을 ATT&CK에 매핑하면 **커버리지 갭**을 시각화할 수 있다.

## 관련
- [인가 모델 — RBAC / ABAC / ReBAC / Cedar](./authorization-models.md) · [IMDSv2 & SSRF 방어](../infrastructure-network/imdsv2-ssrf-defense.md) · [위협 탐지 — GuardDuty / Inspector / Security Hub / Detective](../detection-response/detection/threat-detection-guardduty.md)

### References
- **MITRE ATT&CK** — [Enterprise Matrix(IaaS 플랫폼 필터)](https://attack.mitre.org/matrices/enterprise/cloud/) · [T1552.005 Cloud Instance Metadata API](https://attack.mitre.org/techniques/T1552/005/) · [T1078.004 Cloud Accounts](https://attack.mitre.org/techniques/T1078/004/) · [T1530 Data from Cloud Storage](https://attack.mitre.org/techniques/T1530/)
- **AWS** — [Threat Technique Catalog for AWS](https://aws-samples.github.io/threat-technique-catalog-for-aws/) (ATT&CK↔AWS 매핑)
- **OWASP** — [Top 10:2021](https://owasp.org/Top10/2021/) · [API Security Top 10:2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) · [Top 10 for LLM](https://genai.owasp.org/)
- **위협 모델링** — Microsoft STRIDE, [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling), threatmodeling 4-questions(Shostack)

