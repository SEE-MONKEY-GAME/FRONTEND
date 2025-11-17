import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Canvas from '@canvas/canvas';
import Toast from '@components/toaster';
import { SoundProvider } from '@context/sound-context';
import { UserProvider } from '@context/user-context';
import { ThemeProvider } from '@emotion/react';
import Game from '@pages/game';
import Home from '@pages/home';
import { theme } from '@styles/tokens';

const CanvasController = ({ load }: { load: boolean }) => {
  const location = useLocation();

  useEffect(() => {
    const container = document.getElementById('phaser-container');

    if (!container) {
      return;
    }

    const isHome = location.pathname === '/';

    const zIndex = isHome ? (load ? 0 : 1) : 1;
    const pointer = zIndex === 0 ? 'none' : 'auto';

    container.style.zIndex = String(zIndex);
    container.style.pointerEvents = pointer;
  }, [location.pathname, load]);

  return null;
};

function App() {
  const [load, setLoad] = useState<boolean>(false);

  const handleLoad = () => {
    setLoad((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <SoundProvider>
          <Toast />
          <BrowserRouter>
            <Canvas />
            <CanvasController load={load} />
            <Routes>
              <Route path="/" element={<Home load={load} handleLoad={handleLoad} />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </BrowserRouter>
        </SoundProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
