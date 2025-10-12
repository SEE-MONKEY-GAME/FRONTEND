import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  private bar!: Phaser.Physics.Arcade.Image;       // ✅ StaticImage 대신 Image
  private character!: Phaser.Physics.Arcade.Image;
  private lastJumpAt = 0;

  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('bar', getImage('game', 'bar'));
    this.load.image('character', getImage('game', 'character'));
  }

  create() {
    const { width, height } = this.cameras.main;

    // 물리/중력
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    // 캐릭터: 정중앙 + 스케일 0.08
    this.character = this.physics.add
      .image(width / 2, height / 2, 'character')
      .setOrigin(0.5, 0.5)
      .setScale(0.08);

    this.character.setCollideWorldBounds(true);

    // 마우스를 따라다니는 바(동적 바디지만 '정지물체'처럼)
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5, 0.5)
      .setScale(0.3);

    // ✅ 중력/반응 없게, 밀리지 않게
(this.bar.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
(this.bar.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    // 포인터 이동에 맞춰 바 이동
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.bar.setPosition(pointer.x, pointer.y);
      // 동적 바디는 setPosition으로 함께 이동하므로 별도 refresh 불필요
    });

    // 충돌 시 점프 (위에서 내려오며 닿을 때만)
    const JUMP_SPEED = 600;
    const JUMP_COOLDOWN = 120;

    this.physics.add.collider(
      this.character,
      this.bar,
      () => {
        const cBody = this.character.body as Phaser.Physics.Arcade.Body; // ✅ null 아님 보장
        cBody.setVelocityY(-JUMP_SPEED);
        this.lastJumpAt = this.time.now;
      },
      () => {
        const cBody = this.character.body as Phaser.Physics.Arcade.Body;
        // 같은 프레임 다중 점프 방지 + 위에서 떨어지는 중 + 캐릭터가 바 위
        if (this.time.now - this.lastJumpAt < JUMP_COOLDOWN) return false;
        return cBody.velocity.y > 0 && this.character.y < this.bar.y;
      }
    );
  }
}

export default GameScene;
