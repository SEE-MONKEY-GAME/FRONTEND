import { css } from '@emotion/react';
import { theme } from '@styles/tokens';

export const guideOverlayCss = css({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  opacity: '0.3',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: 10,
});

export const guideWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: '20',
});

export const guideTabCss = css({
  width: 'calc(100vw - 72px)',
  minWidth: '280px',
});

export const guideCloseButtonCss = css({
  width: '40px',
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  zIndex: '30',
});

export const guideSlideCss = (active: boolean) =>
  css({
    display: active ? 'block' : 'none',
  });

export const guideSlideTextCss = css({
  color: 'white',
  fontFamily: `${theme.fonts.title}`,
  textAlign: 'center',
  lineHeight: '1.5',
  width: 'calc(100vw - 110px)',
  position: 'absolute',
  top: '19.5%',
  left: '50%',
  transform: 'translate(-50%)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',

  '@media (max-width: 374px)': {
    fontSize: `${theme.size.sm}`,
  },
});

export const guideSlideImageCss = css({
  width: 'calc(100vw - 130px)',
  position: 'absolute',
  bottom: '11%',
  left: '50%',
  transform: 'translate(-50%)',
});

export const guideDirectionButtonCss = css({
  width: '64px',
  position: 'absolute',
  top: '45%',
});

export const guidePrevButtonCss = css({
  left: '-30px',
});

export const guideNextButtonCss = css({
  right: '-30px',
});
