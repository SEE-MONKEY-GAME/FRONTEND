import { ThemeProvider } from '@emotion/react';
import createGameCanvas from '@phaser/canvas';
import { theme } from '@styles/tokens';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const canvas = createGameCanvas('game');

    return () => {
      canvas.destroy(true);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div id="game" style={{ width: '100vw', height: '100vh' }} />
    </ThemeProvider>
  );
}

export default App;
