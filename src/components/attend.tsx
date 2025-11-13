/** @jsxImportSource @emotion/react */
import AttendReward from './attend-reward';
import { useMemo, useState } from 'react';
import type { ImagesProps } from '@pages/home';
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

type DayStatus = 'today' | 'claimed' | 'locked';

interface AttendProps {
  handleAttend: () => void;
  images: ImagesProps;
  todayCheckIn: boolean;
  checkinStreak: number;
}

const Attend = ({ handleAttend, images, todayCheckIn, checkinStreak }: AttendProps) => {
  const [reward, setReward] = useState<number>(-1);

  const statuses: DayStatus[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      if (i < checkinStreak) {
        return 'claimed';
      }
      if (i === checkinStreak && !todayCheckIn) {
        return 'today';
      }
      return 'locked';
    });
  }, [todayCheckIn, checkinStreak]);

  const getImages = Array.from({ length: 7 }, (_, i) => ({
    today: images[`check_day${i + 1}` as keyof ImagesProps],
    locked: images[`check_day${i + 1}_lock` as keyof ImagesProps],
    claimed: images[`check_day${i + 1}_done` as keyof ImagesProps],
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
  };

  return (
    <>
      {reward >= 0 && <AttendReward index={reward} onClose={handleRewardClose} images={images} />}
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
        <img src={images.tab_check} alt="출석_탭" css={attendTabCss} />
        <img src={images.close} alt="옵션_닫기" css={attendCloseButtonCss} onClick={handleAttend} />
      </div>
      <div css={attendOverlayCss} />
    </>
  );
};

export default Attend;
