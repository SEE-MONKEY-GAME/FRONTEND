import { css } from '@emotion/react';
import { colors } from '@styles/tokens/colors';
import { fonts } from '@styles/tokens/fonts';

export const toggleCss = css({
  width: '65px',
  height: '28px',
  border: `2px solid ${colors.Yellow600}`,
  borderRadius: '28px',
  cursor: 'pointer',
  position: 'relative',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s',
});

export const toggleOnCss = css({
  backgroundColor: colors.GreenLight700,
});

export const toggleOffCss = css({
  backgroundColor: colors.Grey600,
});

export const toggleInnerCss = css({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  cursor: 'pointer',
  boxShadow: `1px 0 1px rgba(91, 91, 91, 0.20)`,
  transition: 'background, left 0.2s',
  position: 'absolute',
  top: '-2px',
});

export const toggleInnerOnCss = css({
  background: `radial-gradient(50% 50% at 50% 50%, #9BEE59 0%, #66C61C 100%)`,
  left: '35px',
});

export const toggleInnerOffCss = css({
  background: `radial-gradient(50% 50% at 50% 50%, #737373 0%, #5A5A5A 100%)`,
  left: '-2px',
});

export const toggleTextCss = css({
  color: 'white',
  fontFamily: `${fonts.title}`,
  fontSize: '12px',
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  trasition: 'left 0.2s',
});

export const toggleTextOnCss = css({
  left: '12px',
});

export const toggleTextOffCss = css({
  left: '32px',
});
