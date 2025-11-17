import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Canvas from '@canvas/canvas';
import Toast from '@components/toaster';
import { SoundProvider } from '@context/sound-context';
import { UserProvider } from '@context/user-context';
import { ThemeProvider } from '@emotion/react';
import Game from '@pages/game';
import Home from '@pages/home';
import { theme } from '@styles/tokens';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <SoundProvider>
          <Toast />
          <BrowserRouter>
            <Canvas />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </BrowserRouter>
        </SoundProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
