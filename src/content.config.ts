import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
    schema: ({ image }) => z.object({
        // 제목 (필수)
        title: z.string(),

        // 작성일 (필수) - YYYY-MM-DD 형식
        date: z.date(),

        // 수정일 (선택)
        updatedDate: z.date().optional(),

        // 태그 (선택, 기본값 빈 배열)
        tags: z.array(z.string()).default([]),

        // 카테고리 (필수)
        category: z.enum(['news', 'log', 'diy', 'projects', 'lab']),

        // 요약/설명 (선택)
        excerpt: z.string().optional(),

        // 대표 이미지 (선택) - Astro Image 최적화 사용
        cover: image().optional(),

        // 초안 여부 (선택, 기본값 false)
        draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
