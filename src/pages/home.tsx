/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Attend from '@components/attend';
import Guide from '@components/guide';
import Option from '@components/option';
import Shop from '@components/shop';
import {
  backgroundCss,
  bestScoreCss,
  bestScoreTextCss,
  bestScoreValueCss,
  circleCss,
  coinCss,
  coinTextCss,
  gameStartButtonCss,
  gameStartButtonImageCss,
  iconButtonCss,
  iconButtonGroupCss,
  iconButtonListCss,
} from '@styles/pages/home.css';
import { getBGMs } from '@utils/get-sounds';

export interface ImagesProps {
  home_bg: string;
  leaf_left: string;
  leaf_right: string;
  help: string;
  check: string;
  rank: string;
  shop: string;
  etc: string;
  gameStart: string;
  close: string;
  tab_option: string;
  option_bgm: string;
  option_sound: string;
  option_contact: string;
  option_send: string;
  tab_guide: string;
  guide_1: string;
  guide_2: string;
  guide_3: string;
  prev_guide: string;
  next_guide: string;
  tab_check: string;
  check_day1: string;
  check_day2: string;
  check_day3: string;
  check_day4: string;
  check_day5: string;
  check_day6: string;
  check_day7: string;
  check_day1_lock: string;
  check_day2_lock: string;
  check_day3_lock: string;
  check_day4_lock: string;
  check_day5_lock: string;
  check_day6_lock: string;
  check_day7_lock: string;
  check_day1_done: string;
  check_day2_done: string;
  check_day3_done: string;
  check_day4_done: string;
  check_day5_done: string;
  check_day6_done: string;
  check_day7_done: string;
  check_day1_gift: string;
  check_day2_gift: string;
  check_day3_gift: string;
  check_day4_gift: string;
  check_day5_gift: string;
  check_day6_gift: string;
  check_day7_gift: string;
  shop_frame: string;
  shop_box: string;
  shop_tab_1: string;
  shop_tab_2: string;
  shop_container: string;
  shop_buy: string;
  shop_notbuy: string;
  shop_use: string;
  shop_notuse: string;
  shop_minus: string;
  shop_plus: string;
  shop_price: string;
  shop_coin: string;
  'ITEM-001': string;
  'ITEM-002': string;
  'SCARF-001': string;
}

const Home = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImagesProps>({
    home_bg: '',
    leaf_left: '',
    leaf_right: '',
    help: '',
    check: '',
    rank: '',
    shop: '',
    etc: '',
    gameStart: '',
    close: '',
    tab_option: '',
    option_bgm: '',
    option_sound: '',
    option_contact: '',
    option_send: '',
    tab_guide: '',
    guide_1: '',
    guide_2: '',
    guide_3: '',
    prev_guide: '',
    next_guide: '',
    tab_check: '',
    check_day1: '',
    check_day2: '',
    check_day3: '',
    check_day4: '',
    check_day5: '',
    check_day6: '',
    check_day7: '',
    check_day1_lock: '',
    check_day2_lock: '',
    check_day3_lock: '',
    check_day4_lock: '',
    check_day5_lock: '',
    check_day6_lock: '',
    check_day7_lock: '',
    check_day1_done: '',
    check_day2_done: '',
    check_day3_done: '',
    check_day4_done: '',
    check_day5_done: '',
    check_day6_done: '',
    check_day7_done: '',
    check_day1_gift: '',
    check_day2_gift: '',
    check_day3_gift: '',
    check_day4_gift: '',
    check_day5_gift: '',
    check_day6_gift: '',
    check_day7_gift: '',
    shop_frame: '',
    shop_box: '',
    shop_tab_1: '',
    shop_tab_2: '',
    shop_container: '',
    shop_buy: '',
    shop_notbuy: '',
    shop_use: '',
    shop_notuse: '',
    shop_minus: '',
    shop_plus: '',
    shop_price: '',
    shop_coin: '',
    'ITEM-001': '',
    'ITEM-002': '',
    'SCARF-001': '',
  });

  const [attend, setAttend] = useState<boolean>(false);
  const [shop, setShop] = useState<boolean>(false);
  const [guide, setGuide] = useState<boolean>(false);
  const [option, setOption] = useState<boolean>(false);
  const [transition, setTransition] = useState<boolean>(false);

  const mainButtonSound = new Audio(getBGMs('button_main'));
  const subButtonSound = new Audio(getBGMs('button_sub'));

  useEffect(() => {
    const preloaded = (window as any)['PRELOADED_IMAGES'] as ImagesProps | undefined;
    if (preloaded) {
      setImages(preloaded);
    }

    const handleImages = (event: CustomEvent<ImagesProps>) => {
      setImages(event.detail);
    };

    window.addEventListener('images:loaded', handleImages as EventListener);

    return () => {
      window.removeEventListener('images:loaded', handleImages as EventListener);
    };
  }, []);

  const handleAttend = () => {
    subButtonSound.currentTime = 0;
    subButtonSound.play();
    setAttend((attend) => !attend);
  };

  const handleShop = () => {
    subButtonSound.currentTime = 0;
    subButtonSound.play();
    setShop((shop) => !shop);
  };

  const handleGameGuide = () => {
    subButtonSound.currentTime = 0;
    subButtonSound.play();
    setGuide((guide) => !guide);
  };

  const handleOption = () => {
    subButtonSound.currentTime = 0;
    subButtonSound.play();
    setOption((option) => !option);
  };

  const handleGameStart = () => {
    mainButtonSound.currentTime = 0;
    mainButtonSound.play();
    setTransition(true);

    setTimeout(() => {
      window.dispatchEvent(new Event('game:start'));
      navigate('/game');
    }, 1000);
  };

  return (
    <>
      {transition && <div css={circleCss} />}
      {attend && <Attend handleAttend={handleAttend} images={images} />}
      {shop && <Shop handleShop={handleShop} images={images} />}
      {guide && <Guide handleGameGuide={handleGameGuide} images={images} />}
      {option && <Option handleOption={handleOption} images={images} />}
      <div css={backgroundCss(images)}>
        <div css={coinCss}>
          <span css={coinTextCss}>1985</span>
        </div>
        <div css={bestScoreCss}>
          <div css={bestScoreTextCss}>
            <img src={images.leaf_left} alt="왼쪽_장식_이미지" height={14} />
            <span>최고기록</span>
            <img src={images.leaf_right} alt="오른쪽_장식_이미지" height={14} />
          </div>
          <span css={bestScoreValueCss}>5853 m</span>
        </div>
        <div css={iconButtonGroupCss}>
          <div css={iconButtonListCss}>
            <img src={images.check} alt="출석" css={iconButtonCss} onClick={handleAttend} />
            <img src={images.rank} alt="랭킹" css={iconButtonCss} />
            <img src={images.shop} alt="상점" css={iconButtonCss} onClick={handleShop} />
          </div>
          <div css={iconButtonListCss}>
            <img src={images.etc} alt="옵션" css={iconButtonCss} onClick={handleOption} />
            <img src={images.help} alt="게임방법" css={iconButtonCss} onClick={handleGameGuide} />
          </div>
        </div>
        <div css={gameStartButtonCss} onClick={handleGameStart}>
          <img src={images.gameStart} alt="게임시작" css={gameStartButtonImageCss} />
        </div>
      </div>
    </>
  );
};

export default Home;
