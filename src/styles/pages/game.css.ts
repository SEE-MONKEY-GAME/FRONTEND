import { css } from '@emotion/react';
import { theme } from '@styles/tokens';
import { getImage } from '@utils/get-images';

export const coinCss = css({
  position: 'absolute',
  top: 20,
  left: 24,
  width: '94px',
  height: '50px',
  backgroundImage: `url(${getImage('game', 'coin')})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingRight: '16px',
  zIndex: 3,
  pointerEvents: 'none',        // ✅ 추가: UI가 입력을 막지 않음
});

export const coinTextCss = css({
  color: '#ffffffff',
  fontFamily: `${theme.fonts.title}`,
  fontSize: 16,
  transform: 'translateY(-2px)',
});


// ⛰️ 점수 UI
export const currentScoreCss = css({
  position: 'absolute',
  top: 32, // 🔹 coin 이미지보다 약간 아래 배치 (이미지의 시각 중심 보정)
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 3,
  fontSize: 20,
  color: '#FFFFFF',
  fontFamily: `${theme.fonts.title}`,
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});


