import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
  delayRender,
  continueRender,
} from 'remotion';
import { getVideoMetadata } from '@remotion/media-utils';
import { FullScreenAvatar } from './FullScreenAvatar';
import { SplitScreenReading } from './SplitScreenReading';
import { CommentOverlay } from './CommentOverlay';
import { ParticleFloat } from '../effects/ParticleFloat';
import { loadTimestamps } from '../utils/timestampLoader';

interface MainVideoProps {
  audioSrc: string;
  timestampsSrc: string;
  commentImages: string[];
}

const INTRO_VIDEO = 'avatar1.mp4';

export const MainVideo: React.FC<MainVideoProps> = ({ audioSrc, timestampsSrc, commentImages }) => {
  const { fps } = useVideoConfig();
  const [segments, setSegments] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [introDuration, setIntroDuration] = useState<number | null>(null);
  const [handle] = useState(() => delayRender('Loading intro video metadata'));

  useEffect(() => {
    loadTimestamps(timestampsSrc).then((data) => {
      if (data) {
        setSegments(data.segments);
        setTitle(data.title ?? '');
      }
    });
  }, [timestampsSrc]);

  // Реальная длина avatar1.mp4 в кадрах
  useEffect(() => {
    getVideoMetadata(staticFile(INTRO_VIDEO))
      .then((meta) => {
        setIntroDuration(Math.round(meta.durationInSeconds * fps));
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
        setIntroDuration(450);
        continueRender(handle);
      });
  }, [fps, handle]);

  if (!segments.length || introDuration === null) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#0F1117',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#F5EFE6', fontSize: 24 }}>Загрузка...</div>
      </AbsoluteFill>
    );
  }

  const READING = 9000;
  const OPINION = 1200;
  const OUTRO = 600;

  const reading1Start = introDuration;
  const opinion1Start = reading1Start + READING;
  const reading2Start = opinion1Start + OPINION;
  const opinion2Start = reading2Start + READING;
  const reading3Start = opinion2Start + OPINION;
  const outroStart = reading3Start + READING;

  const timeline = {
    intro: { start: 0, duration: introDuration },
    reading1: { start: reading1Start, duration: READING },
    opinion1: { start: opinion1Start, duration: OPINION },
    reading2: { start: reading2Start, duration: READING },
    opinion2: { start: opinion2Start, duration: OPINION },
    reading3: { start: reading3Start, duration: READING },
    outro: { start: outroStart, duration: OUTRO },
  };

  const AUDIO_START = timeline.intro.duration;
  const AUDIO_DURATION = timeline.outro.start + timeline.outro.duration - AUDIO_START;

  // Время внутри audio.mp3 (timestamps привязаны к аудио, не к композиции)
  const audioTime = (compositionFrame: number) => (compositionFrame - AUDIO_START) / fps;

  return (
    <AbsoluteFill>
      <ParticleFloat density={15} color="#FBBF24" />

      <Sequence from={AUDIO_START} durationInFrames={AUDIO_DURATION}>
        <Audio src={staticFile(audioSrc)} />
      </Sequence>

      <Sequence
        from={timeline.intro.start}
        durationInFrames={timeline.intro.duration}
        premountFor={30}
      >
        <FullScreenAvatar videoSrc={INTRO_VIDEO} />
      </Sequence>

      <Sequence
        from={timeline.reading1.start}
        durationInFrames={timeline.reading1.duration}
        premountFor={30}
      >
        <SplitScreenReading
          avatarVideoSrc="avatar2.mp4"
          audioSrc={audioSrc}
          segments={segments}
          startTime={audioTime(timeline.reading1.start)}
          title={title}
        />
      </Sequence>

      <Sequence
        from={timeline.opinion1.start}
        durationInFrames={timeline.opinion1.duration}
        premountFor={30}
      >
        <FullScreenAvatar videoSrc="avatar3.mp4" loop />
      </Sequence>

      <Sequence
        from={timeline.reading2.start}
        durationInFrames={timeline.reading2.duration}
        premountFor={30}
      >
        <SplitScreenReading
          avatarVideoSrc="avatar2.mp4"
          audioSrc={audioSrc}
          segments={segments}
          startTime={audioTime(timeline.reading2.start)}
          title={title}
        />
      </Sequence>

      <Sequence
        from={timeline.opinion2.start}
        durationInFrames={timeline.opinion2.duration}
        premountFor={30}
      >
        <FullScreenAvatar videoSrc="avatar3.mp4" loop />
      </Sequence>

      <Sequence
        from={timeline.reading3.start}
        durationInFrames={timeline.reading3.duration}
        premountFor={30}
      >
        <SplitScreenReading
          avatarVideoSrc="avatar2.mp4"
          audioSrc={audioSrc}
          segments={segments}
          startTime={audioTime(timeline.reading3.start)}
          title={title}
        />
      </Sequence>

      <Sequence
        from={timeline.outro.start}
        durationInFrames={timeline.outro.duration}
        premountFor={30}
      >
        <FullScreenAvatar videoSrc="avatar3.mp4" />
      </Sequence>

      {commentImages.length > 0 && (
        <Sequence from={AUDIO_START} durationInFrames={600}>
          <CommentOverlay commentImages={commentImages} interval={90} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};