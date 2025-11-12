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
} from '@styles/components/rocketprompt.css';

interface RocketPromptProps {
  open: boolean;
  onSkip: () => void;
  onUse: () => void;
}

export default function RocketPrompt({ open, onSkip, onUse }: RocketPromptProps) {
  if (!open) return null;

  const rocketIcon   = getImage('game', 'rocket_icon');
  const effectSheet  = getImage('game', 'rocket_icon_effect'); 
  const skipBtn      = getImage('game', 'skip_btn');
  const useBtn       = getImage('game', 'use_btn');

  return (
    <div css={overlayCss} role="dialog" aria-modal="true" aria-label="로켓 사용 안내">
      <div css={titleCss}>로켓을 타고 갈까요?</div>

      <div css={effectHostCss}>
        {/* 뒤에서 돌아가는 스프라이트 효과 */}
        <div css={effectSpriteCss(effectSheet)} />
        {/* 앞에 로켓 아이콘 */}
        <img src={rocketIcon} alt="로켓 아이콘" css={iconCss} draggable={false} />
      </div>

      <div css={descCss}>{'로켓을 타고 날아 올라\n더 높은 곳에서 시작할 수 있어요'}</div>

      <div css={buttonsCss}>
        <img src={skipBtn} alt="건너뛰기" onClick={onSkip} draggable={false} />
        <img src={useBtn} alt="사용하기" onClick={onUse} draggable={false} />
      </div>
    </div>
  );
}
