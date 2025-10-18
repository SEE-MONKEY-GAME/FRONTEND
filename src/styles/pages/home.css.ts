import { css } from '@emotion/react';
import { theme } from '@styles/tokens';
import { getImage } from '@utils/get-images';

export const backgroundCss = css({
  height: '100vh',
  backgroundImage: `url(${getImage('home', 'background')})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  padding: '0 16px',
});

export const coinCss = css({
  width: '122px',
  height: '50px',
  backgroundImage: `url(${getImage('home', 'coin')})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  position: 'relative',
  display: 'inline-block',
  margin: '48px 0',
});

export const coinTextCss = css({
  color: 'white',
  position: 'absolute',
  top: '53%',
  right: '16px',
  transform: 'translateY(-50%)',
  fontFamily: `${theme.fonts.title}`,
});

export const bestScoreCss = css({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 24px',
  borderRadius: '16px',
  color: '#FFFFFF',
  fontFamily: `${theme.fonts.title}`,
  marginBottom: '16px',
});

export const bestScoreTextCss = css({
  fontSize: '20px',
});

export const iconButtonGroupCss = css({
  display: 'flex',
  justifyContent: 'space-between',
});

export const iconButtonListCss = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const iconButtonCss = css({
  width: '62px',
});

export const gameStartButtonCss = css({
  textAlign: 'center',
  position: 'fixed',
  left: '50%',
  bottom: '10%',
  transform: 'translateX(-50%)',
});

export const gameStartButtonImageCss = css({
  width: '200px',
});
