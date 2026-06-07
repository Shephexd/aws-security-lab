---
title: "DDoS 방어 아키텍처"
sidebar_label: "DDoS 방어 아키텍처"
sidebar_position: 1
tags:
  - "네트워크"
---
# DDoS 방어

:::info[한 줄 정의]
공격 표면을 줄이고(엣지로 흡수) · 확장으로 버티고(Auto Scaling) · L7은 WAF로 거른다. 계층별로 다른 도구.
:::

## 1. DDoS 유형 → 방어 매핑
| 계층 | 공격 예 | 방어 |
|---|---|---|
| L3/4 볼류메트릭 | UDP flood, SYN flood, 반사증폭 | **Shield**(엣지 흡수), 표면 최소화 |
| 프로토콜 | SYN/ACK 남용 | Shield, NLB/엣지 |
| L7 애플리케이션 | HTTP flood, slowloris | **WAF rate-based**, CAPTCHA, Bot Control |

## 2. 핵심 아키텍처 원칙
1. **엣지 흡수**: CloudFront/Route 53/Global Accelerator + Shield → AWS 글로벌 엣지가 대용량 흡수.
2. **표면 최소화**: origin을 CloudFront 뒤에 숨기고(직접 IP 노출 차단), 불필요 포트 차단, SG 최소.
3. **L7 필터링**: WAF rate-based + Bot Control + ATP. → [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](./edge-perimeter-waf-shield.md)
4. **탄력성**: Auto Scaling으로 흡수, 정적 콘텐츠 캐싱.

## 3. Shield Advanced (금융/공공 권장)
- **SRT 24/7** 지원, **비용 보호**(공격으로 인한 스케일 비용 환급), 실시간 메트릭/대시보드, 사전 위임으로 신속 대응.
- 사전 런북 + 연락 체계 준비. → [IR 프레임워크 — NIST 라이프사이클 / 런북](../detection-response/incident-response/ir-framework.md)

## 4. 자주 받는 질문
- "DDoS 맞으면?" → 엣지 흡수(Shield Standard 기본) + 중요 서비스 Shield Advanced + WAF rate-based + origin 은닉 + 사전 런북.
- "비용 폭탄 우려" → Shield Advanced 비용 보호.

## 관련
- [Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall](./edge-perimeter-waf-shield.md) · [06. Incident Response — MOC](../detection-response/incident-response/index.md)

### References
- AWS — AWS Shield(Standard/Advanced), [DDoS Resiliency Best Practices(AWS Best Practices for DDoS Resiliency)](https://docs.aws.amazon.com/whitepapers/latest/aws-best-practices-ddos-resiliency/welcome.html)

