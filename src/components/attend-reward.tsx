/** @jsxImportSource @emotion/react */
import { useSound } from '@context/sound-context';
import { useToken } from '@context/user-context';
import type { HomeImageProps } from '@interface/image-props';
import {
  attendRewardButtonCss,
  attendRewardEffectCss,
  attendRewardItemCss,
  attendRewardOverlayCss,
  attendRewardTextCss,
  attendRewardWrapperCss,
} from '@styles/components/attend-reward.css';
import { getBGMs } from '@utils/get-sounds';

interface AttendRewardProps {
  index: number;
  onClose: () => void;
  images: HomeImageProps;
  refreshCheckin: (token: string) => Promise<void>;
}

const AttendReward = ({ index, onClose, images, refreshCheckin }: AttendRewardProps) => {
  const { effect } = useSound();
  const subButtonSound = new Audio(getBGMs('button_sub'));
  const rewardSound = new Audio(getBGMs('daily_reward'));
  const { token } = useToken();

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
    refreshCheckin(token);
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
        <img src={images.check_close} alt="닫기_버튼" css={attendRewardButtonCss} onClick={onClick} />
      </div>
      <img src={images.shine} alt="반짝이_효과" css={attendRewardEffectCss} />
      <div css={attendRewardOverlayCss} />
    </>
  );
};

export default AttendReward;
