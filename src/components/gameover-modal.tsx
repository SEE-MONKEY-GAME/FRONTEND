/** @jsxImportSource @emotion/react */
import type { GameImageProps } from 'interface/image-props';
import { useNavigate } from 'react-router-dom';
import { createGameResult } from '@api/game-api';
import { useToken } from '@context/user-context';
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
import { shareMessage } from '@utils/share-message';
import { submitScore } from '@utils/submit-score';

type Props = {
  open: boolean;
  score: number;
  coin: number;
  onClose: () => void;
  onReplay: () => void;
  images: GameImageProps;
};

export default function GameOverModal({ open, score, coin, onClose, onReplay, images }: Props) {
  const navigate = useNavigate();
  const { token } = useToken();

  if (!open) {
    return null;
  }

  const exitGame = async () => {
    try {
      const response = await createGameResult(token, score, coin);
      submitScore(score);
      onClose();
      window.dispatchEvent(new Event('game:end'));
      navigate('/home', { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const retryGame = async () => {
    try {
      const response = await createGameResult(token, score, coin);
      submitScore(score);
      onClose();
      onReplay();
    } catch (error) {
      console.log(error);
    }
  };

  const shareGame = () => {
    shareMessage(score);
  };

  return (
    <div css={overlayCss} role="dialog" aria-modal="true" aria-label="Game Over">
      <div css={panelCss(images)}>
        <div css={titleCss}>Game Over</div>

        <div css={statWrapCss}>
          <div css={scoreLabelCss}>Score</div>
          <div css={scoreValueCss}>{score} m</div>
        </div>

        <div css={hrCss} />

        <div css={statWrapCss}>
          <div css={coinCss2}>
            <img src={images.onecoin} alt="coin" css={coinImgCss} />
            {coin}
          </div>
        </div>

        <div css={btnRowCss}>
          <button css={iconBtnCss} type="button" onClick={exitGame}>
            <img src={images.home} alt="home" />
          </button>

          <button css={iconBtnCss} type="button" onClick={retryGame}>
            <img src={images.retry} alt="replay" />
          </button>

          <button css={iconBtnCss} type="button" onClick={shareGame}>
            <img src={images.share} alt="share" />
          </button>
        </div>
      </div>
    </div>
  );
}
