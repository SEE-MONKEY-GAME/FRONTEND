/** @jsxImportSource @emotion/react */
import { ThemeProvider } from '@emotion/react';
import { theme } from '@styles/tokens';
import { body, title, title2 } from 'App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div css={[title, title2]}>title</div>
      <div css={body}>body</div>
    </ThemeProvider>
  );
}

export default App;
