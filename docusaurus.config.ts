import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// ⚠️ 배포 전 아래 3개 값을 본인 GitHub 정보로 확인/수정하세요.
//  - organizationName : GitHub 사용자명(또는 조직명)
//  - projectName      : 저장소 이름
//  - baseUrl          : 프로젝트 페이지면 '/<저장소명>/', 사용자 페이지(<user>.github.io)면 '/'
const ORG = 'shephexd';
const REPO = 'aws-security-lab';

const config: Config = {
  title: 'Security Lab Guide',
  tagline: 'AWS · 클라우드 · 코어 보안 기초 가이드',
  favicon: 'img/logo.svg',

  url: `https://${ORG}.github.io`,
  baseUrl: `/${REPO}/`,

  organizationName: ORG,
  projectName: REPO,
  trailingSlash: false,

  onBrokenLinks: 'warn',

  // .md 는 CommonMark(format:md)로, .mdx 만 MDX 로 처리.
  // → 본문의 < , { 등을 JSX/표현식으로 해석하지 않아 변환 콘텐츠가 안전하게 렌더됨.
  markdown: {
    format: 'detect',
    mermaid: true, // ```mermaid 코드블럭을 다이어그램으로 렌더
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  onBrokenAnchors: 'warn',

  plugins: [
    'docusaurus-plugin-image-zoom', // 본문 이미지(PNG 아키텍처) 클릭 확대
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {from: '/solutions/claude-code-private-networking', to: '/solutions/claude-code-bedrock'},
        ],
      },
    ],
  ],

  // 다이어그램(Mermaid) + 오프라인 로컬 검색(GitHub Pages에서 외부 서비스 없이 동작)
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        language: ['en', 'ko'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // 문서를 사이트 루트로 (랜딩 페이지 대신 문서 우선)
          sidebarPath: './sidebars.ts',
          // docs/ 는 scripts/sync-content.mjs 가 볼트에서 생성하므로 editUrl 생략
        },
        blog: false, // 가이드 사이트라 블로그 비활성화 (필요 시 true)
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Security Lab',
      logo: {
        alt: 'Security Lab Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: '가이드',
        },
        {to: '/tags', label: '태그', position: 'left'},
        {
          href: `https://github.com/${ORG}/${REPO}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '주요 도메인',
          items: [
            {label: '보안 기초', to: '/foundations'},
            {label: '자격증명 & 접근 관리', to: '/identity-access'},
            {label: '인프라 & 네트워크', to: '/infrastructure-network'},
            {label: '거버넌스 & 컴플라이언스', to: '/governance-compliance'},
          ],
        },
        {
          title: '더 보기',
          items: [
            {label: 'GitHub', href: `https://github.com/${ORG}/${REPO}`},
          ],
        },
      ],
      copyright: `Copyright © ${'2026'} Security Lab. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'hcl', 'yaml', 'python'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    zoom: {
      selector: '.markdown img',
      background: {light: 'rgb(255, 255, 255)', dark: 'rgb(33, 33, 33)'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
