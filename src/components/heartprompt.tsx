/** @jsxImportSource @emotion/react */
import { getImage } from '@utils/get-images';
import {
  overlayCss,
  titleCss,
  descCss,
  effectHostCss,
  effectSpriteCss,
  iconCss,
  buttonsCss,
} from '@styles/components/heartprompt.css';

interface HeartPromptProps  {
  open: boolean;
  onSkip: () => void;
  onUse: () => void;
}

export default function Heartprompt({ open, onSkip, onUse }: HeartPromptProps ) {
  if (!open) return null;

  const heartIcon  = getImage('game', 'heart_icon');
  const effectSheet = getImage('game', 'heart_icon_effect');
  const skipBtn     = getImage('game', 'skip_btn');
  const useBtn      = getImage('game', 'use_btn');

  return (
    <div css={overlayCss} role="dialog" aria-modal="true" aria-label="추가 하트 사용 안내">
      <div css={titleCss}>추가 하트를 사용할까요?</div>

      <div css={effectHostCss}>
        <div css={effectSpriteCss(effectSheet)} />
        <img src={heartIcon} alt="하트 아이콘" css={iconCss} draggable={false} />
      </div>

      <div css={descCss}>{'마지막으로 멈춘 곳에서\n다시 시작할 수 있어요'}</div>

      <div css={buttonsCss}>
        <img src={skipBtn} alt="건너뛰기" onClick={onSkip} draggable={false} />
        <img src={useBtn} alt="사용하기" onClick={onUse} draggable={false} />
      </div>
    </div>
  );
}
