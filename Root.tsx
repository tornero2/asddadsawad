import React from 'react';
import { Composition, staticFile } from 'remotion';
import { getVideoMetadata, getAudioDurationInSeconds } from '@remotion/media-utils';
import { MainVideo, AudioBlock } from './compositions/MainVideo';

const FPS = 60;
const INTRO_VIDEO = 'avatar1.mp4';

// Порядок блоков = порядок в видео. Добавляйте/убирайте свободно.
const BLOCKS: AudioBlock[] = [
  { type: 'story', src: 'part1.mp3', timestamps: 'part1.json' },
  { type: 'opinion', src: 'opinion1.mp3' },
  { type: 'story', src: 'part2.mp3', timestamps: 'part2.json' },
  { type: 'opinion', src: 'opinion2.mp3' },
  { type: 'story', src: 'part3.mp3', timestamps: 'part3.json' },
  { type: 'opinion', src: 'opinion3.mp3' },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={FPS * 60}
        calculateMetadata={async ({ props }) => {
          const intro = await getVideoMetadata(staticFile(INTRO_VIDEO));
          const durations = await Promise.all(
            props.blocks.map((b) => getAudioDurationInSeconds(staticFile(b.src))),
          );
          const total =
            Math.round(intro.durationInSeconds * FPS) +
            durations.reduce((sum, s) => sum + Math.round(s * FPS), 0);
          return { durationInFrames: total };
        }}
        defaultProps={{
          blocks: BLOCKS,
          commentImages: [
            'comment1.png',
            'comment2.png',
            'comment3.png',
            'comment4.png',
            'comment5.png',
          ],
        }}
      />
    </>
  );
};