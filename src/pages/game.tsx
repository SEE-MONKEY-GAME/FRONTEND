/** @jsxImportSource @emotion/react */
import GameCanvas from '../canvas/game-canvas';

const Game = () => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <GameCanvas />
    </div>
  );
};

export default Game;
