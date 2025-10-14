import { css, keyframes } from '@emotion/react';
import { theme } from '@styles/tokens';
import { getImage } from '@utils/get-images';

export const coinCss = css({
  position: 'absolute',
  top: 20,
  left: 12,
  width: 94,
  height: 50,
  backgroundImage: `url(${getImage('game', 'coin')})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingRight: 16,
  zIndex: 3,
  pointerEvents: 'none',
});

export const coinTextCss = css({
  color: '#ffffffff',
  fontFamily: `${theme.fonts.title}`,
  fontSize: 16,
  transform: 'translateY(-2px)',
});

export const currentScoreCss = css({
  position: 'absolute',
  top: 32,
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
  top: 48,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 320, 
  height: 28,
  pointerEvents: 'none',
  zIndex: 3,
  marginTop: 20,
});

export const feverEmptyCss = css({
  position: 'absolute',
  inset: 0,
  height: 30,
  backgroundImage: `url(${getImage('game', 'empty_guage_bar')})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  backgroundPosition: 'left center',
});

export const feverFullCss = css({
  position: 'absolute',
  inset: 0,
  height: 30,
  backgroundImage: `url(${getImage('game', 'full_guage_bar')})`,
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
