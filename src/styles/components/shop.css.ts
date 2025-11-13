import { css } from '@emotion/react';
import type { ImagesProps } from '@pages/home';
import { colors } from '@styles/tokens/colors';
import { fonts } from '@styles/tokens/fonts';

export const shopOverlayCss = (overlay: boolean) =>
  css({
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    opacity: '0.3',
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: overlay ? 30 : 10,
  });

export const shopWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -55%)',
  zIndex: 20,
});

export const shopSelectCss = css({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  top: '36px',
  zIndex: 0,
});

export const shopOptionCss = (index: number, images: ImagesProps) =>
  css({
    fontFamily: `${fonts.title}`,
    fontSize: '18px',
    color: `${colors.Yellow100}`,
    textShadow: '0 1.151px 2.303px rgba(0, 0, 0, 0.16)',
    '-webkit-text-stroke': index === 1 ? `0.8px #814711` : `0.8px #AC884B`,
    letterSpacing: '-0.368px',
    background: `url(${images[`shop_tab_${index}` as keyof ImagesProps]})`,
    backgroundSize: '100% auto',
    backgroundRepeat: 'no-repeat',
    width: 'calc((100vw - 102px) / 2)',
    minWidth: '120px',
    height: '80px',
    textAlign: 'center',
    lineHeight: '50px',
  });

export const shopTabCss = css({
  width: 'calc(100vw - 72px)',
  minWidth: '280px',
  position: 'relative',
  zIndex: 10,
});

export const shopCloseButtonCss = css({
  width: '40px',
  position: 'absolute',
  top: '17%',
  right: '-4px',
  zIndex: 30,
});

export const shopGridCss = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  position: 'absolute',
  zIndex: 20,
  gap: '15px 0px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -35%)',
});

export const shopBoxCss = (images: ImagesProps) =>
  css({
    background: `url(${images.shop_box})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: 'calc((100vw - 102px) / 2)',
    aspectRatio: '1',
    minWidth: '120px',
    position: 'relative',
  });

export const shopItemButtonCss = (images: ImagesProps) =>
  css({
    background: `url(${images.shop_price})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: '72px',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: '4px 4px 8px 0',
    fontFamily: `${fonts.title}`,
    fontSize: '15px',
    color: 'white',
    '-webkit-text-stroke': '0.6px #36672F',
    position: 'relative',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
  });

export const shopItemUseButtonCss = css({
  position: 'relative',
  top: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
});

export const shopItemCountCss = css({
  backgroundColor: `${colors.Orange500}`,
  border: `1px solid ${colors.Orange600}`,
  color: 'white',
  fontFamily: `${fonts.title}`,
  borderRadius: '50%',
  minWidth: '12px',
  maxWidth: '12px',
  height: '12px',
  padding: '3px',
  fontSize: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: 12,
  right: 16,
});

export const shopResourceCss = css({
  width: '70%',
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const shopReadyCss = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: `${fonts.body}`,
  fontWeight: 600,
  color: `${colors.Yellow600}`,
});
