/** @jsxImportSource @emotion/react */
import { useNavigate } from 'react-router-dom';
import {
  btnRowCss,
  coinCss2,
  coinImgCss,
  hrCss,
  iconBtnCss,
  overlayCss,
  panelCss,
  scoreLabelCss,
  scoreValueCss,
  statWrapCss,
  titleCss,
} from '@styles/pages/game.css';
import { getImage } from '@utils/get-images';

type Props = {
  open: boolean;
  score: number;
  coin: number;
  onClose: () => void;
  onReplay: () => void;
};

export default function GameOverModal({ open, score, coin, onClose, onReplay }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div css={overlayCss} role="dialog" aria-modal="true" aria-label="Game Over">
      <div css={panelCss}>
        <div css={titleCss}>Game Over</div>

        <div css={statWrapCss}>
          <div css={scoreLabelCss}>Score</div>
          <div css={scoreValueCss}>{score} m</div>
        </div>

        <div css={hrCss} />

        <div css={statWrapCss}>
          <div css={coinCss2}>
            <img src={getImage('game', 'onecoin')} alt="coin" css={coinImgCss} />
            {coin}
          </div>
        </div>

        <div css={btnRowCss}>
          <button
            css={iconBtnCss}
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new Event('game:end'));
              navigate('/');
            }}
          >
            <img src={getImage('game', 'home')} alt="home" />
          </button>

          <button
            css={iconBtnCss}
            type="button"
            onClick={() => {
              onClose();
              onReplay();
            }}
          >
            <img src={getImage('game', 'retry')} alt="replay" />
          </button>

          <button css={iconBtnCss} type="button" onClick={() => console.log('share clicked')}>
            <img src={getImage('game', 'share')} alt="share" />
          </button>
        </div>
      </div>
    </div>
  );
}
