import { css } from '@emotion/react';
import { theme } from '@styles/tokens';

export const title = css({
  fontFamily: theme.fonts.title,
  fontSize: theme.size['2xl'],
  color: theme.colors.primary,
});

export const title2 = css({
  // color: 'black',
  marginBottom: 20,
});

export const body = css({
  fontFamily: theme.fonts.body,
  fontSize: theme.size.md,
  color: theme.colors.second,
});
