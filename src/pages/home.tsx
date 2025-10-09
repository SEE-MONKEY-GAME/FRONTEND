/** @jsxImportSource @emotion/react */
import HomeCanvas from '@canvas/home-canvas';
import {
  backgroundCss,
  bestScoreCss,
  bestScoreTextCss,
  coinCss,
  coinTextCss,
  gameStartButtonCss,
  gameStartButtonImageCss,
  iconButtonCss,
  iconButtonGroupCss,
  iconButtonListCss,
} from '@styles/pages/home.css';
import { getImage } from '@utils/get-images';

const Home = () => {
  const help = getImage('home', 'icon_help');
  const check = getImage('home', 'icon_check');
  const rank = getImage('home', 'icon_ranking');
  const shop = getImage('home', 'icon_shop');
  const etc = getImage('home', 'icon_etc');
  const gameStart = getImage('home', 'button_game_start_default');

  return (
    <div css={backgroundCss}>
      <HomeCanvas />

      <div css={coinCss}>
        <span css={coinTextCss}>1985</span>
      </div>

      <div css={bestScoreCss}>
        <span>최고기록</span>
        <span css={bestScoreTextCss}>5853 m</span>
      </div>

      <div css={iconButtonGroupCss}>
        <div css={iconButtonListCss}>
          <img src={help} alt="도움말" css={iconButtonCss} />
          <img src={check} alt="출석" css={iconButtonCss} />
          <img src={rank} alt="랭킹" css={iconButtonCss} />
          <img src={shop} alt="상점" css={iconButtonCss} />
        </div>
        <div css={iconButtonListCss}>
          <img src={etc} alt="기타 메뉴" css={iconButtonCss} />
        </div>
      </div>

      <div css={gameStartButtonCss}>
        <img src={gameStart} alt="게임 시작 버튼" css={gameStartButtonImageCss} />
      </div>
    </div>
  );
};

export default Home;
