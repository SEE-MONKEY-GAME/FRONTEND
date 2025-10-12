import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    // 필요한 에셋들 로드 (예시)
    this.load.image('bg', getImage('home', 'platform_tree'));
  }

  create() {
    const { width, height } = this.cameras.main;

    const bg = this.add.image(width / 2, height / 2, 'bg');
    bg.setAlpha(0.25);

    this.add
      .text(width / 2, height / 2, '게임 시작!', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}

export default GameScene;
