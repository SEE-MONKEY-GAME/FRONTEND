import { css } from '@emotion/react';
import { theme } from '@styles/tokens';

export const currentScoreCss = css({
  position: 'absolute',
  top: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 3, 
  fontSize: 20,
  color: '#FFFFFF',
  fontFamily: `${theme.fonts.title}`,
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  marginTop: '16px',
});
