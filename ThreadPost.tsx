import React from 'react';
import { Img, staticFile } from 'remotion';

export interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

/** Абзац = группа сегментов */
export type Paragraph = Segment[];

interface ThreadPostProps {
  username: string;
  timestamp: string;
  title: string;
  paragraphs?: Paragraph[];
  currentSegmentId?: number;
  page?: number;
  totalPages?: number;
  avatarSrc?: string;
  badge?: string;
  brand?: string;
  year?: string;
  width?: number;
  height?: number;
  /** Ref на контейнер абзацев — нужен для измерения свободного места */
  bodyRef?: React.Ref<HTMLDivElement>;
}

const GRAY = 'rgb(113, 113, 122)';
const GRAY_DARK = 'rgb(82, 82, 91)';
const TEXT = 'rgb(29, 29, 31)';
const BODY = 'rgb(66, 66, 69)';
const MUTED = 'rgb(134, 134, 139)';
const FONT = 'Inter, sans-serif';

// Маркер: сплошной жёлтый на всю высоту строки
const HIGHLIGHT_BG = '#F6C927';
const HIGHLIGHT_TEXT = 'rgb(29, 29, 31)';

// Геометрия и стили текста — экспортируются, чтобы измеритель в
// SplitScreenReading использовал ровно те же значения
export const CARD_WIDTH = 960;
export const CARD_HEIGHT = 1080;
export const CARD_PADDING_X = 34;   // было 28, при большей ширине смотрится лучше
export const PARAGRAPH_GAP = 10;

export const TITLE_STYLE: React.CSSProperties = {
  fontWeight: 700,
  lineHeight: 1.15,
  color: TEXT,
  fontSize: 29,
  letterSpacing: '-0.025em',
  fontFamily: FONT,
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  margin: 0,
  padding: 0,
};

export const BODY_TEXT_STYLE: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  fontFamily: FONT,
  lineHeight: 1.5,
  letterSpacing: '-0.003em',
  color: BODY,
  margin: 0,
  padding: 0,
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
};

const IconButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button
    style={{
      padding: 8,
      borderRadius: '50%',
      backgroundColor: 'rgb(245, 245, 247)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </button>
);

export const ThreadPost: React.FC<ThreadPostProps> = ({
  username,
  timestamp,
  title,
  paragraphs = [],
  currentSegmentId,
  page = 1,
  totalPages = 1,
  avatarSrc = 'channel-avatar.png',
  badge = '',
  brand = 'Jawerly Diaries',
  year = '2026',
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
  bodyRef,
}) => {
  const total = Math.max(totalPages, 1);
  const dots = Math.min(total, 41);
  const activeDot = Math.max(
    0,
    Math.min(dots - 1, Math.round(((page - 1) / Math.max(total - 1, 1)) * (dots - 1))),
  );

  return (
    <div
      style={{
        borderRadius: 0,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width,
        height,
        border: '0.5px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Верхняя полоса */}
      <div
        style={{
          width: '100%',
          flexShrink: 0,
          height: 2.5,
          background: `linear-gradient(to right, ${GRAY}, ${GRAY_DARK})`,
          opacity: 0.8,
        }}
      />

      {/* Шапка */}
      <div style={{ padding: `24px ${CARD_PADDING_X}px 8px`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                borderRadius: '50%',
                overflow: 'hidden',
                height: 66,
                width: 66,
                flexShrink: 0,
                border: '1.5px solid rgba(0, 0, 0, 0.06)',
                backgroundColor: 'rgb(245, 245, 247)',
              }}
            >
              <Img
                src={staticFile(avatarSrc)}
                style={{ height: '100%', width: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: TEXT,
                    letterSpacing: '-0.01em',
                    fontSize: 23,
                    fontFamily: FONT,
                  }}
                >
                  {username}
                </span>
                {badge ? (
                  <span
                    style={{
                      borderRadius: 9999,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: 'rgba(113, 113, 122, 0.08)',
                      color: GRAY,
                      fontSize: 15,
                      padding: '3px 12px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {badge}
                  </span>
                ) : (
                  <span
                    style={{
                      width: 22,
                      height: 5,
                      borderRadius: 9999,
                      background: 'rgba(113, 113, 122, 0.25)',
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  color: MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 20,
                  gap: 6,
                  fontFamily: FONT,
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: GRAY, opacity: 0.7 }}
                >
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                  <path d="M20 2v4" />
                  <path d="M22 4h-4" />
                  <circle cx="4" cy="20" r="2" />
                </svg>
                {timestamp}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconButton>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#86868b"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </IconButton>
            <IconButton>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#86868b"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>

      {/* Тело */}
      <div
        style={{
          padding: `12px ${CARD_PADDING_X}px`,
          flex: '1 1 0%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {title ? (
          <div style={{ position: 'relative', marginBottom: 18, flexShrink: 0 }}>
            <div
              style={{
                position: 'absolute',
                left: -CARD_PADDING_X,
                top: 0,
                bottom: 0,
                width: 3,
                borderRadius: 9999,
                background: `linear-gradient(${GRAY}, ${GRAY_DARK})`,
                opacity: 0.7,
              }}
            />
            <h2 style={TITLE_STYLE}>{title}</h2>
          </div>
        ) : null}

        <div ref={bodyRef} style={{ flex: '1 1 0%', minHeight: 0, overflow: 'hidden' }}>
          {paragraphs.map((para, pi) => (
            <p
              key={para[0]?.id ?? pi}
              style={{
                ...BODY_TEXT_STYLE,
                marginBottom: pi === paragraphs.length - 1 ? 0 : PARAGRAPH_GAP,
              }}
            >
              {para.map((seg, si) => {
                const active = seg.id === currentSegmentId;
                const text = seg.text.trim();
                return (
                  <React.Fragment key={seg.id}>
                    {active ? (
                      <span
                        style={{
                          backgroundColor: HIGHLIGHT_BG,
                          color: HIGHLIGHT_TEXT,
                          padding: '0.2em 0',
                          boxDecorationBreak: 'clone',
                          WebkitBoxDecorationBreak: 'clone',
                        }}
                      >
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                    {si < para.length - 1 ? ' ' : null}
                  </React.Fragment>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      {/* Футер */}
      <div style={{ padding: `16px ${CARD_PADDING_X}px 24px`, flexShrink: 0 }}>
        <div
          style={{
            marginBottom: 16,
            marginLeft: -CARD_PADDING_X,
            marginRight: -CARD_PADDING_X,
            height: 0.5,
            background:
              'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.06) 15%, rgba(0, 0, 0, 0.06) 85%, transparent)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontSize: 17,
                color: MUTED,
                letterSpacing: '0.01em',
              }}
            >
              {brand}
            </span>
            <span style={{ width: 26, height: 0.5, background: 'rgba(0, 0, 0, 0.15)' }} />
            <span
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontSize: 12,
                color: MUTED,
              }}
            >
              {year}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.035)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: dots }).map((_, i) => (
                <div
                  key={i}
                  style={
                    i === activeDot
                      ? {
                          width: 16,
                          height: 5,
                          background: `linear-gradient(to right, ${GRAY}, ${GRAY_DARK})`,
                          borderRadius: 100,
                        }
                      : {
                          width: 5,
                          height: 5,
                          background: 'rgba(0, 0, 0, 0.12)',
                          borderRadius: 100,
                        }
                  }
                />
              ))}
            </div>
            <span
              style={{
                fontWeight: 500,
                fontSize: 11,
                color: MUTED,
                fontFamily: '"SF Mono", "Fira Code", monospace',
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {page}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Декоративное свечение в углу */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 160,
          height: 160,
          borderBottomLeftRadius: '100%',
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at right top, rgba(113, 113, 122, 0.03), transparent 70%)',
        }}
      />
    </div>
  );
};