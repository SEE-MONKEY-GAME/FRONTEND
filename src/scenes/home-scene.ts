import Phaser from 'phaser';

class HomeScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;

  constructor() {
    super('HomeScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.bgm = this.sound.add('home_bgm', { loop: true, volume: 0.4 });
    this.bgm.play();

    // 상단 요소
    const upper = this.add.image(500, 0, 'platform');
    upper.setScale(3, 1.25);
    upper.setOrigin(0.5, 1);
    upper.setPosition(width / 2, 150);

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

    // Scene 전환
    window.addEventListener('game:start', () => {
      this.scene.start('GameScene');
      this.bgm?.stop();
    });
  }
}

export default HomeScene;
