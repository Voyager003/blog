// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
  // 사이트 URL (배포 시 실제 도메인으로 변경)
  site: 'https://blog.cmiscm.com',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    // MDX 지원
    mdx(),

    // Sitemap 자동 생성
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // 특정 페이지 제외
      filter: (page) => !page.includes('/draft/'),
      // 다국어 지원 (필요시)
      i18n: {
        defaultLocale: 'ko',
        locales: {
          ko: 'ko-KR',
          en: 'en-US',
        },
      },
    }),
  ],

  // Markdown 설정
  markdown: {
    // Shiki 구문 강조 설정
    shikiConfig: {
      // 다크/라이트 테마 설정
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // 코드 블록 래핑
      wrap: true,
      // 추가 언어 지원 (필요시)
      // langs: [],
    },
    // Remark 플러그인 (GFM: 테이블, 각주, 취소선 등)
    remarkPlugins: [remarkGfm],
    // Rehype 플러그인
    rehypePlugins: [],
    // GFM 스타일 각주 활성화
    gfm: true,
  },

  // 빌드 설정
  build: {
    // 인라인 스타일 크기 제한 (성능 최적화)
    inlineStylesheets: 'auto',
  },

  // 이미지 최적화 설정
  image: {
    // Sharp 이미지 최적화 서비스 사용
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
