/** @jsxImportSource @emotion/react */
import AttendReward from './attend-reward';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createDailyCheckin, selectDailyCheckin } from '@api/checkin-api';
import { useToken } from '@context/user-context';
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

interface CheckinProps {
  checkedToday: boolean;
  checkinStreak: number;
  lastCheckin: string | null;
  today: string;
}

interface AttendProps {
  handleAttend: () => void;
  images: ImagesProps;
  refreshMember: (token: string) => Promise<void>;
}

const Attend = ({ handleAttend, images, refreshMember }: AttendProps) => {
  const { token } = useToken();
  const [reward, setReward] = useState<number>(-1);
  const [checkin, setCheckin] = useState<CheckinProps>({
    checkedToday: false,
    checkinStreak: 0,
    lastCheckin: null,
    today: '',
  });

  const statuses: DayStatus[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      if (i < checkin.checkinStreak) {
        return 'claimed';
      }
      if (i === checkin.checkinStreak && !checkin.checkedToday) {
        return 'today';
      }
      return 'locked';
    });
  }, [checkin]);

  useEffect(() => {
    const getDailyCheckin = async () => {
      try {
        const response = await selectDailyCheckin(token);
        setCheckin(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getDailyCheckin();
  }, []);

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

  const handleRewardOpen = async (index: number) => {
    if (statuses[index] === 'today') {
      try {
        const response = await createDailyCheckin(token);
      } catch (error) {
        toast.error('잠시 후 다시 시도해주세요');
        console.log(error);
      }
      refreshMember(token);
      setReward(index);
    } else if (statuses[index] === 'claimed') {
      toast.error('오늘은 이미 출석했어요');
    } else {
      toast.error('아직 출석할 수 없어요');
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
