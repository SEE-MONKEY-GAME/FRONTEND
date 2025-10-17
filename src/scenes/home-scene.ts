import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  preload() {
    // 임시 로드 이미지, 모든 이미지 파일은 LoadingScene에서 preload 되어야 함
    this.load.image('bana', getImage('home', 'bana'));
    this.load.image('platform', getImage('home', 'platform_tree'));
  }
  create() {
    const { width, height } = this.cameras.main;

    // 임시 요소
    const temp = this.add.image(500, 0, 'platform');
    temp.setScale(3, 1.25);
    temp.setOrigin(0.5, 1);
    temp.setPosition(width / 2, 150);

    // 캐릭터
    const character = this.add.image(0, 0, 'bana');
    character.setScale(0.08);
    character.setOrigin(0.5, 1);
    character.setPosition(width / 2, height - 220);

    // 발판
    const platform = this.add.image(0, 0, 'platform');
    platform.setScale(0.3);
    platform.setOrigin(0.5, 1);
    platform.setPosition(width / 2, height - 187);
  }
}

export default HomeScene;
