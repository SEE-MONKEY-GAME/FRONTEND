import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Canvas from '@canvas/canvas';
import { SoundProvider } from '@context/sound-context';
import { ThemeProvider } from '@emotion/react';
import Game from '@pages/game';
import Home from '@pages/home';
import Load from '@pages/load';
import { theme } from '@styles/tokens';

const CanvasController = () => {
  const location = useLocation();

  useEffect(() => {
    const container = document.getElementById('phaser-container');
    if (!container) {
      return;
    }

    const isGamePage = location.pathname === '/game';

    if (isGamePage) {
      container.style.zIndex = '1';
      container.style.pointerEvents = 'auto';
    } else {
      container.style.zIndex = '0';
      container.style.pointerEvents = 'none';
    }
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SoundProvider>
        <BrowserRouter>
          <Canvas />
          <CanvasController />
          <Routes>
            <Route path="/" element={<Load />} />
            <Route path="/home" element={<Home />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
