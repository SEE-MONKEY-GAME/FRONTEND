import { css, keyframes } from '@emotion/react';
import type { ImagesProps } from '@pages/game';
import { theme } from '@styles/tokens';

export const coinCss = (images: ImagesProps) =>
  css({
    position: 'absolute',
    top: 48,
    left: 0,
    width: '110px',
    height: '40px',
    backgroundImage: `url(${images.coin_count})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    zIndex: 3,
    pointerEvents: 'none',
  });

export const coinTextCss = css({
  display: 'flex',
  justifyContent: 'flex-end',
  lineHeight: '40px',
  paddingRight: 16,
  color: '#ffffffff',
  fontFamily: `${theme.fonts.title}`,
  fontSize: 16,
  transform: 'translateY(-2px)',
});

export const currentScoreCss = css({
  position: 'absolute',
  top: 54,
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 3,
  fontSize: 24,
  color: '#FFFFFF',
  fontFamily: `${theme.fonts.title}`,
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const feverWrapCss = css({
  position: 'absolute',
  top: 80,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 320,
  height: 28,
  pointerEvents: 'none',
  zIndex: 3,
  marginTop: 20,
});

export const feverEmptyCss = (images: ImagesProps) =>
  css({
    position: 'absolute',
    inset: 0,
    height: 30,
    backgroundImage: `url(${images.empty_guage_bar})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    backgroundPosition: 'left center',
  });

export const feverFullCss = (images: ImagesProps) =>
  css({
    position: 'absolute',
    inset: 0,
    height: 30,
    backgroundImage: `url(${images.full_guage_bar})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    backgroundPosition: 'left center',
    transition: 'clip-path 120ms linear',
  });

// (임시)
const feverPulse = keyframes`
  0%   { transform: translate(-50%, 0) scale(1);   opacity: 1; }
  50%  { transform: translate(-50%, 0) scale(1.08); opacity: 0.9; }
  100% { transform: translate(-50%, 0) scale(1);   opacity: 1; }
`;

export const feverBadgeCss = css({
  position: 'absolute',
  top: 84,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '4px 12px',
  borderRadius: 999,
  background: 'rgba(255, 215, 0, 0.15)',
  color: '#FFD700',
  fontFamily: `${theme.fonts.title}`,
  fontSize: 18,
  letterSpacing: 2,
  textShadow: '0 0 8px rgba(255, 200, 0, 0.8)',
  border: '1px solid rgba(255, 215, 0, 0.55)',
  zIndex: 4,
  pointerEvents: 'none',
  animation: `${feverPulse} 900ms ease-in-out infinite`,
});

export const overlayCss = css({
  position: 'fixed',
  fontFamily: `${theme.fonts.title}`,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
});

export const panelCss = (images: ImagesProps) =>
  css({
    position: 'relative',
    width: 311,
    height: 392,
    backgroundImage: `url(${images['gameover-tab']})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 28,
  });

export const titleCss = css({
  fontFamily: `${theme.fonts.title}`,
  color: '#fff',
  fontSize: 34,
  textShadow: '3px 3px 2px #854a0e',
  marginTop: 96,
  marginBottom: 8,
});

export const hrCss = css({
  width: 160,
  height: 4,
  background: '#EBC675',
  marginTop: 20,
});

export const statWrapCss = css({
  textAlign: 'center' as const,
});

export const scoreLabelCss = css({
  color: '#854a0e',
  fontSize: 22,
  marginTop: 38,
});

export const scoreValueCss = css({
  color: '#713b12',
  fontSize: 36,
  marginTop: 20,
});

export const coinCss2 = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#CA8504',
  marginTop: 20,
  fontSize: 22,
  fontFamily: `${theme.fonts.title}`,
});

export const coinImgCss = css({
  width: 24,
  height: 24,
  marginRight: 6,
  display: 'block',
});

export const btnRowCss = css({
  marginTop: 'auto',
  marginBottom: -15,
  display: 'flex',
  gap: 14,
});

export const iconBtnCss = css({
  width: 60.51,
  height: 60.51,
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  '& img': {
    width: '100%',
    height: '100%',
    display: 'block',
  },
});

const shrinkCircle = keyframes`
  from { transform: translateY(-50%) scale(20); }
  to   { transform: translateY(-50%) scale(0); }
`;

export const circleCss = css({
  position: 'fixed',
  top: '50%',
  backgroundColor: 'black',
  width: '100vw',
  aspectRatio: '1',
  borderRadius: '50%',
  animation: `${shrinkCircle} 1s ease-in-out forwards`,
  zIndex: 100,
  pointerEvents: 'none',
});
