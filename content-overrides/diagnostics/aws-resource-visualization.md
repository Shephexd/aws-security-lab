---
title: AWS 리소스 시각화
sidebar_label: AWS 리소스 시각화
sidebar_position: 4
---

# AWS 리소스 시각화 (AWS Resource Visualization)

> **한 줄 요약** — AWS Config 스냅샷 데이터를 **Athena SQL**로 질의하고 **QuickSight 대시보드**로 시각화하여, 멀티 계정 환경의 자산 인벤토리와 보안·컴플라이언스 현황을 한눈에 파악합니다.

:::info 개요
"우리 계정에 무엇이, 어디에, 어떤 설정으로 떠 있는가?" 라는 질문에 답하는 솔루션입니다.
AWS Config가 수집한 리소스 구성 스냅샷을 S3 → Athena로 질의하고, 미리 정의된 뷰/대시보드로 보안·컴플라이언스 점검과 자산 감사를 지원합니다. 에이전트 설치 없이 **이미 수집 중인 Config 데이터만으로** 동작합니다.
:::

## 관련 보안 영역 (Alignment)

이 솔루션은 다음 지식베이스 영역을 **운영 가시성** 수준으로 구현합니다.

- [Part 6 · 탐지 & 대응 → 지속적 모니터링](../detection-response/detection/continuous-monitoring.md) — 구성 변경·드리프트의 상시 가시성
- [Part 6 · 탐지 & 대응 → 로깅 & 감사](../detection-response/detection/logging-auditing.md) — 감사 가능한 구성 이력
- [Part 8 · 거버넌스 & 컴플라이언스 → AWS 컴플라이언스 서비스](../governance-compliance/aws-compliance-services.md) — Config 기반 규정 준수 평가
- [Part 8 · 거버넌스 & 컴플라이언스 → ISMS-P 통제 매핑](../governance-compliance/ismsp-aws-control-mapping.md) — 자산 인벤토리·증적 산출

## 아키텍처

```
AWS Config (구성 스냅샷)
      │  S3로 전달
      ▼
   S3 버킷 ──▶ Athena (21개 뷰, SQL 질의)
      │              │
      │              ▼
      │         QuickSight (6개 대시보드 시트)
      ▼              · Overview
 멀티 계정 파티셔닝   · Security & Compliance
 (자동)              · Asset Inventory
```

**핵심 구성요소**

| 구성요소 | 역할 |
| --- | --- |
| **Athena 뷰 21종** | EC2·S3·IAM·RDS·VPC 및 보안 서비스 전반을 SQL로 질의 |
| **데이터셋 16종** | CloudFormation으로 자동 생성, QuickSight 연결 |
| **대시보드 6시트** | Overview / Security & Compliance / Asset Inventory |
| **멀티 계정 파티셔닝** | 계정별 자동 분할로 조직 단위 통합 뷰 |

## 사전 요구사항 (Prerequisites)

- [ ] **AWS Config 활성화** (대상 계정/리전에서 구성 스냅샷 수집 중)
- [ ] Config 스냅샷이 적재되는 **S3 버킷** 접근 권한
- [ ] CloudFormation 스택 배포 권한
- [ ] (시각화 사용 시) **QuickSight Enterprise** 구독 및 SPICE 용량

## 배포 (Deployment)

### 단일 계정 (통합 환경)

```bash
# 단일 CloudFormation 스택 배포 (Athena 뷰 + 데이터셋 생성)
aws cloudformation deploy \
  --template-file resource-visualization.yaml \
  --stack-name resource-visualization \
  --capabilities CAPABILITY_NAMED_IAM
```

- Athena 전용: 약 **3분**
- QuickSight 대시보드 포함: 약 **30분**

### 멀티 계정 (조직 단위)

```bash
# 각 소스 계정에 source-account 템플릿 배포 → 중앙 계정으로 집계
aws cloudformation deploy \
  --template-file source-account.yaml \
  --stack-name resource-visualization-source \
  --capabilities CAPABILITY_NAMED_IAM
```

> 📦 **배포 에셋**: CloudFormation 템플릿(`resource-visualization.yaml`, `source-account.yaml`)과 정리 스크립트.
> *실제 에셋 저장소/다운로드 링크를 여기에 연결하세요.*

## 비용 (Cost)

| 시나리오 | 월 예상 비용 |
| --- | --- |
| Athena 전용 (단일 계정) | 약 **$3** |
| QuickSight Enterprise 포함 (단일 계정) | 약 **$27** |
| QuickSight 포함 (10개 계정) | 약 **$57** |

> 비용은 데이터 스캔량·SPICE 용량·사용자 수에 따라 달라집니다. 실제 환경 기준으로 재산정하세요.

## 자주 묻는 질문 (FAQ)

**Q. QuickSight 없이 쓸 수 있나요?**
A. 네. Athena 뷰만 배포하면 SQL 질의로 즉시 활용할 수 있고, 시각화가 필요할 때 QuickSight를 추가하면 됩니다.

**Q. QuickSight Enterprise가 꼭 필요한가요?**
A. 행 수준 보안·데이터셋 자동화 등 일부 기능에 Enterprise가 필요합니다. SPICE 용량은 데이터셋 크기에 맞춰 산정하세요.

**Q. 에이전트를 설치해야 하나요?**
A. 아니요. 이미 수집 중인 AWS Config 데이터를 사용하므로 별도 에이전트가 없습니다.

## 리소스 정리 (Cleanup)

```bash
# 제공된 정리 스크립트 또는 스택 삭제
aws cloudformation delete-stack --stack-name resource-visualization
```

## 고객 배포 체크리스트

- [ ] 대상 계정/리전에서 AWS Config 수집 확인
- [ ] Config S3 버킷 경로 확인
- [ ] 단일 vs 멀티 계정 배포 경로 선택
- [ ] QuickSight 구독/SPICE 용량 확인 (시각화 사용 시)
- [ ] 배포 후 대시보드 6시트 정상 표시 확인
- [ ] 비용 알림(Budgets) 설정

## 참고자료

- [AWS Config](https://docs.aws.amazon.com/config/)
- [Amazon Athena](https://docs.aws.amazon.com/athena/)
- [Amazon QuickSight](https://docs.aws.amazon.com/quicksight/)
