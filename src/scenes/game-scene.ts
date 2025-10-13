// src/scenes/game-scene.ts
import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class GameScene extends Phaser.Scene {
  private bar!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private character!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private barCollider!: Phaser.Physics.Arcade.Collider;

  // 마우스/바 추적
  private lastJumpAt = 0;
  private prevBarX = 0;
  private barVX = 0;
  private prevCharY = 0;

  // 점프/쿨다운
  private readonly JUMP_SPEED = 600;
  private readonly HORIZ_BASE_SPEED = 550;
  private readonly HORIZ_BAR_INFLUENCE = 0.5;
  private readonly JUMP_COOLDOWN = 120;

  // 라이프 관련
  private lives = 3;
  private lifeIcons: Phaser.GameObjects.Image[] = [];

  // 리스폰 관련
  private isRespawning = false;
  private respawnTargetY = 0;
  private readonly RESPAWN_OFFSET = 120; // 화면 아래 시작 오프셋(px)

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

    // 라이프 이미지
    this.load.image('flife', getImage('game', 'life_full'));
    this.load.image('elife', getImage('game', 'life_empty'));
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
    this.character.setCollideWorldBounds(false); // 아래 통과 가능

    // 바 생성
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);
    this.bar.body.setAllowGravity(false);
    this.bar.body.setImmovable(true);
    this.bar.body.setSize(this.bar.displayWidth, this.bar.displayHeight * 1.5, true);

    // 라이프 UI 생성
    this.createLivesUI();

    // 카운트다운
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

    // 좌/우 벽 설정 (아래는 통과)
    const worldW = this.cameras.main.width;
    const worldH = this.cameras.main.height;
    const WALL_THICKNESS = 40;

    const leftWall = this.add.rectangle(
      -WALL_THICKNESS / 2,
      worldH / 2,
      WALL_THICKNESS,
      worldH * 3,
      0x000000,
      0
    );
    this.physics.add.existing(leftWall, true);

    const rightWall = this.add.rectangle(
      worldW + WALL_THICKNESS / 2,
      worldH / 2,
      WALL_THICKNESS,
      worldH * 3,
      0x000000,
      0
    );
    this.physics.add.existing(rightWall, true);

    this.physics.add.collider(
      this.character,
      leftWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
    );
    this.physics.add.collider(
      this.character,
      rightWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody
    );
  }

  // -------------------------------
  // 🩷 라이프 관련
  // -------------------------------
  private createLivesUI() {
    const { height } = this.cameras.main;
    const pad = 16;
    const spacing = 36;
    const scale = 0.8;

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const icon = this.add
        .image(pad + i * spacing, height - pad, 'flife')
        .setOrigin(0, 1)
        .setScale(scale)
        .setScrollFactor(0)
        .setDepth(1000);
      this.lifeIcons.push(icon);
    }
    this.refreshLivesUI();
  }

  private refreshLivesUI() {
    for (let i = 0; i < this.lifeIcons.length; i++) {
      this.lifeIcons[i].setTexture(i < this.lives ? 'flife' : 'elife');
    }
  }

  // -------------------------------
  // 🧩 충돌 처리 / 점프
  // -------------------------------
  private canJumpFromAbove() {
    if (this.time.now - this.lastJumpAt < this.JUMP_COOLDOWN) return false;

    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    const falling = cBody.velocity.y > 0;
    const isAbove = this.character.y < this.bar.y;

    // 리스폰 중에는 상승(vy ≤ 0)일 때만 무시, 하강(vy > 0)이면 허용
    if (this.isRespawning && !falling) return false;

    return falling && isAbove;
  }

  private handleJump() {
    if (!this.character.active) return;

    const cBody = this.character.body;
    cBody.setVelocityY(-this.JUMP_SPEED);

    const vx = this.barVX * 15;
    cBody.setVelocityX(vx);

    this.time.delayedCall(50, () => {
      if (!this.character.active) return;
      const vxx = cBody.velocity.x;
      const DIR_THRESHOLD = 1;
      if (vxx > DIR_THRESHOLD) this.setPose('rjump');
      else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
      else this.setPose('jump');
    });

    this.lastJumpAt = this.time.now;
  }

  private setPose(key: 'character' | 'sit' | 'jump' | 'ljump' | 'rjump') {
    if (this.character.texture.key !== key) this.character.setTexture(key);
  }

  // -------------------------------
  // 🌀 화면 밖으로 떨어질 때
  // -------------------------------
  private handleFallOut() {
    if (this.isRespawning) return;
    this.isRespawning = true;

    // 라이프 감소
    this.lives = Math.max(0, this.lives - 1);
    this.refreshLivesUI();

    if (this.lives <= 0) {
      // TODO: 게임오버 처리
      this.character.disableBody(true, true);
      return;
    }

    // 리스폰 시작
    const { width, height } = this.cameras.main;
    this.respawnTargetY = height / 3;

    this.character.enableBody(true, width / 2, height + this.RESPAWN_OFFSET, true, true);
    this.character.setTexture('character').setScale(0.08).setOrigin(0.5);
    this.character.setCollideWorldBounds(false);

    const body = this.character.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(true);

    // 리스폰 점프 (자연스러운 포물선)
    const g = this.physics.world.gravity.y;
    const deltaH = (this.character.y - this.respawnTargetY);
    const v0 = Math.sqrt(2 * g * deltaH);
    body.setVelocityX(0);
    body.setVelocityY(-v0);

    this.setPose('jump');
  }

  private checkOffscreenAndProcess() {
    if (!this.character.active) return;
    const { height } = this.cameras.main;
    const offscreenMargin = 80;
    const bottomEdge = this.character.y - this.character.displayHeight * 0.5;
    if (bottomEdge > height + offscreenMargin) {
      this.handleFallOut();
    }
  }

  // -------------------------------
  // 🔁 매 프레임 업데이트
  // -------------------------------
  update() {
    if (!this.character.active) return;
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

    // 리스폰 중 → 하강 시작되면 자연스럽게 충돌 가능
    if (this.isRespawning && cBody.velocity.y > 0) {
      this.isRespawning = false;
    }

    // 🔥 스윕 보정 (터널링 방지)
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

    // 포즈 상태
    if (!this.isRespawning) {
      const vy = cBody.velocity.y;
      if (vy === 0) this.setPose('sit');
      else if (vy > 0) this.setPose('character');
    }

    // 화면 아래 체크
    this.checkOffscreenAndProcess();

    this.prevCharY = this.character.y;
  }
}

export default GameScene;
