import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
    const posts = await getCollection('posts', ({ data }) => {
        return data.draft !== true;
    });

    // 날짜순 정렬 (최신순)
    const sortedPosts = posts.sort(
        (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
    );

    return rss({
        // RSS 피드 기본 정보
        title: 'WONGI RIM — Creative Developer',
        description: 'Creative Developer & Designer - Exploring the intersection of code and creativity. Building interactive experiences, experimental interfaces, and digital art.',
        site: context.site || 'https://blog.cmiscm.com',

        // 포스트 목록
        items: sortedPosts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.excerpt || '',
            link: `/blog/${post.id}/`,
            categories: post.data.tags,
            author: 'Wongi Rim',
            // 커스텀 데이터
            customData: `<category>${post.data.category}</category>`,
        })),

        // 스타일시트 (선택사항)
        stylesheet: '/rss/styles.xsl',

        // 네임스페이스 추가 (Atom 지원)
        xmlns: {
            atom: 'http://www.w3.org/2005/Atom',
        },

        // 커스텀 XML 요소
        customData: `
            <language>ko-KR</language>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml"/>
            <managingEditor>hello@cmiscm.com (Wongi Rim)</managingEditor>
            <webMaster>hello@cmiscm.com (Wongi Rim)</webMaster>
        `,
    });
}
