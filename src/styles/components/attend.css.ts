import { css } from '@emotion/react';

export const attendOverlayCss = css({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  opacity: '0.3',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: 10,
});

export const attendWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
});

export const attendTabCss = css({
  width: 'calc(100vw - 50px)',
  minWidth: '280px',
});

export const attendCloseButtonCss = css({
  width: '40px',
  position: 'absolute',
  top: '7%',
  right: '-4px',
  zIndex: '30',
});

export const attendGridCss = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  position: 'absolute',
  top: '59%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const attendLastLiCss = css({
  gridColumn: '1 / span 3',
  textAlign: 'center',
});

export const attendImageCss = css({
  height: '96px',

  '@media (max-width: 350px)': {
    height: '88px',
  },
});

export const attendLastImageCss = css({
  height: '80px',

  '@media (max-width: 350px)': {
    height: '72px',
  },
});
