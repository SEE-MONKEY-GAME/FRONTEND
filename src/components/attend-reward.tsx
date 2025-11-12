/** @jsxImportSource @emotion/react */
import { useEffect } from 'react';
import { useSound } from '@context/sound-context';
import type { ImagesProps } from '@pages/home';
import {
  attendRewardButtonCss,
  attendRewardEffectCss,
  attendRewardItemCss,
  attendRewardOverlayCss,
  attendRewardTextCss,
  attendRewardWrapperCss,
} from '@styles/components/attend-reward.css';
import { getImage } from '@utils/get-images';
import { getBGMs } from '@utils/get-sounds';

interface AttendRewardProps {
  index: number;
  onClose: () => void;
  images: ImagesProps;
}

const AttendReward = ({ index, onClose, images }: AttendRewardProps) => {
  const { effect } = useSound();
  const close = getImage('home', 'check_close_button');
  const shine = getImage('home', 'effect_shine');
  const subButtonSound = new Audio(getBGMs('button_sub'));
  const rewardSound = new Audio(getBGMs('daily_reward'));

  const rewardImages = [
    images.check_day1_gift,
    images.check_day2_gift,
    images.check_day3_gift,
    images.check_day4_gift,
    images.check_day5_gift,
    images.check_day6_gift,
    images.check_day7_gift,
  ];

  const rewards = ['30코인', '40코인', '50코인', '60코인', '80코인', '100코인', '시작 부스터'];

  if (effect) {
    rewardSound.currentTime = 0;
    rewardSound.play();
  }

  const onClick = () => {
    if (effect) {
      subButtonSound.currentTime = 0;
      subButtonSound.play();
    }
    onClose();
  };

  return (
    <>
      <div css={attendRewardWrapperCss}>
        <img src={rewardImages[index]} alt="출석_보상_이미지" css={attendRewardItemCss} />
        <p css={attendRewardTextCss}>
          오늘 출석 완료!
          <br />
          <span>{rewards[index]}</span> 받았어요!
        </p>
        <img src={close} alt="닫기_버튼" css={attendRewardButtonCss} onClick={onClick} />
      </div>
      <img src={shine} alt="반짝이_효과" css={attendRewardEffectCss} />
      <div css={attendRewardOverlayCss} />
    </>
  );
};

export default AttendReward;
