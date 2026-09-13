import React from 'react';
import { AbsoluteFill, Video, staticFile } from 'remotion';
import { colors } from '../utils/theme';

interface FullScreenAvatarProps {
  videoSrc: string;
  loop?: boolean;
  muted?: boolean;
}

export const FullScreenAvatar: React.FC<FullScreenAvatarProps> = ({
  videoSrc,
  loop = false,
  muted = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <AbsoluteFill>
        <Video
          src={staticFile(videoSrc)}
          loop={loop}
          muted={muted}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle, transparent 50%, rgba(15, 17, 23, 0.6) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};