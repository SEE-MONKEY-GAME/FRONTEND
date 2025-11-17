import { useEffect } from 'react';
import { getUserKeyForGame } from '@apps-in-toss/web-framework';
import Canvas from '@canvas/canvas';
import { useToken } from '@context/user-context';

interface LoadProps {
  handleLoading: () => void;
}

const Loading = ({ handleLoading }: LoadProps) => {
  const { setToken } = useToken();

  const login = async () => {
    const result = await getUserKeyForGame();

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result === 'INVALID_CATEGORY') {
      console.error('게임 카테고리가 아닌 미니앱이에요.');
      return;
    }

    if (result === 'ERROR') {
      console.error('사용자 키 조회 중 오류가 발생했어요.');
      return;
    }

    if (result.type === 'HASH') {
      console.log('사용자 키:', result.hash);
      setToken(result.hash);
    }
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <div onClick={handleLoading}>
      <Canvas />
    </div>
  );
};

export default Loading;
