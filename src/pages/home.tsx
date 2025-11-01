/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeCanvas from '@canvas/home-canvas';
import Guide from '@components/guide';
import Option from '@components/option';
import {
  backgroundCss,
  bestScoreCss,
  bestScoreTextCss,
  circleCss,
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
  const navigate = useNavigate();
  const [guide, setGuide] = useState<boolean>(false);
  const [option, setOption] = useState<boolean>(false);
  const [transition, setTransition] = useState<boolean>(false);

  const help = getImage('home', 'icon_help');
  const check = getImage('home', 'icon_check');
  const rank = getImage('home', 'icon_ranking');
  const shop = getImage('home', 'icon_shop');
  const etc = getImage('home', 'icon_option');
  const gameStart = getImage('home', 'button_game_start');

  const handleOption = () => {
    setOption((option) => !option);
  };

  const handleGameGuide = () => {
    setGuide((guide) => !guide);
  };

  const handleGameStart = () => {
    setTransition(true);
    setTimeout(() => {
      navigate('/game');
    }, 1000);
  };

  return (
    <>
      {transition && <div css={circleCss} />}
      {option && <Option handleOption={handleOption} />}
      {guide && <Guide handleGameGuide={handleGameGuide} />}
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
            <img src={check} alt="출석" css={iconButtonCss} />
            <img src={rank} alt="랭킹" css={iconButtonCss} />
            <img src={shop} alt="상점" css={iconButtonCss} />
          </div>
          <div css={iconButtonListCss}>
            <img src={etc} alt="옵션" css={iconButtonCss} onClick={handleOption} />
            <img src={help} alt="게임방법" css={iconButtonCss} onClick={handleGameGuide} />
          </div>
        </div>
        <div css={gameStartButtonCss} onClick={handleGameStart}>
          <img src={gameStart} alt="게임시작" css={gameStartButtonImageCss} />
        </div>
      </div>
    </>
  );
};

export default Home;
