import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Img,
  staticFile,
} from 'remotion';

interface CommentOverlayProps {
  commentImages: string[];
  interval?: number; // сколько кадров живёт каждый коммент
}

// Отступы от краёв кадра и ширина карточки (композиция 1920x1080)
const MARGIN_LEFT = 0;
const MARGIN_BOTTOM = 22;
const COMMENT_WIDTH = 1624;
const COMMENT_HEIGHT = Math.round(486 * (COMMENT_WIDTH / 1760)); // ≈ 338

export const CommentOverlay: React.FC<CommentOverlayProps> = ({
  commentImages,
  interval = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Только один активный коммент — наложения невозможны
  const index = Math.floor(frame / interval);
  if (index < 0 || index >= commentImages.length) return null;

  const localFrame = frame - index * interval;

  const slideIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, mass: 0.5 },
  });

  const fadeOut = interpolate(
    localFrame,
    [interval - 20, interval - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const opacity = Math.min(slideIn, fadeOut);
  const translateY = interpolate(slideIn, [0, 1], [50, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_LEFT,
          bottom: MARGIN_BOTTOM,
          width: COMMENT_WIDTH,
          height: COMMENT_HEIGHT,
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        <Img
          src={staticFile(`comments/${commentImages[index]}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',

            // прижимает карточку к низу блока
            objectPosition: 'left bottom',

            filter: 'drop-shadow(0 12px 48px rgba(0, 0, 0, 0.7))',
            translate: '-40px 90.7px',
            scale: 1.02,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};