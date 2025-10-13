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
  private readonly JUMP_COOLDOWN = 120;

  // ==== 스폰/난이도 설정 ====
  private readonly SPAWN_PER_FRAME_LIMIT = 3;
  private readonly BANANA_PROB_TABLE: Array<{
    untilM: number;
    probs: { nbana: number; bbana: number; gbana: number };
  }> = [
    { untilM: 50,  probs: { nbana: 1.0, bbana: 0.0, gbana: 0.0 } },
    { untilM: 150, probs: { nbana: 0.8, bbana: 0.2, gbana: 0.0 } },
    { untilM: Infinity, probs: { nbana: 0.6, bbana: 0.3, gbana: 0.1 } },
  ];

  private lives = 3;
  private lifeIcons: Phaser.GameObjects.Image[] = [];

  private isRespawning = false;
  private respawnTargetY = 0;
  private readonly RESPAWN_OFFSET = 120;

  // 🧭 점수 계산(누적 스크롤)
  private readonly PX_PER_M = 10;
  private totalAscentPx = 0;
  private lastYForScore = 0;
  private lastEmittedMeters = -1;

  // 🍌 바나나/코인/스크롤
  private scrollY = 0;
  private lastSpawnScrollY = 0;
  private readonly SPAWN_GAP_PX = 120;
  private bananaGroup!: Phaser.Physics.Arcade.Group;
  private coin = 0;

  // 🔥 피버타임
  private feverActive = false;
  private feverUntil = 0;
  private feverProgress = 0;              // 0 ~ FEVER_GOAL
  private readonly FEVER_GOAL = 20;       // 과일 20개
  private readonly FEVER_DURATION = 6000; // 6초

  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('bar', getImage('game', 'bar'));
    this.load.image('character', getImage('game', 'character'));
    this.load.image('num3', getImage('game', '3'));
    this.load.image('num2', getImage('game', '2'));
    this.load.image('num1', getImage('game', '1'));
    this.load.image('sit', getImage('game', 'sit-monkey'));
    this.load.image('jump', getImage('game', 'jump-monkey'));
    this.load.image('ljump', getImage('game', 'ljump-monkey'));
    this.load.image('rjump', getImage('game', 'rjump-monkey'));

    this.load.image('flife', getImage('game', 'life_full'));
    this.load.image('elife', getImage('game', 'life_empty'));

    // 과일들
    this.load.image('nbana', getImage('game', 'banana_normal')); // 1원
    this.load.image('bbana', getImage('game', 'banana_bunch'));  // 5원
    this.load.image('gbana', getImage('game', 'banana_gold'));   // 10원

    // 게이지(이미지는 React UI에서 쓰지만 같이 로드)
    this.load.image('fullguage',  getImage('game', 'full_guage_bar'));
    this.load.image('emptyguage', getImage('game', 'empty_guage_bar'));
  }

  create() {
    const { width, height } = this.cameras.main;

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    // 캐릭터
    this.character = this.physics.add
      .image(width / 2, height / 3, 'character')
      .setOrigin(0.5)
      .setScale(0.08);
    this.character.body.setBounce(1, 0);
    this.character.body.setAllowGravity(false);
    this.character.setCollideWorldBounds(false);

    // 바
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);
    this.bar.body.setAllowGravity(false);
    this.bar.body.setImmovable(true);
    this.bar.body.setSize(this.bar.displayWidth, this.bar.displayHeight * 1.5, true);

    // 라이프 UI
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
      this.tweens.add({ targets: countdown, scale: 0.6, duration: 300, ease: 'Back.Out' });
    };
    playFlash();
    this.time.delayedCall(1000, () => { countdown.setTexture('num2'); playFlash(); });
    this.time.delayedCall(2000, () => { countdown.setTexture('num1'); playFlash(); });
    this.time.delayedCall(3000, () => {
      this.character.body.setAllowGravity(true);
      countdown.destroy();
    });

    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

    // 점수/스크롤 초기화
    this.totalAscentPx = 0;
    this.lastYForScore = this.character.y;
    this.lastEmittedMeters = -1;
    this.emitScore(0);

    this.scrollY = 0;
    this.lastSpawnScrollY = 0;

    // 바 따라다니기
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
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

    // 좌/우 벽
    const worldW = width;
    const worldH = height;
    const WALL_THICKNESS = 40;
    const leftWall = this.add.rectangle(-WALL_THICKNESS / 2, worldH / 2, WALL_THICKNESS, worldH * 3, 0x000000, 0);
    const rightWall = this.add.rectangle(worldW + WALL_THICKNESS / 2, worldH / 2, WALL_THICKNESS, worldH * 3, 0x000000, 0);
    this.physics.add.existing(leftWall, true);
    this.physics.add.existing(rightWall, true);
    this.physics.add.collider(this.character, leftWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody);
    this.physics.add.collider(this.character, rightWall as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody);

    // 🍌 바나나 그룹 + 수집 오버랩
    this.bananaGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    this.physics.add.overlap(
      this.character,
      this.bananaGroup,
      // collideCallback
      (_ch, item) => this.collectBanana(item as Phaser.Types.Physics.Arcade.ImageWithDynamicBody),
      // processCallback (타입을 any로 느슨하게)
      (_obj1: any, obj2: any): boolean => {
        const go = obj2 as Phaser.GameObjects.GameObject & { getData?: (key: string) => any; active?: boolean };
        if (!go || typeof go.getData !== 'function' || !go.active) return false;
        return !go.getData('collected');
      },
      this
    );

    // 코인 초기 이벤트
    this.emitCoin(this.coin);

    // 피버 초기 이벤트
    this.emitFever(0, false, 0);
  }

  // ===============================
  // 🩷 라이프 UI
  // ===============================
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

  // ===============================
  // 🧩 점프 처리
  // ===============================
  private canJumpFromAbove() {
    if (this.time.now - this.lastJumpAt < this.JUMP_COOLDOWN) return false;
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    const falling = cBody.velocity.y > 0;
    const isAbove = this.character.y < this.bar.y;
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

  // ===============================
  // 🌀 화면 아래로 떨어질 때
  // ===============================
  private handleFallOut() {
    if (this.isRespawning) return;
    this.isRespawning = true;

    // 깜빡임
    this.character.setAlpha(0.5);
    this.tweens.add({ targets: this.character, alpha: { from: 0.7, to: 1 }, duration: 100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.lives = Math.max(0, this.lives - 1);
    this.refreshLivesUI();

    if (this.lives <= 0) {
      this.character.disableBody(true, true);
      return;
    }

    const { width, height } = this.cameras.main;
    this.respawnTargetY = height / 3;

    this.character.enableBody(true, width / 2, height + this.RESPAWN_OFFSET, true, true);
    this.character.setTexture('character').setScale(0.08).setOrigin(0.5);
    this.character.setCollideWorldBounds(false);

    const body = this.character.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(true);

    const g = this.physics.world.gravity.y;
    const deltaH = Math.max(0, this.character.y - this.respawnTargetY);
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

  // ===============================
  // 🔔 React 이벤트
  // ===============================
  private emitScore(meters: number) {
    if (meters === this.lastEmittedMeters) return;
    this.lastEmittedMeters = meters;
    window.dispatchEvent(new CustomEvent('game:score', { detail: { score: meters } }));
  }

  private emitCoin(coin: number) {
    window.dispatchEvent(new CustomEvent('game:coin', { detail: { coin } }));
  }

  private emitFever(progress01: number, active: boolean, timeLeftMs: number = 0) {
    window.dispatchEvent(new CustomEvent('game:fever', { detail: { progress: progress01, active, timeLeftMs } }));
  }

  // ===============================
  // 🔥 피버 제어
  // ===============================
  private startFever() {
    this.feverActive = true;
    this.feverUntil = this.time.now + this.FEVER_DURATION;
    this.feverProgress = 0; // 가득 찬 순간 초기화
    this.emitFever(0, true, this.FEVER_DURATION);
  }

  private stopFever() {
    this.feverActive = false;
    this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);
  }

  // ===============================
  // 🍌 바나나 스폰/업데이트/수집
  // ===============================
  private getMeters(): number {
    return Math.floor(this.totalAscentPx / this.PX_PER_M);
  }

  private getSpawnChance(m: number): number {
    if (m < 50) return 0.8;
    if (m < 150) return 0.9;
    return 1.0;
  }

  private pickBananaSpec(m: number): { key: 'nbana'|'bbana'|'gbana'; value: number; scale: number } {
    // 피버 중엔 전부 황금
    if (this.feverActive) return { key: 'gbana', value: 10, scale: 0.22 };

    const tier = this.BANANA_PROB_TABLE.find(t => m <= t.untilM)!;
    const { nbana, bbana, gbana } = tier.probs;
    const r = Math.random();
    let key: 'nbana'|'bbana'|'gbana' = 'nbana';
    if (r < gbana) key = 'gbana';
    else if (r < gbana + bbana) key = 'bbana';
    else key = 'nbana';

    if (key === 'gbana') return { key, value: 10, scale: 0.22 };
    if (key === 'bbana') return { key, value: 5,  scale: 0.20 };
    return { key: 'nbana', value: 1, scale: 0.18 };
  }

  private spawnBanana() {
    const { width } = this.cameras.main;
    const meters = this.getMeters();
    const spec = this.pickBananaSpec(meters);

    const x = Phaser.Math.Between(48, Math.max(52, width - 48));
    const startScreenY = -Phaser.Math.Between(60, 140);
    const spawnScroll = this.scrollY;

    const item = this.bananaGroup.create(x, 0, spec.key) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    item.setScale(spec.scale).setOrigin(0.5);
    item.body.setAllowGravity(false).setImmovable(true);

    item.setData('value', spec.value);
    item.setData('startScreenY', startScreenY);
    item.setData('spawnScroll', spawnScroll);

    item.setY(startScreenY);

    const radius = Math.max(10, item.displayWidth * 0.35);
    item.body.setCircle(radius, item.displayWidth * 0.5 - radius, item.displayHeight * 0.5 - radius);
  }

  private updateBananas() {
    const { height } = this.cameras.main;
    const toKill: Phaser.GameObjects.GameObject[] = [];

    this.bananaGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const item = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if (!item.active) return true;

      const startScreenY = Number(item.getData('startScreenY') ?? 0);
      const spawnScroll  = Number(item.getData('spawnScroll') ?? 0);

      const y = startScreenY + (this.scrollY - spawnScroll);
      item.setY(y);

      if (y > height + 80) toKill.push(item);

      return true;
    });

    for (const it of toKill) {
      (it as Phaser.Types.Physics.Arcade.ImageWithDynamicBody).disableBody(true, true);
      it.destroy();
    }
  }

private collectBanana(item: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
  if (!item.active || item.getData('collected')) return;
  item.setData('collected', true);

  const val   = Number(item.getData('value') ?? 1);
  const x     = item.x;
  const y     = item.y;
  const tex   = item.texture.key;
  const scale = item.scale;

  // 즉시 비활성화 (중복 수집 방지)
  item.disableBody(true, true);

  // 먹었을 때 이펙트
  const ghost = this.add.image(x, y, tex).setScale(scale).setDepth(10);
  this.tweens.add({
    targets: ghost,
    scale: scale * 1.25,
    alpha: 0,
    duration: 150,
    onComplete: () => ghost.destroy(),
  });

  // 💰 코인
  this.coin += val;
  this.emitCoin(this.coin);

  // 🔥 피버 게이지
  if (this.feverActive) {
    // 피버 중에는 게이지를 올리지 않음 (다음 피버에 영향 X)
    // 남은 시간만 UI에 알려주고 진행도는 0으로 유지
    this.emitFever(0, true, Math.max(0, this.feverUntil - this.time.now));
  } else {
    // 평상시에는 과일 1개당 +1 (목표 20개)
    this.feverProgress = Math.min(this.FEVER_GOAL, this.feverProgress + 1);
    this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);

    // 목표 달성 시 피버 시작
    if (this.feverProgress >= this.FEVER_GOAL) {
      this.startFever();
    }
  }
}


  // ===============================
  // 🔁 매 프레임
  // ===============================
  update() {
    if (!this.character.active) return;
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

    // 리스폰 종료 처리
    if (this.isRespawning && cBody.velocity.y > 0) {
      this.isRespawning = false;
      this.tweens.killTweensOf(this.character);
      this.tweens.add({ targets: this.character, alpha: 1, duration: 400, ease: 'Sine.Out' });
      this.lastYForScore = this.character.y;
    }

    // 스윕 보정 (바 충돌)
    if (cBody.velocity.y > 0) {
      const barTop = this.bar.y - this.bar.displayHeight * 0.5;
      const charTop = this.character.y - this.character.displayHeight * 0.5;
      const prevCharTop = this.prevCharY - this.character.displayHeight * 0.5;

      const b = this.bar.getBounds();
      const c = this.character.getBounds();
      const horizontalOverlap = c.right > b.left && c.left < b.right;
      const crossedDown = prevCharTop <= barTop && charTop >= barTop;

      if (horizontalOverlap && crossedDown && this.time.now - this.lastJumpAt >= this.JUMP_COOLDOWN) {
        const targetY = barTop - this.character.displayHeight * 0.5;
        this.character.setY(targetY);
        this.handleJump();
      }
    }

    if (!this.isRespawning) {
      const vy = cBody.velocity.y;
      if (vy === 0) this.setPose('sit');
      else if (vy > 0) this.setPose('character');
    }

    // 점수/스크롤 & 스폰
    if (!this.isRespawning) {
      const dyUp = Math.max(0, this.lastYForScore - this.character.y);
      if (dyUp > 0) {
        this.totalAscentPx += dyUp;
        const meters = Math.floor(this.totalAscentPx / this.PX_PER_M);
        this.emitScore(meters);

        this.scrollY += dyUp;

        let spawned = 0;
        const curMeters = this.getMeters();
        const spawnChance = this.getSpawnChance(curMeters);

        while (this.scrollY - this.lastSpawnScrollY >= this.SPAWN_GAP_PX && spawned < this.SPAWN_PER_FRAME_LIMIT) {
          this.lastSpawnScrollY += this.SPAWN_GAP_PX;
          if (Math.random() < spawnChance) {
            this.spawnBanana();
            spawned++;
          }
        }
      }
    }
    this.lastYForScore = this.character.y;

    // 바나나 업데이트/제거
    this.updateBananas();

    // ⏱️ 피버 종료 체크
    if (this.feverActive && this.time.now >= this.feverUntil) {
      this.stopFever();
    }

    // 화면 이탈 처리
    this.checkOffscreenAndProcess();

    this.prevCharY = this.character.y;
  }
}

export default GameScene;
