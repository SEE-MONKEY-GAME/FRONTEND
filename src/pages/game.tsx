/** @jsxImportSource @emotion/react */
import { useFeverProgressAnimator } from '../hooks/useFeverProgressAnimator';
import { useEffect, useState } from 'react';
import FeverGauge from '@components/fever-gauge';
import GameOverModal from '@components/gameover-modal';
import RocketPrompt from '@components/rocketprompt';
import HeartPrompt from '@components/heartprompt'; 
import { FEVER_DURATION_MS } from '@scenes/game-scene';
import { circleCss, coinCss, coinTextCss, currentScoreCss, feverEmptyCss, feverWrapCss } from '@styles/pages/game.css';
import { useToken } from '@context/user-context';

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
  const [images, setImages] = useState<ImagesProps>({
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
  const [showRocketPrompt, setShowRocketPrompt] = useState(true);
  const [showHeartPrompt, setShowHeartPrompt] = useState(false); 
  const [hasShownHeartPromptInRun, setHasShownHeartPromptInRun] = useState(false); 

  const { token } = useToken();
useEffect(() => {
  (window as any).__GAME_TOKEN = token;
}, [token]);


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

  const {
    progress: feverProgress,
    setTarget,
    nudgeByItems,
    startDrain,
  } = useFeverProgressAnimator({
    drainMs: FEVER_DURATION_MS,
  });

  
const startGame = () => {
  const w = window as any;
  w.__rocketStart = true;      
  w.__queuedGameStart = true;   

  window.dispatchEvent(new Event('game:play')); 
  setShowRocketPrompt(false);
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
  setShowRocketPrompt(true);
  setShowHeartPrompt(false);
  setHasShownHeartPromptInRun(false);
};

const handleHeartSkip = () => {
  setShowHeartPrompt(false);
  setIsGameOver(true); 
};

const handleHeartUse = () => {
  setShowHeartPrompt(false);
  setIsGameOver(false); 
  window.dispatchEvent(new Event('game:extra-life'));
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

    setShowHeartPrompt((prev) => {
      if (!hasShownHeartPromptInRun) {
        setHasShownHeartPromptInRun(true);
        return true;                     
      }

      setIsGameOver(true);
      return false;
    });
  };

  window.addEventListener('game:over', onOver as EventListener);
  return () => window.removeEventListener('game:over', onOver as EventListener);
}, [hasShownHeartPromptInRun]);



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
      <RocketPrompt
  open={showRocketPrompt}
  onSkip={skipGame}
  onUse={startGame}
/>
 <HeartPrompt
        open={showHeartPrompt}
        onSkip={handleHeartSkip}
        onUse={handleHeartUse}
      />
      </div>
    </>
  );
}
