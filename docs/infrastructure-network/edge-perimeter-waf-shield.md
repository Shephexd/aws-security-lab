---
title: "Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall"
sidebar_label: "Edge/Perimeter — WAF / Shield / CloudFront / Network Firewall"
sidebar_position: 2
tags:
  - "네트워크"
---
# Edge & Perimeter Security

:::info[한 줄 정의]
경계에서 **L3/4(Shield)와 L7(WAF)을 분리**해 막고, **egress(나가는 트래픽)는 Network Firewall/DNS Firewall**로 통제한다. 인그레스만큼 이그레스가 중요.
:::

## 1. AWS WAF (L7 — 애플리케이션)
ALB/CloudFront/API Gateway/AppSync에 web ACL 부착.
- **Managed Rule Groups**(AWS/마켓플레이스): OWASP 공통(SQLi/XSS), 알려진 악성 IP, 익스플로잇 등.
- **Bot Control**: *Common*(자기식별 봇 라벨·시그니처) / *Targeted*(브라우저 인터로게이션·핑거프린팅·행위 ML로 미식별 정교 봇). 2024: **토큰 재사용 탐지**(ASN/지역 간), 민감도(High/Med/Low), CSP 라벨.
- **Fraud Control — ATP(Account Takeover Prevention)**: 로그인 이상·**유출 자격(다크웹 DB 대조)** 탐지. ACFP(가짜 계정 생성 방지)도.
- **Rate-based rule**: IP/세션 단위 속도 제한(L7 DDoS·brute force).
- 운영: **count 모드로 검증 → block** 전환, 로그 기반 튜닝. Firewall Manager로 조직 일괄.

## 2. AWS Shield (L3/4 — 볼류메트릭)
| | Standard | **Advanced** |
|---|---|---|
| 비용 | 무료(자동) | 유료 |
| 대상 | 모든 AWS | 등록 리소스 |
| 추가 | - | **SRT(Shield Response Team) 24/7**, **비용 보호**(공격 중 스케일링 비용 환급), 고급 L7 탐지, 글로벌 위협 대시보드 |

## 3. CloudFront (엣지)
- **OAC(Origin Access Control)** 로 S3 오리진을 CloudFront 경유로만(직접 접근 차단).
- 서명 URL/쿠키(콘텐츠 보호), TLS 정책, 지오 제한, origin 은닉.

## 4. AWS Network Firewall (egress/ingress 심층)
- VPC 단 **stateful 검사**(Suricata 호환 IPS, 2024.11 Suricata 7.0).
- **egress 도메인 필터링**: HTTP는 host 헤더, HTTPS는 **SNI**로 허용 도메인 화이트리스트 → 데이터 유출·C2 차단.
- 중앙 inspection VPC 패턴(TGW와 결합).

## 5. Route 53 Resolver DNS Firewall
- 악성/비인가 도메인 질의 차단 → **DNS exfiltration·C2** 방어. → [로깅 & 감사 — CloudTrail / Config / Flow Logs / 중앙로깅](../detection-response/detection/logging-auditing.md)

## 6. 핵심 통찰
- WAF(L7) + Shield(L3/4)는 **보완** 관계, 함께. → [DDoS 방어 아키텍처](./ddos-protection.md)
- **egress 통제**(Network Firewall/DNS Firewall/endpoint policy)가 데이터 유출 방어의 축. → [데이터 유출 방지(DLP) — S3 BPA / Endpoint / RCP / CloudTrail](../data-protection/dlp.md)

## 7. 자주 받는 질문
- "WAF 룰 어디서 시작?" → AWS managed rule + count 검증 → block, Bot Control/ATP는 로그인·봇 문제에.
- "나가는 트래픽은 통제하나요?" → Network Firewall SNI 필터 + DNS Firewall.

## 관련
- [DDoS 방어 아키텍처](./ddos-protection.md) · [VPC 보안 — SG / NACL / Flow Logs / Endpoint](./vpc-security.md) · [위협 모델링 & 공격 프레임워크 — STRIDE / MITRE ATT&CK / OWASP](../foundations/threat-modeling-attack.md)

### References
- [AWS WAF Bot Control](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-bot.html) · [Fraud Control ATP](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-atp.html)
- [AWS Network Firewall(Suricata IPS)](https://docs.aws.amazon.com/network-firewall/latest/developerguide/stateful-rule-groups-ips.html) · AWS Shield Advanced 문서

