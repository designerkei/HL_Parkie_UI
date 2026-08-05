/* Which specimens each component page offers for download, and what to call them.
 *
 * The DOM is the single source of truth for *what* exists: a block collects every
 * [data-spec] inside it, so adding a specimen to a page adds it to the export with
 * no bookkeeping here and no way for the two to disagree. This file only says
 * which groups a page has and how to name them.
 *
 * Slugs and block ids are deliberately ASCII and deliberately not derived from the
 * bilingual titles. A filename that changed when the reader flipped the language
 * switch would be worse than useless — the same reasoning
 * collectIconSheetCategories() records for the icon sheets.
 */
(function () {
  'use strict';

  /* Blocks are found by [data-spec-block="<slug>-<block id>"], so the pair here is
     the whole contract with the markup. A block that finds nothing is skipped
     rather than exported empty. */
  window.__parkieSpecimens = {
    button: {
      slug: 'button',
      titleKo: '버튼', titleEn: 'Button',
      blocks: [
        { id: 'variants', ko: '종류', en: 'Variants' },
        { id: 'sizes', ko: '크기', en: 'Sizes' },
        { id: 'states', ko: '상태', en: 'States' },
        { id: 'icon', ko: '아이콘 버튼', en: 'Icon button' },
      ],
    },
    segmented: {
      slug: 'segmented',
      titleKo: '세그먼트', titleEn: 'Segmented control',
      blocks: [
        { id: 'stages', ko: '사용 예', en: 'In use' },
        { id: 'states', ko: '상태', en: 'States' },
      ],
    },
    selection: {
      slug: 'selection',
      titleKo: '선택 컨트롤', titleEn: 'Selection controls',
      blocks: [
        { id: 'switch', ko: '스위치', en: 'Switch' },
        { id: 'checkbox', ko: '체크박스', en: 'Checkbox' },
        { id: 'radio', ko: '라디오', en: 'Radio' },
      ],
    },
    select: {
      slug: 'site-select',
      titleKo: '사이트 셀렉트', titleEn: 'Site select',
      blocks: [
        { id: 'states', ko: '상태', en: 'States' },
      ],
    },
    badge: {
      slug: 'badge',
      titleKo: '뱃지', titleEn: 'Badge',
      blocks: [
        { id: 'kinds', ko: '종류', en: 'Kinds' },
      ],
    },
    statuslabel: {
      slug: 'status-label',
      titleKo: '상태 라벨', titleEn: 'Status label',
      blocks: [
        { id: 'dot', ko: '점', en: 'Dot' },
        { id: 'subtle', ko: '연한 채움', en: 'Subtle' },
        { id: 'solid', ko: '진한 채움', en: 'Solid' },
      ],
    },
    alert: {
      slug: 'alert',
      titleKo: '알림', titleEn: 'Alert',
      blocks: [
        { id: 'intents', ko: '의도', en: 'Intents' },
        { id: 'badges', ko: '알림 뱃지', en: 'Alert badge' },
      ],
    },
    alertfeed: {
      slug: 'alert-feed-item',
      titleKo: '이벤트 피드 행', titleEn: 'Alert feed item',
      blocks: [
        { id: 'rows', ko: '행', en: 'Rows' },
      ],
    },
    topbar: {
      slug: 'top-bar',
      titleKo: '상단바', titleEn: 'Top bar',
      blocks: [
        { id: 'bar', ko: '구성', en: 'Composition' },
      ],
    },
    robotcard: {
      slug: 'robot-card',
      titleKo: '로봇 카드', titleEn: 'Robot card',
      blocks: [
        { id: 'cards', ko: '카드', en: 'Cards' },
      ],
    },
    media: {
      slug: 'media-emergency',
      titleKo: '미디어·비상 제어', titleEn: 'Media and emergency',
      blocks: [
        { id: 'stream', ko: '스트림 상태', en: 'Stream states' },
        { id: 'controls', ko: '제어', en: 'Controls' },
      ],
    },
  };

  /* The bundle on the downloads page walks these in order, so the numbered
     folders come out in the order the sidebar documents them. */
  window.__parkieSpecimenOrder = [
    'button', 'segmented', 'selection', 'select', 'badge', 'statuslabel',
    'alert', 'alertfeed', 'topbar', 'robotcard', 'media',
  ];
}());
