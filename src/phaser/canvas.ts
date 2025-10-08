import HomeScene from '@scenes/HomeScene';
import Phaser from 'phaser';

const createGameCanvas = (parentId: string) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentId,
    backgroundColor: '#EFEFEF',
    scene: [HomeScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
      createContainer: true,
    },
  };

  return new Phaser.Game(config);
};

export default createGameCanvas;
