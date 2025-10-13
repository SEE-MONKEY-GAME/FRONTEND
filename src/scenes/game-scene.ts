import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  private bar!: Phaser.Physics.Arcade.Image;
  private character!: Phaser.Physics.Arcade.Image;

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
  this.load.image('bar', getImage('game', 'bar'));
  this.load.image('character', getImage('game', 'character'));
  this.load.image('num3', getImage('game', '3')); 
  this.load.image('num2', getImage('game', '2')); 
  this.load.image('num1', getImage('game', '1'));
}


  create() {
    const { width, height } = this.cameras.main;

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    // 캐릭터
    this.character = this.physics.add
      .image(width / 2, height / 2, 'character')
      .setOrigin(0.5)
      .setScale(0.08)
      .setCollideWorldBounds(true);
    (this.character.body as Phaser.Physics.Arcade.Body).setBounce(1, 0);
    (this.character.body as Phaser.Physics.Arcade.Body).setAllowGravity(false); // ✅ 3초 동안 정지

    // bar
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);

    const barBody = this.bar.body as Phaser.Physics.Arcade.Body;
    barBody.setAllowGravity(false);
    barBody.setImmovable(true);

    // 🔸 히트박스 살짝 키워서 튜널링 여유 (선택)
    barBody.setSize(this.bar.displayWidth, this.bar.displayHeight * 1.3, true);

    const countdown = this.add.image(width / 2, height / 2, 'num3')
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
    ease: 'Back.Out'
  });
  };

  // 3 → 2 → 1 → 낙하 시작
  playFlash(); // 3
  this.time.delayedCall(1000, () => { countdown.setTexture('num2'); playFlash(); });
  this.time.delayedCall(2000, () => { countdown.setTexture('num1'); playFlash(); });

  this.time.delayedCall(3000, () => {
    // ✅ 카운트다운 종료 → 중력 켜고 이미지 제거
    (this.character.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    countdown.destroy();
  });

    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

    // 포인터 이동 → bar 이동 + 속도 추정
    this.input.on('pointermove', (p) => {
      this.barVX = p.x - this.prevBarX;
      this.bar.setPosition(p.x, p.y);
      this.prevBarX = this.bar.x;
    });

    // 기본 콜라이더 (정상 케이스용)
    this.physics.add.collider(
      this.character,
      this.bar,
      () => this.jumpWithAngle(),
      () => this.canJumpFromAbove()
    );
  }

  // ✅ ‘위에서 내려오며’ 닿았는지 판정
  private canJumpFromAbove() {
    if (this.time.now - this.lastJumpAt < this.JUMP_COOLDOWN) return false;

    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    const falling = cBody.velocity.y > 0;
    const isAbove = this.character.y < this.bar.y;
    return falling && isAbove;
  }

  // ✅ 반사 처리 (가로 속도 포함)
  private jumpWithAngle() {
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

    // 수직 반사
    cBody.setVelocityY(-this.JUMP_SPEED);

    // 가로 반사 (bar 중심 대비 충돌 지점)
    const halfW = (this.bar.displayWidth || 1) * 0.5;
    const hitOffset = Phaser.Math.Clamp((this.character.x - this.bar.x) / halfW, -1, 1);

    const vx = hitOffset * this.HORIZ_BASE_SPEED + this.barVX * this.HORIZ_BAR_INFLUENCE;
    cBody.setVelocityX(vx);

    this.lastJumpAt = this.time.now;
  }

  update() {
    // 🔥 스윕 보정: 프레임 사이에 통과했는지 직접 체크
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

    // 캐릭터가 떨어지는 중일 때만 보정
    if (cBody.velocity.y > 0) {
      const barTop = this.bar.y - this.bar.displayHeight * 0.5;
      const charTop = this.character.y - this.character.displayHeight * 0.5;
      const prevCharTop = this.prevCharY - this.character.displayHeight * 0.5;

      // 수평으로 겹치는지
      const b = this.bar.getBounds();
      const c = this.character.getBounds();
      const horizontalOverlap = c.right > b.left && c.left < b.right;

      // 지난 프레임엔 바 위였고, 이번 프레임엔 바를 지나쳤다면 → 강제 착지 후 점프
      const crossedDown = prevCharTop <= barTop && charTop >= barTop;

      if (
        horizontalOverlap &&
        crossedDown &&
        this.time.now - this.lastJumpAt >= this.JUMP_COOLDOWN
      ) {
        // 바 위로 정확히 올려놓고 점프
        const targetY = barTop - this.character.displayHeight * 0.5;
        this.character.setY(targetY);
        this.jumpWithAngle();
      }
    }

    // 다음 프레임 비교용 저장
    this.prevCharY = this.character.y;
  }
}

export default GameScene;
