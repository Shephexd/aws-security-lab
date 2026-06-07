import React from 'react';
import Tag from '@theme/Tag';

/**
 * 기본 테마는 태그를 알파벳/초성 단위로 섹션 분할해 세로로 길고 듬성듬성하다.
 * 고객 가독성을 위해 **빈도(문서 수) 내림차순 칩 클라우드**로 교체한다.
 */
type TagItem = {label: string; permalink: string; count: number};

export default function TagsListByLetter({tags}: {tags: TagItem[]}): JSX.Element {
  const sorted = [...tags].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ko'),
  );
  return (
    <section className="margin-vert--lg">
      <ul
        className="padding--none"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          listStyle: 'none',
          margin: 0,
        }}>
        {sorted.map((tag) => (
          <li key={tag.permalink} style={{display: 'inline-flex'}}>
            <Tag {...tag} />
          </li>
        ))}
      </ul>
    </section>
  );
}
