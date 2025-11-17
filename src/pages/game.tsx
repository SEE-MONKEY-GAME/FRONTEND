/** @jsxImportSource @emotion/react */
import { useFeverProgressAnimator } from '../hooks/useFeverProgressAnimator';
import type { GameImageProps } from 'interface/image-props';
import { useEffect, useState } from 'react';
import FeverGauge from '@components/fever-gauge';
import GameOverModal from '@components/gameover-modal';
import HeartPrompt from '@components/heartprompt';
import RocketPrompt from '@components/rocketprompt';
import { FEVER_DURATION_MS } from '@scenes/game-scene';
import { circleCss, coinCss, coinTextCss, currentScoreCss, feverEmptyCss, feverWrapCss } from '@styles/pages/game.css';
import { useToken } from '@context/user-context';
import { selectItems, updateItem } from '@api/item-api';


export interface ImagesProps {
  empty_guage_bar: string;
  full_guage_bar: string;
  'gameover-tab': string;
  coin_count: string;
  home: string;
  retry: string;
  share: string;
  onecoin: string;
}

export default function GamePage() {
  const [images, setImages] = useState<GameImageProps>({
    empty_guage_bar: '',
    full_guage_bar: '',
    'gameover-tab': '',
    coin_count: '',
    home: '',
    retry: '',
    share: '',
    onecoin: '',
  });
  const [score, setScore] = useState(0);
  const [coin, setCoin] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoin, setFinalCoin] = useState(0);
 const [showRocketPrompt, setShowRocketPrompt] = useState(false);
  const [showHeartPrompt, setShowHeartPrompt] = useState(false); 
  const [hasShownHeartPromptInRun, setHasShownHeartPromptInRun] = useState(false); 

 const [hasRocketItem, setHasRocketItem] = useState(false);
  const [hasHeartItem, setHasHeartItem] = useState(false);

  // const { token } = useToken();
  const { token: realToken } = useToken(); const token = '1';
  
useEffect(() => {
  (window as any).__GAME_TOKEN = token;
}, [token]);

useEffect(() => {
  const w = window as any;

  if (!token) {
    setHasRocketItem(false);
    setHasHeartItem(false);
    setShowRocketPrompt(false); 
    return;
  }

  const fetchItems = async () => {
    try {
      const res = await selectItems(token);
      const list = res.data ?? res;

      const rocket = list.find((entry: any) => entry.item?.code === 'ITEM-001');
      const heart  = list.find((entry: any) => entry.item?.code === 'ITEM-002');

      const hasRocket = (rocket?.quantity ?? 0) > 0;
      const hasHeart  = (heart?.quantity ?? 0) > 0;

      setHasRocketItem(hasRocket);
      setHasHeartItem(hasHeart);

      if (hasRocket) {
  w.__rocketStart = false;
  w.__queuedGameStart = false;
  setShowRocketPrompt(true);
} else {
  w.__rocketStart = false;
  w.__queuedGameStart = true;
  window.dispatchEvent(new Event('game:play'));
}
    } catch (e) {
      console.error('[GamePage] selectItems error:', e);
      setHasRocketItem(false);
      setHasHeartItem(false);
      setShowRocketPrompt(false);

      w.__rocketStart = false;
      w.__queuedGameStart = true;
      window.dispatchEvent(new Event('game:play'));
    }
  };

  fetchItems();
}, [token]);


  useEffect(() => {
    const preloaded = (window as any)['PRELOADED_IMAGES'] as GameImageProps | undefined;
    if (preloaded) {
      setImages(preloaded);
    }

    const handleImages = (event: CustomEvent<GameImageProps>) => {
      setImages(event.detail);
    };

    window.addEventListener('images:loaded', handleImages as EventListener);

    return () => {
      window.removeEventListener('images:loaded', handleImages as EventListener);
    };
  }, []);

  const {
    progress: feverProgress,
    setTarget,
    nudgeByItems,
    startDrain,
  } = useFeverProgressAnimator({
    drainMs: FEVER_DURATION_MS,
  });
const startGame = async () => {
  const w = window as any;

  try {
    if (token) {
      const res = await updateItem(token, 1);

      if (res.status === 200) {
        setHasRocketItem(false);    

        w.__rocketStart = true;
        w.__queuedGameStart = true;
        window.dispatchEvent(new Event('game:play'));
      } else {
        console.warn('[GamePage] rocket item use failed:', res);

        w.__rocketStart = false;
        w.__queuedGameStart = true;
        window.dispatchEvent(new Event('game:play'));
      }
    } else {
      w.__rocketStart = true;
      w.__queuedGameStart = true;
      window.dispatchEvent(new Event('game:play'));
    }
  } catch (e) {
    console.error('[GamePage] rocket updateItem error:', e);

    w.__rocketStart = false;
    w.__queuedGameStart = true;
    window.dispatchEvent(new Event('game:play'));
  } finally {
    setShowRocketPrompt(false);
  }
};

const skipGame = () => {
  const w = window as any;
  w.__rocketStart = false;     
  w.__queuedGameStart = true;

  window.dispatchEvent(new Event('game:play')); 
  setShowRocketPrompt(false);
};

const replay = () => {
  const w = window as any;
  w.__queuedGameStart = false;
  w.__rocketStart = false;

  window.dispatchEvent(new Event('game:replay'));

  setIsGameOver(false);
  setScore(0);
  setCoin(0);
  setShowRocketPrompt(hasRocketItem);
  setShowHeartPrompt(false);
  setHasShownHeartPromptInRun(false);
};

  const handleHeartSkip = () => {
    setShowHeartPrompt(false);
    setIsGameOver(true);
  };

const handleHeartUse = async () => {
  setShowHeartPrompt(false);

  try {
    if (token) {
      const res = await updateItem(token, 2);

      if (res.status === 200) {
        setHasHeartItem(false);   

        setIsGameOver(false);
        window.dispatchEvent(new Event('game:extra-life'));
      } else {
        console.warn('[GamePage] heart item use failed:', res);
        setIsGameOver(true);
      }
    } else {
      setIsGameOver(false);
      window.dispatchEvent(new Event('game:extra-life'));
    }
  } catch (e) {
    console.error('[GamePage] heart updateItem error:', e);
    setIsGameOver(true);
  }
};

  useEffect(() => {
    const onScore = (e: CustomEvent<{ score: number }>) => setScore(e.detail.score);
    const onCoin = (e: CustomEvent<{ coin: number }>) => setCoin(e.detail.coin);
    const onFever = (e: CustomEvent<{ progress: number; active: boolean; timeLeftMs?: number }>) => {
      const p = Math.max(0, Math.min(1, e.detail.progress));
      setTarget(p);
      if (e.detail.active) startDrain(e.detail.timeLeftMs ?? undefined);
    };

    window.addEventListener('game:score', onScore as EventListener);
    window.addEventListener('game:coin', onCoin as EventListener);
    window.addEventListener('game:fever', onFever as EventListener);
    return () => {
      window.removeEventListener('game:score', onScore as EventListener);
      window.removeEventListener('game:coin', onCoin as EventListener);
      window.removeEventListener('game:fever', onFever as EventListener);
    };
  }, [setTarget, startDrain]);

  useEffect(() => {
    const onItem = (e: CustomEvent<{ count: number }>) => {
      nudgeByItems(e.detail.count, 20);
    };
    window.addEventListener('game:item', onItem as EventListener);
    return () => window.removeEventListener('game:item', onItem as EventListener);
  }, [nudgeByItems]);

useEffect(() => {
  const onOver = (e: CustomEvent<{ score: number; coin: number }>) => {
    setFinalScore(e.detail.score);
    setFinalCoin(e.detail.coin);

    if (!hasHeartItem) {
      setIsGameOver(true);
      return;
    }

    if (!hasShownHeartPromptInRun) {
      setHasShownHeartPromptInRun(true);
      setShowHeartPrompt(true);
    } else {
      setIsGameOver(true);
    }
  };
  window.addEventListener('game:over', onOver as EventListener);
  return () => window.removeEventListener('game:over', onOver as EventListener);
}, [hasHeartItem, hasShownHeartPromptInRun]);

  return (
    <>
      <div css={circleCss} />
      <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'transparent' }}>
        <span css={currentScoreCss}>{score} m</span>

        <div css={coinCss(images)}>
          <span css={coinTextCss}>{coin}</span>
        </div>

        <div css={feverWrapCss} aria-label="Fever Gauge">
          <div css={feverEmptyCss(images)} />
          <div style={{ position: 'absolute', inset: 0 }}>
            <FeverGauge width={320} height={30} progress={feverProgress} />
          </div>
        </div>

        <GameOverModal
          open={isGameOver}
          score={finalScore}
          coin={finalCoin}
          onClose={() => setIsGameOver(false)}
          onReplay={replay}
          images={images}
        />
        <RocketPrompt open={showRocketPrompt} onSkip={skipGame} onUse={startGame} />
        <HeartPrompt open={showHeartPrompt} onSkip={handleHeartSkip} onUse={handleHeartUse} />
      </div>
    </>
  );
}
