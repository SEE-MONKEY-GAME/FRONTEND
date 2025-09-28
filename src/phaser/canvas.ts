import Phaser from 'phaser';

const createGameCanvas = (parentId: string) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentId,
    backgroundColor: '#EFEFEF',
    scene: [],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 480,
    },
  };

  return new Phaser.Game(config);
};

export default createGameCanvas;
