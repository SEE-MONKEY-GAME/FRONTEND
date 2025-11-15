import Phaser from 'phaser';

class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    const { width, height } = this.cameras.main;

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

       const handleStartGame = () => {
      this.scene.start('GameScene');
    };

    window.addEventListener('game:start', handleStartGame as EventListener);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:start', handleStartGame as EventListener);
    });
  }
}

export default HomeScene;
