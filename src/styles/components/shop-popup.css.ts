import { css } from '@emotion/react';
import type { ImagesProps } from '@pages/home';
import { fonts } from '@styles/tokens/fonts';

export const shopPopuopWrapperCss = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -55%)',
  zIndex: 50,
});

export const shopPopupTabCss = css({
  width: 'calc(100vw - 102px)',
  minWidth: '250px',
  position: 'relative',
  zIndex: 10,
});

export const shopItemDetailCss = css({
  width: 'calc(100vw - 142px)',
  minWidth: '210px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
});

export const shopItemTitleCss = css({
  fontFamily: `${fonts.title}`,
  textAlign: 'center',
  color: '#FFF6D2',
  '-webkit-text-stroke': '0.5px #AC884B',
  textShadow: '0 1.151px 2.303px rgba(0, 0, 0, 0.16)',
  fontSize: '18px',
  marginBottom: '12px',
});

export const shopItemBoxCss = (images: ImagesProps) =>
  css({
    background: `url(${images.shop_box})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    minWidth: '110px',
    minHeight: '110px',
    position: 'relative',
  });

export const shopItemLayoutCss = css({
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
});

export const shopItemBoxResourceCss = css({
  width: '80%',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const shopItemPriceCss = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '2px',
  marginBottom: '4px',
});

export const shopItemPriceNumberCss = css({
  fontFamily: `${fonts.title}`,
  fontSize: '14px',
  color: 'white',
  '-webkit-text-stroke': '0.5px #67602F',
  paddingBottom: '2px',
});

export const shopItemExplainCss = css({
  fontFamily: `${fonts.body}`,
  color: '#533617',
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: '150%',
  marginBottom: '6px',
  paddingRight: '4px',
});

export const shopItemCountCss = css({
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  fontFamily: `${fonts.title}`,
  fontSize: '12px',
  color: 'white',
  '-webkit-text-stroke': '0.5px #947F63',
});

export const shopItemButtonsCss = css({
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  marginTop: '12px',
});

export const shopPopupButtonCss = css({
  width: 'calc((100vw - 182px) / 2)',
  minWidth: '96px',
});
