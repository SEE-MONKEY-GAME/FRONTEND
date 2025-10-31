import { css } from '@emotion/react';
import { fonts } from '@styles/tokens/fonts';

export const optionOverlayCss = css({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  opacity: '0.3',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: 10,
});

export const optionWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
});

export const optionTabCss = css({
  width: 'calc(100vw - 72px)',
  minWidth: '280px',
});

export const optionCloseButtonCss = css({
  width: '40px',
  position: 'absolute',
  top: '5%',
  right: '-4px',
  zIndex: '30',
});

export const optionContentCss = css({
  position: 'absolute',
  width: 'calc(100% - 60px)',
  left: '50%',
  top: '57%',
  transform: 'translate(-50%, -50%)',
});

export const optionUlCss = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',

  '@media (max-width: 375px)': {
    gap: '8px',
  },
});

export const optionLiCss = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

export const optionIconCss = css({
  width: '25px',
});

export const optionTextCss = css({
  fontFamily: `${fonts.title}`,
});

export const optionTitleCss = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const optionHrCss = css({
  height: '4px',
  border: 'none',
  backgroundColor: '#EBC675',
  margin: '18px 0',

  '@media (max-width: 375px)': {
    margin: '14px 0',
  },
});

export const optionContactButtonCss = css({
  width: '100%',
});

export const optionContactAreaCss = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const optionTextareaCss = css({
  width: 'calc(100% - 36px)',
  height: '7vh',
  backgroundColor: '#EBD3A7',
  borderRadius: '16px',
  fontFamily: `${fonts.body}`,
  padding: '14px',
  marginBottom: '14px',
  border: 'none',
});

export const optionSendButtonCss = css({
  width: '96px',
});
