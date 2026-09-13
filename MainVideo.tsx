import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { FullScreenAvatar } from './FullScreenAvatar';
import { SplitScreenReading } from './SplitScreenReading';
import { CommentOverlay } from './CommentOverlay';
import { ParticleFloat } from '../effects/ParticleFloat';
import type { Segment } from '../thread/ThreadPost';

export interface VideoBlock {
  id: string;
  type: 'story' | 'opinion';
  src: string;
  duration: number;
  segments: Segment[];
}

export interface CardConfig {
  username: string;
  avatar: string;
  timestamp: string;
  brand: string;
  year: string;
  title: string;
  badge: string;
}

export interface CommentsConfig {
  images: string[];
  intervalSec: number;
  totalSec: number;
  startMode: 'first-story' | 'offset';
  offsetSec: number;
}

export interface AvatarsConfig {
  intro: string;
  introDuration: number;
  reading: string;
  opinion: string;
}

export interface MainVideoProps {
  fps: number;
  avatars: AvatarsConfig;
  blocks: VideoBlock[];
  card: CardConfig;
  comments: CommentsConfig;
}

interface TimelineItem extends VideoBlock {
  from: number;
  durationInFrames: number;
  storyOffsetSec: number;
}

/** Раскладывает блоки подряд и склеивает сегменты историй в сквозную ленту */
function buildTimeline(blocks: VideoBlock[], fps: number, offsetFrames: number) {
  const items: TimelineItem[] = [];
  const allSegments: Segment[] = [];
  let cursor = offsetFrames;
  let storyOffsetSec = 0;
  let id = 0;

  for (const block of blocks) {
    const durationInFrames = Math.round(block.duration * fps);
    items.push({ ...block, from: cursor, durationInFrames, storyOffsetSec });
    cursor += durationInFrames;

    if (block.type === 'story') {
      for (const s of block.segments) {
        allSegments.push({
          id: id++,
          start: s.start + storyOffsetSec,
          end: s.end + storyOffsetSec,
          text: s.text,
        });
      }
      storyOffsetSec += block.duration;
    }
  }

  return { items, allSegments };
}

export const MainVideo: React.FC<MainVideoProps> = ({ avatars, blocks, card, comments }) => {
  const { fps } = useVideoConfig();

  const introFrames = Math.round((avatars.introDuration ?? 0) * fps);

  const { items, allSegments } = React.useMemo(
    () => buildTimeline(blocks, fps, introFrames),
    [blocks, fps, introFrames],
  );

  const PRE = fps; // секунда предзагрузки видео, убирает чёрный кадр на стыках
  const firstStory = items.find((it) => it.type === 'story');

  const storyStart = firstStory?.from ?? introFrames;
  const commentsStart =
    comments.startMode === 'offset'
      ? storyStart + Math.round(comments.offsetSec * fps)
      : storyStart;

  if (!blocks.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#0F1117',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#F5EFE6',
          fontSize: 24,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Блоки не заданы — соберите проект в панели
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0F1117' }}>
      <ParticleFloat density={15} color="#FBBF24" />

      {avatars.intro && introFrames > 0 ? (
        <Sequence from={0} durationInFrames={introFrames} premountFor={PRE}>
          <FullScreenAvatar videoSrc={avatars.intro} />
        </Sequence>
      ) : null}

      {items.map((item) => (
        <Sequence
          key={item.id}
          from={item.from}
          durationInFrames={item.durationInFrames}
          premountFor={PRE}
        >
          <Audio src={staticFile(item.src)} />

          {item.type === 'story' ? (
            <SplitScreenReading
              avatarVideoSrc={avatars.reading}
              segments={allSegments}
              startTime={item.storyOffsetSec}
              title={card.title}
              card={card}
            />
          ) : (
            <FullScreenAvatar videoSrc={avatars.opinion} loop muted />
          )}
        </Sequence>
      ))}

      {comments.images.length > 0 ? (
        <Sequence from={commentsStart} durationInFrames={Math.round(comments.totalSec * fps)}>
          <CommentOverlay
            commentImages={comments.images}
            interval={Math.round(comments.intervalSec * fps)}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};