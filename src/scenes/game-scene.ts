import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  private bar!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private character!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private barCollider!: Phaser.Physics.Arcade.Collider;

  private lastJumpAt = 0;
  private prevBarX = 0;
  private barVX = 0;
  private prevCharY = 0;

  private readonly JUMP_SPEED = 600;
  private readonly HORIZ_BASE_SPEED = 550;
  private readonly HORIZ_BAR_INFLUENCE = 0.5;
  private readonly JUMP_COOLDOWN = 120;

  constructor() {
    super('Game');
  }

  preload() {
    // 이미지 로드
    this.load.image('bar', getImage('game', 'bar'));
    this.load.image('character', getImage('game', 'character'));
    this.load.image('num3', getImage('game', '3'));
    this.load.image('num2', getImage('game', '2'));
    this.load.image('num1', getImage('game', '1'));
    this.load.image('sit', getImage('game', 'sit-monkey'));
    this.load.image('jump', getImage('game', 'jump-monkey'));
    this.load.image('ljump', getImage('game', 'ljump-monkey'));
    this.load.image('rjump', getImage('game', 'rjump-monkey'));
  }

  create() {
    const { width, height } = this.cameras.main;

    // 물리 설정
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    // 캐릭터 생성
    this.character = this.physics.add
      .image(width / 2, height / 3, 'character')
      .setOrigin(0.5)
      .setScale(0.08);
    this.character.body.setBounce(1, 0);
    this.character.body.setAllowGravity(false); // 3초 대기
    this.character.setCollideWorldBounds(false); // ✅ 밑으로 통과 가능

    // Bar 생성
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);
    this.bar.body.setAllowGravity(false);
    this.bar.body.setImmovable(true);
    this.bar.body.setSize(this.bar.displayWidth, this.bar.displayHeight * 1.5, true);

    // 카운트다운 (3초 후 낙하 시작)
    const countdown = this.add
      .image(width / 2, height / 2, 'num3')
      .setOrigin(0.5)
      .setScale(0.6)
      .setDepth(9999)
      .setScrollFactor(0);

    const playFlash = () => {
      countdown.setScale(0.3);
      this.tweens.add({
        targets: countdown,
        scale: 0.6,
        duration: 300,
        ease: 'Back.Out',
      });
    };

    playFlash(); // 3
    this.time.delayedCall(1000, () => { countdown.setTexture('num2'); playFlash(); });
    this.time.delayedCall(2000, () => { countdown.setTexture('num1'); playFlash(); });
    this.time.delayedCall(3000, () => {
      this.character.body.setAllowGravity(true); // 낙하 시작
      countdown.destroy();
    });

    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

    // 마우스 따라다니는 바
    this.input.on('pointermove', (p) => {
      this.barVX = p.x - this.prevBarX;
      this.bar.setPosition(p.x, p.y);
      this.prevBarX = this.bar.x;
    });

    // 캐릭터-바 충돌
    this.barCollider = this.physics.add.collider(
      this.character,
      this.bar,
      () => this.handleJump(),
      () => this.canJumpFromAbove()
    );

// 기존 create() 안의 상단에서 이미 width, height 선언되어 있으므로,
// 아래에서는 이름을 바꿔 사용한다.
const worldW = this.cameras.main.width;
const worldH = this.cameras.main.height;
const WALL_THICKNESS = 40;

// 왼쪽 벽
const leftWall = this.add.rectangle(
  -WALL_THICKNESS / 2,
  worldH / 2,
  WALL_THICKNESS,
  worldH * 3,
  0x000000,
  0
);
this.physics.add.existing(leftWall, true);

// 오른쪽 벽
const rightWall = this.add.rectangle(
  worldW + WALL_THICKNESS / 2,
  worldH / 2,
  WALL_THICKNESS,
  worldH * 3,
  0x000000,
  0
);
this.physics.add.existing(rightWall, true);

// 캐릭터-벽 충돌
this.physics.add.collider(
  this.character,
  leftWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
);
this.physics.add.collider(
  this.character,
  rightWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
);


  }

  // 위에서 내려올 때만 점프 허용
  private canJumpFromAbove() {
    if (this.time.now - this.lastJumpAt < this.JUMP_COOLDOWN) return false;
    const falling = this.character.body.velocity.y > 0;
    const isAbove = this.character.y < this.bar.y;
    return falling && isAbove;
  }

  // 점프 처리
  private handleJump() {
    const cBody = this.character.body;
    cBody.setVelocityY(-this.JUMP_SPEED);

    const vx = this.barVX * 15;
    cBody.setVelocityX(vx);

    // 50ms 뒤에 실제 속도 기준으로 이미지 전환
    this.time.delayedCall(50, () => {
      const vxx = cBody.velocity.x;
      const DIR_THRESHOLD = 1;
      if (vxx > DIR_THRESHOLD) this.setPose('rjump');
      else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
      else this.setPose('jump');
    });

    this.lastJumpAt = this.time.now;
  }

  // 포즈 전환 유틸
  private setPose(key: 'character' | 'sit' | 'jump' | 'ljump' | 'rjump') {
    if (this.character.texture.key !== key) this.character.setTexture(key);
  }

  // ✅ 화면 밑으로 완전히 떨어지면 사라지게
  private disappearWhenOffscreen() {
    const { height } = this.cameras.main;
    const offscreenMargin = 100;
    if (this.character.y - this.character.displayHeight * 0.5 > height + offscreenMargin) {
      this.character.disableBody(true, true); // 완전히 제거
    }
  }

  update() {
    const cBody = this.character.body;

    // 🔥 프레임 교차 감지 (바 점프)
    if (cBody.velocity.y > 0) {
      const barTop = this.bar.y - this.bar.displayHeight * 0.5;
      const charTop = this.character.y - this.character.displayHeight * 0.5;
      const prevCharTop = this.prevCharY - this.character.displayHeight * 0.5;

      const b = this.bar.getBounds();
      const c = this.character.getBounds();
      const horizontalOverlap = c.right > b.left && c.left < b.right;
      const crossedDown = prevCharTop <= barTop && charTop >= barTop;

      if (
        horizontalOverlap &&
        crossedDown &&
        this.time.now - this.lastJumpAt >= this.JUMP_COOLDOWN
      ) {
        const targetY = barTop - this.character.displayHeight * 0.5;
        this.character.setY(targetY);
        this.handleJump();
      }
    }

    // 포즈 상태 업데이트
    const vy = cBody.velocity.y;
    if (cBody.blocked.down || vy === 0) {
      this.setPose('sit');
    } else if (vy > 0) {
      this.setPose('character');
    }

    // ✅ 화면 밑으로 떨어졌는지 확인 후 제거
    this.disappearWhenOffscreen();

    this.prevCharY = this.character.y;
  }
}

export default GameScene;
