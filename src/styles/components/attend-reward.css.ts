import { css, keyframes } from '@emotion/react';
import { colors } from '@styles/tokens/colors';
import { fonts } from '@styles/tokens/fonts';

export const attendRewardOverlayCss = css({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  opacity: '0.7',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: 30,
});

export const attendRewardEffectCss = css({
  position: 'absolute',
  top: '43%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 35,
  width: 'calc(100vw - 12px)',
});

export const attendRewardWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 40,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '26px',
});

export const attendRewardItemCss = css({
  width: '150px',
});

export const attendRewardTextCss = css({
  width: '100vw',
  fontFamily: `${fonts.title}`,
  color: 'white',
  textAlign: 'center',
  fontSize: '22px',
  lineHeight: '1.6',

  span: {
    color: `${colors.Yellow300}`,
  },
});

export const attendRewardButtonCss = css({
  width: '120px',
});
