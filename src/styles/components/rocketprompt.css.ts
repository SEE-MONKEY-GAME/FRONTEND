import { css, keyframes } from '@emotion/react';
import { fonts } from '@styles/tokens/fonts';

export const overlayCss = css({
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  textAlign: 'center',
  padding: '24px',
});

export const titleCss = css({
  fontSize: '26px',
  fontWeight: 800,
  letterSpacing: '0.2px',
  fontFamily: `${fonts.title}`,
  textShadow: '2px 2px 4px #713B12',
  marginTop: '20px',
});

export const descCss = css({
  marginTop: '4px',
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#D6D6D6',
  whiteSpace: 'pre-line',
  fontFamily: `${fonts.body}`,
});

export const effectHostCss = css({
  position: 'relative',
  width: '180px',
  height: '180px',
  margin: '32px auto 6px',
});


const rocketEffectAnim = keyframes({
  '0%':   { backgroundPosition: '0px 0px' },
  '10%':  { backgroundPosition: '-550px 0px' },
  '20%':  { backgroundPosition: '-1100px 0px' },
  '30%':  { backgroundPosition: '-1650px 0px' },
  '40%':  { backgroundPosition: '-2200px 0px' },
  '50%':  { backgroundPosition: '0px -550px' },
  '60%':  { backgroundPosition: '-550px -550px' },
  '70%':  { backgroundPosition: '-1100px -550px' },
  '80%':  { backgroundPosition: '-1650px -550px' },
  '90%':  { backgroundPosition: '-2200px -550px' },
  '100%': { backgroundPosition: '0px 0px' },
});

export const effectSpriteCss = (sheetUrl: string) =>
  css({
    position: 'absolute',
    left: '-102%',
    top: '-100%',
    width: '550px',
    height: '550px',
    transform: 'scale(0.9)',
    transformOrigin: 'center center',
    backgroundImage: `url(${sheetUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '2750px 1100px',
    imageRendering: 'pixelated',
    zIndex: 0,
    pointerEvents: 'none',
    animation: `${rocketEffectAnim} 1000ms steps(1) infinite`,
    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35))',
  });

export const iconCss = css({
  position: 'relative',
  zIndex: 1,
  display: 'block',
  width: '180px',
  height: '180px',
  imageRendering: 'pixelated',
  userSelect: 'none',
  pointerEvents: 'none',
});

export const buttonsCss = css({
  display: 'flex',
  gap: '16px',
  marginTop: '28px',
  justifyContent: 'center',
  '& > img': {
    cursor: 'pointer',
    height: '44px',
    imageRendering: 'pixelated',
    userSelect: 'none',
  },
});
