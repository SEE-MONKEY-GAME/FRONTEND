import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import Home from '@pages/home';
import Game from '@pages/game'; 
import { theme } from '@styles/tokens';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} /> 
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
