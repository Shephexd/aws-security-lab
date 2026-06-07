---
title: 보안 여정 (어디서 시작할까)
sidebar_label: 보안 여정
sidebar_position: 1
---

# 보안 여정 — 진단에서 증빙까지

이 가이드의 조각들을 **하나의 흐름**으로 잇습니다. 지금 상태를 진단하고 → 갭의 우선순위를 정하고 → 원리로 설계하고 → 솔루션으로 배포하고 → 규제 증빙까지 연결합니다.

```
① 진단        ② 우선순위        ③ 설계            ④ 배포             ⑤ 증빙
SRA Verify  →  위협·리스크   →  지식베이스 원리  →  솔루션 패키지   →  컴플라이언스
(현황 파악)     (무엇부터)       (왜·어떻게)        (운영 적용)        (규제·감사)
```

## ① 진단 — 지금 상태를 측정한다
조직 전 계정이 AWS 모범사례(SRA)에 얼마나 부합하는지부터 봅니다.

- **[AWS SRA 진단 (SRA Verify)](./diagnostics/sra-verify.md)** — CloudTrail·GuardDuty·Config·Security Hub·S3 구성 자동 점검 → 발견사항 목록
- **[AWS 리소스 시각화](./diagnostics/aws-resource-visualization.md)** — 무엇이 떠 있는지(자산 인벤토리) 가시화

## ② 우선순위 — 무엇부터 막을까
발견된 갭을 위협·영향 기준으로 정렬합니다.

- **[위협 모델링 & 공격 프레임워크](./foundations/threat-modeling-attack.md)** — STRIDE/ATT&CK로 위협 도출·점수화
- **[심층 방어](./foundations/defense-in-depth.md)** · **[Well-Architected 보안 기둥](./foundations/well-architected-security-pillar.md)**

## ③ 설계 — 원리로 옳게 만든다
갭이 있는 영역의 *왜·어떻게* 를 지식베이스에서 확인합니다. 각 영역은 **[Well-Architected 보안 기둥(SEC 1–11)](./foundations/well-architected-alignment.md)** 에 정렬되어 있어, WAF 베스트 프랙티스 단위로도 찾아갈 수 있습니다.

| 갭 유형 | 시작 지점 |
| --- | --- |
| 과도한 권한·접근통제 | [자격증명 & 접근 관리](./identity-access/index.md) |
| 노출·네트워크 경계 | [인프라 & 네트워크 보안](./infrastructure-network/index.md) |
| 데이터 암호화·유출 | [데이터 보호](./data-protection/index.md) |
| 워크로드·컨테이너 | [애플리케이션 & 워크로드](./application-workload/index.md) |
| 탐지 공백 | [탐지 & 대응](./detection-response/index.md) |
| 복구 보증 | [복원력 & 랜섬웨어](./resilience/index.md) |

## ④ 배포 — 운영에 적용한다
설계를 배포 가능한 패키지로 구현합니다.

- **[솔루션 패키지](./solutions/index.md)** — 각 솔루션은 *관련 보안 영역(Alignment)* 으로 ③ 설계와 연결됩니다.

## ⑤ 증빙 — 규제·감사로 증명한다
구현한 통제를 규제 프레임워크에 매핑해 증거를 만듭니다.

- **[거버넌스 & 컴플라이언스](./governance-compliance/index.md)** — [ISMS-P 매핑](./governance-compliance/ismsp-aws-control-mapping.md) · [한국 FSI 규제](./governance-compliance/korea-fsi-regulations.md) · [AWS 컴플라이언스 서비스](./governance-compliance/aws-compliance-services.md)

---

:::tip 반복하는 루프
이 여정은 일회성이 아닙니다. ⑤까지 간 뒤 ①로 돌아가 **정기 재진단**하면, 변경·드리프트를 잡고 보안 태세를 지속적으로 끌어올릴 수 있습니다. → [지속적 모니터링](./detection-response/detection/continuous-monitoring.md)
:::
