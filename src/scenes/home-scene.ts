import Phaser from 'phaser';

class HomeScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;
  private character!: Phaser.GameObjects.Image;

  constructor() {
    super('HomeScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    if (this.bgm) {
      this.bgm.stop();
      this.bgm.destroy();
    }

    this.bgm = this.sound.add('home_bgm', { loop: true, volume: 0.4 });

    const init = (this.game as any).INIT_SOUND_STATE;
    if (init.bgm && !this.bgm?.isPlaying) {
      this.bgm?.play();
    }

    this.game.events.on('UPDATE_SOUND_STATE', this.handleSoundState, this);

    // 상단 요소
    const upper = this.add.image(500, 0, 'platform');
    upper.setScale(3, 1.25);
    upper.setOrigin(0.5, 1);
    upper.setPosition(width / 2, 150);

    // 캐릭터
    this.character = this.add
      .image(width / 2, height - 220, 'bana')
      .setScale(0.08)
      .setOrigin(0.5, 1);

    window.addEventListener('UPDATE_CHARACTER', (event: Event) => {
      const customEvent = event as CustomEvent<{ type: string; code: string }>;
      const { type, code } = customEvent.detail;
      this.updateCharacter(type, code);
    });

    // 발판
    const platform = this.add.image(0, 0, 'platform');
    platform.setScale(0.3);
    platform.setOrigin(0.5, 1);
    platform.setPosition(width / 2, height - 187);

    const handleStartGame = () => {
      this.scene.start('GameScene');
      this.bgm?.stop();
    };

    window.addEventListener('game:start', handleStartGame as EventListener);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:start', handleStartGame as EventListener);
    });
  }

  // 캐릭터 코스튬 장착, 해제
  private updateCharacter(type: string, code: string) {
    if (type === '' && code === '') {
      this.character.setTexture(`bana`);
      return;
    }

    this.character.setTexture(`bana_${code}`);
  }

  // BGM 상태 조정
  private handleSoundState({ bgm }: { bgm: boolean }) {
    if (this.bgm) {
      if (bgm && !this.bgm.isPlaying) {
        this.bgm.play();
      } else if (!bgm && this.bgm.isPlaying) {
        this.bgm.stop();
      }
    }
  }
}

export default HomeScene;
