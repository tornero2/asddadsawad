import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AbsoluteFill,
  Video,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  delayRender,
  continueRender,
} from 'remotion';
import { colors } from '../utils/theme';
import {
  ThreadPost,
  type Segment,
  type Paragraph,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_PADDING_X,
  PARAGRAPH_GAP,
  BODY_TEXT_STYLE,
} from '../thread/ThreadPost';
import type { CardConfig } from './MainVideo';

interface SplitScreenReadingProps {
  avatarVideoSrc: string;
  segments: Segment[];
  startTime?: number;
  title?: string;
  card: CardConfig;
}

const PARAGRAPH_GAP_SEC = 0.9;
const PARAGRAPH_MAX_CHARS = 420;
const PARAGRAPH_MIN_CHARS = 150;
const SAFETY_PX = 4;

/** Последний сегмент, который уже начался — маркер не пропадает в паузах */
function findActiveSegment(segments: Segment[], time: number): Segment | undefined {
  if (!segments.length) return undefined;
  let active = segments[0];
  for (const s of segments) {
    if (s.start <= time) active = s;
    else break;
  }
  return active;
}

function toParagraphs(segments: Segment[]): Paragraph[] {
  const out: Paragraph[] = [];
  let cur: Paragraph = [];
  let len = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const prev = segments[i - 1];
    const gap = prev ? seg.start - prev.end : 0;
    const t = seg.text.trim();

    const tooLong = len + t.length > PARAGRAPH_MAX_CHARS;
    const pauseBreak = gap > PARAGRAPH_GAP_SEC && len >= PARAGRAPH_MIN_CHARS;

    if (cur.length > 0 && (tooLong || pauseBreak)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(seg);
    len += t.length;
  }
  if (cur.length) out.push(cur);

  if (out.length > 1) {
    const last = out[out.length - 1];
    const lastLen = last.reduce((n, s) => n + s.text.trim().length, 0);
    if (lastLen < PARAGRAPH_MIN_CHARS) out[out.length - 2].push(...out.pop()!);
  }
  return out;
}

/** React-стиль → inline style DOM-элемента */
function applyStyle(el: HTMLElement, style: React.CSSProperties) {
  const unitless = new Set(['lineHeight', 'fontWeight', 'opacity', 'zIndex', 'flex']);
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined || v === null) continue;
    const val = typeof v === 'number' && !unitless.has(k) ? `${v}px` : String(v);
    (el.style as any)[k] = val;
  }
}

/**
 * Набивает страницы в реальном DOM: добавляет предложения по одному,
 * пока контейнер не переполнится. Абзац рвётся на границе предложения,
 * поэтому внизу карточки не остаётся пустого места.
 */
function packPagesInDom(paragraphs: Paragraph[], width: number, available: number): Paragraph[][] {
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'absolute',
    left: '-99999px',
    top: '0',
    width: `${width}px`,
    height: `${available}px`,
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
  } as CSSStyleDeclaration);
  document.body.appendChild(box);

  const overflowed = () => box.scrollHeight > box.clientHeight;

  const pages: Paragraph[][] = [];
  let page: Paragraph[] = [];

  const newP = () => {
    const p = document.createElement('p');
    applyStyle(p, BODY_TEXT_STYLE);
    if (box.childElementCount > 0) {
      (box.lastElementChild as HTMLElement).style.marginBottom = `${PARAGRAPH_GAP}px`;
    }
    box.appendChild(p);
    return p;
  };

  const closePage = () => {
    if (page.length) pages.push(page);
    page = [];
    box.innerHTML = '';
  };

  for (const para of paragraphs) {
    let p = newP();
    let chunk: Paragraph = [];

    for (const seg of para) {
      const span = document.createElement('span');
      span.textContent = (p.childElementCount ? ' ' : '') + seg.text.trim();
      p.appendChild(span);

      if (overflowed()) {
        p.removeChild(span);

        if (chunk.length) {
          page.push(chunk);
        } else {
          box.removeChild(p);
          if (box.lastElementChild) (box.lastElementChild as HTMLElement).style.marginBottom = '0';
        }

        closePage();
        p = newP();
        chunk = [];

        span.textContent = seg.text.trim();
        p.appendChild(span);
      }
      chunk.push(seg);
    }

    if (chunk.length) page.push(chunk);
  }

  closePage();
  document.body.removeChild(box);
  return pages;
}

export const SplitScreenReading: React.FC<SplitScreenReadingProps> = ({
  avatarVideoSrc,
  segments,
  startTime = 0,
  title = '',
  card,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sorted = useMemo(
    () => [...(segments ?? [])].sort((a, b) => a.start - b.start).map((s, i) => ({ ...s, id: i })),
    [segments],
  );
  const paragraphs = useMemo(() => toParagraphs(sorted), [sorted]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Paragraph[][] | null>(null);
  const [handle] = useState(() => delayRender('Measuring thread pages'));

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || !paragraphs.length) {
      continueRender(handle);
      return;
    }

    const available = body.clientHeight - SAFETY_PX;
    const width = CARD_WIDTH - CARD_PADDING_X * 2;

    setPages(packPagesInDom(paragraphs, width, available));
    continueRender(handle);
  }, [paragraphs, title, handle]);

  const currentTime = frame / fps + startTime;
  const currentSegment = findActiveSegment(sorted, currentTime);

  const pageIndex = useMemo(() => {
    if (!pages || !pages.length) return 0;
    let idx = 0;
    for (let i = 0; i < pages.length; i++) {
      const first = pages[i][0]?.[0];
      if (first && first.start <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [pages, currentTime]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Левая половина — видео */}
        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
          {avatarVideoSrc ? (
            <Video
              src={staticFile(avatarVideoSrc)}
              loop
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 40,
              height: '100%',
              background: `linear-gradient(to right, transparent, ${colors.background})`,
            }}
          />
        </div>

        {/* Правая половина — карточка на всю площадь */}
        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              overflow: 'hidden',
            }}
          >
            <ThreadPost
              username={card.username}
              timestamp={card.timestamp}
              badge={card.badge}
              brand={card.brand}
              year={card.year}
              avatarSrc={card.avatar || 'channel-avatar.png'}
              title={title}
              paragraphs={pages ? pages[pageIndex] ?? [] : []}
              currentSegmentId={currentSegment?.id}
              page={pageIndex + 1}
              totalPages={Math.max(pages?.length ?? 1, 1)}
              bodyRef={bodyRef}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};