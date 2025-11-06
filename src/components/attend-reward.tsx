/** @jsxImportSource @emotion/react */
import {
  attendRewardButtonCss,
  attendRewardEffectCss,
  attendRewardItemCss,
  attendRewardOverlayCss,
  attendRewardTextCss,
  attendRewardWrapperCss,
} from '@styles/components/attend-reward.css';
import { getImage } from '@utils/get-images';

interface AttendRewardProps {
  index: number;
  onClose: () => void;
}

const AttendReward = ({ index, onClose }: AttendRewardProps) => {
  const close = getImage('home', 'check_close_button');
  const shine = getImage('home', 'effect_shine');
  const rewardImages = [
    getImage('home', 'check_day1_gift'),
    getImage('home', 'check_day2_gift'),
    getImage('home', 'check_day3_gift'),
    getImage('home', 'check_day4_gift'),
    getImage('home', 'check_day5_gift'),
    getImage('home', 'check_day6_gift'),
    getImage('home', 'check_day7_gift'),
  ];

  const rewards = ['30코인', '40코인', '50코인', '60코인', '80코인', '100코인', '시작 부스터'];

  return (
    <>
      <div css={attendRewardWrapperCss}>
        <img src={rewardImages[index]} alt="출석_보상_이미지" css={attendRewardItemCss} />
        <p css={attendRewardTextCss}>
          오늘 출석 완료!
          <br />
          <span>{rewards[index]}</span> 받았어요!
        </p>
        <img src={close} alt="닫기_버튼" css={attendRewardButtonCss} onClick={onClose} />
      </div>
      <img src={shine} alt="반짝이_효과" css={attendRewardEffectCss} />
      <div css={attendRewardOverlayCss} />
    </>
  );
};

export default AttendReward;
