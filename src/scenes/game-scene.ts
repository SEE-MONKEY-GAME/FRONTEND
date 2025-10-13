import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  private bar!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private character!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

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
    // 🎨 이미지 로드
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

    // ⚙️ 물리 세팅
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    // 🐒 캐릭터
    this.character = this.physics.add
      .image(width / 2, height / 3, 'character')
      .setOrigin(0.5)
      .setScale(0.08)
      .setCollideWorldBounds(true);
    this.character.body.setBounce(1, 0);
    this.character.body.setAllowGravity(false); // 3초 대기

    // 🪵 Bar (마우스 따라다님)
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);
    this.bar.body.setAllowGravity(false);
    this.bar.body.setImmovable(true);
    this.bar.body.setSize(this.bar.displayWidth, this.bar.displayHeight * 1.3, true);

    // 🕒 3초 카운트다운
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
      this.character.body.setAllowGravity(true); // 3초 뒤 낙하 시작
      countdown.destroy();
    });

    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

    // 🎯 포인터 이동 → bar 이동 + 속도 추정
    this.input.on('pointermove', (p) => {
      this.barVX = p.x - this.prevBarX;
      this.bar.setPosition(p.x, p.y);
      this.prevBarX = this.bar.x;
    });

    // 💥 캐릭터 - Bar 충돌 처리
    this.physics.add.collider(
      this.character,
      this.bar,
      () => this.handleJump(),
      () => this.canJumpFromAbove()
    );
  }

  // ✅ 위에서 내려올 때만 점프 허용
  private canJumpFromAbove() {
    if (this.time.now - this.lastJumpAt < this.JUMP_COOLDOWN) return false;
    const falling = this.character.body.velocity.y > 0;
    const isAbove = this.character.y < this.bar.y;
    return falling && isAbove;
  }

  // ✅ 점프 반사 + 방향별 포즈 변경
  // private handleJump() {
  //   const cBody = this.character.body;

  //   // 수직 반사
  //   cBody.setVelocityY(-this.JUMP_SPEED);

  //   // 가로 반사 (바 중심 기준)
  //   const halfW = (this.bar.displayWidth || 1) * 0.5;
  //   const hitOffset = Phaser.Math.Clamp((this.character.x - this.bar.x) / halfW, -1, 1);
  //   const vx = hitOffset * this.HORIZ_BASE_SPEED + this.barVX * this.HORIZ_BAR_INFLUENCE;
  //   cBody.setVelocityX(vx);

  //   // 포즈 전환
  //   if (Math.abs(vx) < 50) this.setPose('jump');
  //   else if (vx < 0) this.setPose('ljump');
  //   else this.setPose('rjump');

  //   this.lastJumpAt = this.time.now;
  // }

//   private handleJump() {
//   const cBody = this.character.body;

//   // 수직 반사 (점프)
//   cBody.setVelocityY(-this.JUMP_SPEED);

//   // 🔹 바의 이동 방향 기준으로 가로 속도 및 이미지 변경
//   const vx = this.barVX * 15; // ← 바 이동 방향에 따른 속도(숫자 크기로 세기 조절 가능)
//   cBody.setVelocityX(vx);

//   // 🔹 방향에 따른 포즈 전환
//   const BAR_DIR_THRESHOLD = 1.5; // 바가 이만큼 이상 움직이면 방향 판단
//   if (this.barVX > BAR_DIR_THRESHOLD) this.setPose('rjump'); // 바가 오른쪽으로 움직이는 중
//   else if (this.barVX < -BAR_DIR_THRESHOLD) this.setPose('ljump'); // 바가 왼쪽으로 움직이는 중
//   else this.setPose('jump'); // 거의 정지 → 수직 점프

//   this.lastJumpAt = this.time.now;
// }
private handleJump() {
  const cBody = this.character.body;
  cBody.setVelocityY(-this.JUMP_SPEED);

  const vx = this.barVX * 15;
  cBody.setVelocityX(vx);

  // ✅ 50ms 뒤에 실제 속도 기준으로 포즈 변경 (반사 후 속도가 안정된 상태)
  this.time.delayedCall(50, () => {
    const vxx = cBody.velocity.x;
    const DIR_THRESHOLD = 1;
    if (vxx > DIR_THRESHOLD) this.setPose('rjump');
    else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
    else this.setPose('jump');
  });

  this.lastJumpAt = this.time.now;
}


  // 🧩 포즈 전환 유틸
  private setPose(key: 'character' | 'sit' | 'jump' | 'ljump' | 'rjump') {
    if (this.character.texture.key !== key) this.character.setTexture(key);
  }

  update() {
    const cBody = this.character.body;

    // 🔥 프레임 사이 교차 감지 (튜널링 방지)
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

    // 🐒 캐릭터 포즈 자동 업데이트
    const vy = cBody.velocity.y;
    if (cBody.blocked.down || vy === 0) {
      this.setPose('sit');            // 착지 상태
    } else if (vy > 0) {
      this.setPose('character');      // 낙하 중
    }
    // vy < 0는 점프 중이므로 그대로 유지

    this.prevCharY = this.character.y;
  }
}

export default GameScene;
