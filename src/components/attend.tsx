/** @jsxImportSource @emotion/react */
import AttendReward from './attend-reward';
import { useState } from 'react';
import {
  attendCloseButtonCss,
  attendGridCss,
  attendImageCss,
  attendLastImageCss,
  attendLastLiCss,
  attendOverlayCss,
  attendTabCss,
  attendWrapperCss,
} from '@styles/components/attend.css';
import { getImage } from '@utils/get-images';

type DayStatus = 'today' | 'claimed' | 'locked';

interface AttendProps {
  handleAttend: () => void;
}

const Attend = ({ handleAttend }: AttendProps) => {
  const [reward, setReward] = useState<number>(-1);
  const [statuses, setStatuses] = useState<DayStatus[]>([
    'claimed',
    'claimed',
    'today',
    'locked',
    'locked',
    'locked',
    'locked',
  ]);

  const tab = getImage('home', 'check_tab');
  const close = getImage('home', 'close_button');

  const getImages = Array.from({ length: 7 }, (_, i) => ({
    today: getImage('home', `check_day${i + 1}`),
    locked: getImage('home', `check_day${i + 1}_lock`),
    claimed: getImage('home', `check_day${i + 1}_done`),
  }));

  const getImageForDay = (index: number) => {
    const status = statuses[index];

    if (status === 'claimed') {
      return getImages[index].claimed;
    }
    if (status === 'locked') {
      return getImages[index].locked;
    }

    return getImages[index].today;
  };

  const handleRewardOpen = (index: number) => {
    if (statuses[index] === 'today') {
      setReward(index);
    }
  };

  const handleRewardClose = () => {
    setReward(-1);
    setStatuses((prev) => prev.map((status) => (status === 'today' ? 'claimed' : status)));
  };

  return (
    <>
      {reward >= 0 && <AttendReward index={reward} onClose={handleRewardClose} />}
      <div css={attendWrapperCss}>
        <ul css={attendGridCss}>
          {statuses.map((_, i) => (
            <li key={i} css={i === 6 ? attendLastLiCss : undefined} onClick={() => handleRewardOpen(i)}>
              <img
                src={getImageForDay(i)}
                alt={`${i + 1}일차_출석`}
                css={i === 6 ? attendLastImageCss : attendImageCss}
              />
            </li>
          ))}
        </ul>
        <img src={tab} alt="출석_탭" css={attendTabCss} />
        <img src={close} alt="옵션_닫기" css={attendCloseButtonCss} onClick={handleAttend} />
      </div>
      <div css={attendOverlayCss} />
    </>
  );
};

export default Attend;
