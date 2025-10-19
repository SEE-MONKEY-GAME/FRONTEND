import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

export const FEVER_DURATION_MS = 8000;

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

  // 스폰/난이도 
  private readonly SPAWN_PER_FRAME_LIMIT = 3;
  private readonly BANANA_PROB_TABLE: Array<{
    untilM: number;
    probs: { nbana: number; bbana: number; gbana: number };
  }> = [
    { untilM: 1000, probs: { nbana: 0.9, bbana: 0.08, gbana: 0.02 } },
    { untilM: 2000, probs: { nbana: 0.75, bbana: 0.2, gbana: 0.05 } },
    { untilM: Infinity, probs: { nbana: 0.6, bbana: 0.3, gbana: 0.1 } },
  ];

  private lives = 3;
  private lifeIcons: Phaser.GameObjects.Image[] = [];

  private isRespawning = false;
  private respawnTargetY = 0;
  private readonly RESPAWN_OFFSET = 120;

  // 점수
  private readonly PX_PER_M = 10;
  private totalAscentPx = 0;
  private lastYForScore = 0;
  private lastEmittedMeters = -1;

  // 바나나,코인 
  private scrollY = 0;
  private lastSpawnScrollY = 0;
  private readonly SPAWN_GAP_PX = 120;
  private bananaGroup!: Phaser.Physics.Arcade.Group;
  private coin = 0;

  // 피버 
  private feverActive = false;
  private feverUntil = 0;
  private feverProgress = 0;
  private readonly FEVER_GOAL = 20; 
  private readonly FEVER_DURATION = FEVER_DURATION_MS;

  // 아이템 포즈 연출
  private lastDir: 'up' | 'left' | 'right' = 'up';
  private prevVy = 0;

  private poseActive = false;
  private poseUntil = 0;
  private readonly POSE_MIN_MS = 150;
  private readonly POSE_BASE_MS = 200;
  private readonly POSE_RETRIGGER_ADD = 100;
  private readonly POSE_MAX_MS = 300;

  private readonly CHARACTER_SCALE = 0.13;

  private spinTween?: Phaser.Tweens.Tween;

  // 장애물
  private gorillaGroup!: Phaser.Physics.Arcade.Group;
  private readonly GORILLA_SCALE = 0.33;
  private readonly GORILLA_MAX_ON_SCREEN = 3;
  private readonly GORILLA_MIN_SPEED = 80;
  private readonly GORILLA_MAX_SPEED = 140;
  private readonly GORILLA_FALL_SPEED = 60;   
  private readonly GORILLA_KNOCKBACK_X = 480;
  private readonly GORILLA_KNOCKBACK_Y = -480;
  private readonly GORILLA_HIT_COOLDOWN = 400; 
  private readonly GORILLA_SPAWN_PROB_PER_SLOT = 0.15; 

  
  // ====== 배경(세그먼트 스택 방식) ======
  private segs: Array<{
    img: Phaser.GameObjects.Image;
    startTop: number;     // 생성 시 top 기준(Y)
    spawnScroll: number;  // 생성 시 scrollY
    height: number;       // displayHeight
  }> = [];

  private currentLoopKey = 'bg_jungle_loop';
  private pendingStartKey: string | null = null;
  private currentZone = 0;

  private readonly ZONES = [
    { startM: 0,    startKey: 'bg_jungle_start', loopKey: 'bg_jungle_loop' },
    { startM: 1000, startKey: 'bg_sky_start',    loopKey: 'bg_sky_loop'    },
    { startM: 2000, startKey: 'bg_space_start',  loopKey: 'bg_space_loop'  },
  ];

    // ===== 배경 초기화 =====
private initBackground() {
  const { height } = this.cameras.main;

  // (A) 텍스처 필터를 NEAREST로 (이음새/블러 최소화)
  ['bg_jungle_start','bg_jungle_loop','bg_sky_start','bg_sky_loop','bg_space_start','bg_space_loop']
    .forEach(k => this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST));

  // (B) 내부 상태 리셋(리플레이 포함)
  this.segs.forEach(s => s.img.destroy());
  this.segs = [];
  this.scrollY = 0;                // ← 시작 스크롤 확실히 0
  this.currentZone = 0;
  this.currentLoopKey = this.ZONES[0].loopKey;
  this.pendingStartKey = null;

  // (C) 첫 장(start) 추가 후 위로 채움
  const startKey = this.ZONES[0].startKey;
  this.createSegment(startKey, 0, true);
  this.fillAbove();
}



  // ===== 구간 인덱스 계산 =====
  private getZoneIndexByMeters(m: number) {
    if (m >= 2000) return 2;
    if (m >= 1000) return 1;
    return 0;
  }

private createSegment(key: string, currentTopY: number, fitTop = false): number {
  const { width } = this.cameras.main;
  const tex = this.textures.get(key).getSourceImage() as HTMLImageElement;

  // 기본 스케일
  const rawScale = width / tex.width;

  // 화면에 보이는 높이를 정수로 맞추기 위한 스케일 보정
  const displayH = Math.round(tex.height * rawScale);
  const scale = displayH / tex.height;

  const img = this.add.image(width / 2, 0, key)
    .setOrigin(0.5, 0)
    .setScrollFactor(0)
    .setDepth(-1000);
  img.setScale(scale);

  // 데이터 저장
  img.setDataEnabled();
  img.setData('startTop', currentTopY);
  img.setData('spawnScroll', this.scrollY);

  // 위치를 화면 좌표 기준으로 ‘정수’로 스냅
  if (fitTop) img.setY(Math.round(currentTopY));

  const seg = {
    img,
    startTop: currentTopY,
    spawnScroll: this.scrollY,
    height: displayH,                // 이미 정수!
  };
  this.segs.push(seg);

  return seg.height;
}

private fillAbove() {
  const { height } = this.cameras.main;
  if (this.segs.length === 0) return;

  // 현재 화면에서 가장 위쪽 세그먼트의 ‘현재 Y’를 정수로 계산
  const topMost = this.segs.reduce((a, b) => {
    const ay = a.startTop + (this.scrollY - a.spawnScroll);
    const by = b.startTop + (this.scrollY - b.spawnScroll);
    return ay < by ? a : b;
  });
  let currentTopY = Math.round(topMost.startTop + (this.scrollY - topMost.spawnScroll));

  while (currentTopY > -height) {
    // 다음에 붙일 키 결정
    const nextKey = this.pendingStartKey ?? this.currentLoopKey;

    // loop↔loop는 2px, start→loop는 1px 겹침
    const OVERLAP_PX = (this.pendingStartKey ? 1 : 2);

    const nextH = this.peekDisplayHeight(nextKey); // 정수 높이 반환되도록 구현해두면 좋음
    const desiredCurrentY = Math.round(currentTopY - nextH + OVERLAP_PX);

    this.createSegment(nextKey, desiredCurrentY, true);

    if (this.pendingStartKey) {
      const newZone = this.getZoneIndexByMeters(this.getMeters());
      this.currentZone = newZone;
      this.currentLoopKey = this.ZONES[newZone].loopKey;
      this.pendingStartKey = null;
    }

    currentTopY = desiredCurrentY; // 정수 누적
  }
}


private cullBelow() {
  const { height } = this.cameras.main;
  const margin = 4;

  this.segs = this.segs.filter(seg => {
    const top = seg.startTop + (this.scrollY - seg.spawnScroll);
    const bottom = top + seg.height;

    const stillOnOrAboveScreen = top < height + margin;
    if (!stillOnOrAboveScreen) seg.img.destroy();
    return stillOnOrAboveScreen;
  });
}


private updateSegmentsY() {
  for (const seg of this.segs) {
    const y = seg.startTop + (this.scrollY - seg.spawnScroll);
    seg.img.setY(Math.round(y));
  }
}

    private handleZoneTransition() {
    const m = this.getMeters();
    const zoneIdx = this.getZoneIndexByMeters(m);
    if (zoneIdx !== this.currentZone && this.pendingStartKey == null) {
      this.pendingStartKey = this.ZONES[zoneIdx].startKey;
    }
  }

    private peekDisplayHeight(key: string): number {
    const { width } = this.cameras.main;
    const tex = this.textures.get(key).getSourceImage() as HTMLImageElement;
    const scale = width / tex.width;
    return tex.height * scale;
  }

  private gameOver = false;
private onReplay = () => {
  if (!this.scene.isActive()) return;

  // 상태 초기화
  this.gameOver = false;
  this.lives = 3;      
  this.coin = 0;           
  this.totalAscentPx = 0;  
  this.feverActive = false;
  this.feverProgress = 0;

  // 재시작
  this.physics.resume();
  this.input.enabled = true;
  this.scene.restart();
};

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
    this.load.image('jump_item', getImage('game', 'jump-monkey-item'));
    this.load.image('ljump_item', getImage('game', 'ljump-monkey-item'));
    this.load.image('rjump_item', getImage('game', 'rjump-monkey-item'));
    this.load.image('flife', getImage('game', 'life_full'));
    this.load.image('elife', getImage('game', 'life_empty'));
    this.load.image('nbana', getImage('game', 'banana_normal'));
    this.load.image('bbana', getImage('game', 'banana_bunch'));
    this.load.image('gbana', getImage('game', 'banana_gold'));
    this.load.image('fullguage', getImage('game', 'full_guage_bar'));
    this.load.image('emptyguage', getImage('game', 'empty_guage_bar'));
    this.load.image('gori_block_L', getImage('game', 'gorilla_block_left'));
    this.load.image('gori_block_R', getImage('game', 'gorilla_block_right'));
    this.load.image('gori_thief_L', getImage('game', 'gorilla_thief_left'));
    this.load.image('gori_thief_R', getImage('game', 'gorilla_thief_right'));

      // 1구간(정글)
  this.load.image('bg_jungle_start', getImage('game', 'bg_jungle_start'));
  this.load.image('bg_jungle_loop',  getImage('game', 'bg_jungle_loop'));
  // 2구간(하늘)
  this.load.image('bg_sky_start',    getImage('game', 'bg_sky_start'));
  this.load.image('bg_sky_loop',     getImage('game', 'bg_sky_loop'));
  // 3구간(우주)
  this.load.image('bg_space_start',  getImage('game', 'bg_space_start'));
  this.load.image('bg_space_loop',   getImage('game', 'bg_space_loop'));
  }

  create() {
    const { width, height } = this.cameras.main;

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

      this.initBackground();

    window.addEventListener('game:replay', this.onReplay);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:replay', this.onReplay);
    });

    // 캐릭터
    this.character = this.physics.add
      .image(width / 2, height / 3, 'character')
      .setOrigin(0.5)
      .setScale(this.CHARACTER_SCALE);
    this.character.body.setBounce(1, 0);
    (this.character.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.character.setCollideWorldBounds(false);

    // 바
    this.bar = this.physics.add
      .image(width / 2, height * 0.8, 'bar')
      .setOrigin(0.5)
      .setScale(0.3);
    (this.bar.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.bar.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.bar.body as Phaser.Physics.Arcade.Body).setSize(
      this.bar.displayWidth,
      this.bar.displayHeight * 1.5,
      true
    );

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
      (this.character.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
      countdown.destroy();
    });

    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

    // 점수 초기화
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

    // 캐릭터,바 충돌
    this.barCollider = this.physics.add.collider(
      this.character,
      this.bar,
      () => this.handleJump(),
      () => this.canJumpFromAbove()
    );

    // 좌,우 투명벽
    const worldW = width;
    const worldH = height;
    const WALL_THICKNESS = 40;
    const leftWall = this.add.rectangle(-WALL_THICKNESS / 2, worldH / 2, WALL_THICKNESS, worldH * 3, 0x000000, 0);
    const rightWall = this.add.rectangle(worldW + WALL_THICKNESS / 2, worldH / 2, WALL_THICKNESS, worldH * 3, 0x000000, 0);
    this.physics.add.existing(leftWall, true);
    this.physics.add.existing(rightWall, true);
    this.physics.add.collider(this.character, leftWall as any);
    this.physics.add.collider(this.character, rightWall as any);

    // 바나나
    this.bananaGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(
      this.character,
      this.bananaGroup,
      (_ch, item) => this.collectBanana(item as Phaser.Types.Physics.Arcade.ImageWithDynamicBody),
      (_obj1: any, obj2: any): boolean => {
        const go = obj2 as Phaser.GameObjects.GameObject & { getData?: (k: string) => any; active?: boolean };
        if (!go || typeof go.getData !== 'function' || !go.active) return false;
        return !go.getData('collected');
      },
      this
    );

    // 고릴라
    this.gorillaGroup = this.physics.add.group({ allowGravity: false, immovable: true });
  this.physics.add.overlap(
  this.character,
  this.gorillaGroup,
  (_ch, g) => this.hitGorilla(g as Phaser.Types.Physics.Arcade.ImageWithDynamicBody),
  (_ch: any, g: any) => {
    if (this.isRespawning) return false;
    const go = g as Phaser.GameObjects.GameObject & { getData?: (k: string) => any; active?: boolean };
    if (!go || typeof go.getData !== 'function' || !go.active) return false;
    const hitUntil = Number(go.getData('hitUntil') ?? 0);
    return this.time.now >= hitUntil; 
  },
  this
);


    // 초기 이벤트
    this.emitCoin(this.coin);
    this.emitFever(0, false, 0);
  }

  // 라이프 UI 
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

  // 점프 처리
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
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    cBody.setVelocityY(-this.JUMP_SPEED);
    const vx = this.barVX * 15;
    cBody.setVelocityX(vx);

    this.time.delayedCall(50, () => {
      if (!this.character.active || this.poseActive) return;
      const vxx = cBody.velocity.x;
      const DIR_THRESHOLD = 1;
      if (vxx > DIR_THRESHOLD) this.setPose('rjump');
      else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
      else this.setPose('jump');
    });

    this.lastJumpAt = this.time.now;
  }

  private setPose(
    key: 'character' | 'sit' | 'jump' | 'ljump' | 'rjump' | 'jump_item' | 'ljump_item' | 'rjump_item'
  ) {
    if (this.character.texture.key !== key) this.character.setTexture(key);
  }

  private applyNormalJumpPose() {
    const key = this.lastDir === 'left' ? 'ljump' : this.lastDir === 'right' ? 'rjump' : 'jump';
    this.setPose(key);
  }

  private startSpin() {
    this.stopSpin();
    this.character.setAngle(0);
    this.spinTween = this.tweens.add({
      targets: this.character,
      angle: 360,
      duration: 300,
      ease: 'Linear',
      repeat: -1,
    });
  }

  private stopSpin() {
    if (this.spinTween) {
      this.spinTween.stop();
      this.spinTween.remove();
      this.spinTween = undefined;
    }
    this.character.setAngle(0);
  }

  private triggerItemPose(dir: 'up' | 'left' | 'right', opts?: { spin?: boolean }) {
    this.lastDir = dir;
    const itemKey = dir === 'left' ? 'ljump_item' : dir === 'right' ? 'rjump_item' : 'jump_item';
    this.setPose(itemKey);
    if (opts?.spin) this.startSpin();

    const now = this.time.now;
    const base = this.poseActive ? this.POSE_RETRIGGER_ADD : this.POSE_BASE_MS;
    const deadline = Math.max(this.poseUntil, now + base);
    this.poseUntil = Math.min(deadline, now + this.POSE_MAX_MS);
    this.poseActive = true;
  }

  // 낙하,리스폰 
  private handleFallOut() {
    if (this.isRespawning) return;
    this.isRespawning = true;

    this.stopSpin();
    this.character.setAlpha(0.5);
    this.tweens.add({
      targets: this.character,
      alpha: { from: 0.6, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.lives = Math.max(0, this.lives - 1);
    this.refreshLivesUI();

   if (this.lives <= 0) {
  // 게임 오버
  this.gameOver = true;
  this.physics.pause();
  this.input.enabled = false;

  // 게임 오버 창
  const finalScore = this.getMeters();
  const finalCoin = this.coin;
  window.dispatchEvent(new CustomEvent('game:over', {
    detail: { score: finalScore, coin: finalCoin }
  }));

  this.character.disableBody(true, true);
  return;
}

    const { width, height } = this.cameras.main;
    this.respawnTargetY = height / 3;

    this.character.enableBody(true, width / 2, height + this.RESPAWN_OFFSET, true, true);
    this.character.setTexture('character').setScale(this.CHARACTER_SCALE).setOrigin(0.5);
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

  // React 이벤트 
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

  // 피버 
  private startFever() {
    this.feverActive = true;
    this.feverUntil = this.time.now + this.FEVER_DURATION;
    this.feverProgress = 0;
    this.emitFever(0, true, this.FEVER_DURATION);
  }

  private stopFever() {
    this.feverActive = false;
    this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);
  }

  // 스폰/업데이트 공통
  private getMeters(): number {
    return Math.floor(this.totalAscentPx / this.PX_PER_M);
  }

  private getSpawnChance(m: number): number {
    if (m < 50) return 0.8;
    if (m < 150) return 0.9;
    return 1.0;
  }

  private pickBananaSpec(m: number): { key: 'nbana' | 'bbana' | 'gbana'; value: number; scale: number } {
    if (this.feverActive) return { key: 'gbana', value: 10, scale: 0.22 };

    const tier = this.BANANA_PROB_TABLE.find((t) => m <= t.untilM)!;
    const { nbana, bbana, gbana } = tier.probs;
    const r = Math.random();
    let key: 'nbana' | 'bbana' | 'gbana' = 'nbana';
    if (r < gbana) key = 'gbana';
    else if (r < gbana + bbana) key = 'bbana';
    else key = 'nbana';

    if (key === 'gbana') return { key, value: 10, scale: 0.22 };
    if (key === 'bbana') return { key, value: 5, scale: 0.2 };
    return { key: 'nbana', value: 1, scale: 0.18 };
  }

  // 바나나
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
      const spawnScroll = Number(item.getData('spawnScroll') ?? 0);

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

    const val = Number(item.getData('value') ?? 1);
    const x = item.x;
    const y = item.y;
    const tex = item.texture.key;
    const scale = item.scale;

    item.disableBody(true, true);

    const ghost = this.add.image(x, y, tex).setScale(scale).setDepth(10);
    this.tweens.add({ targets: ghost, scale: scale * 1.25, alpha: 0, duration: 150, onComplete: () => ghost.destroy() });

    this.coin += val;
    this.emitCoin(this.coin);

    if (this.feverActive) {
      this.emitFever(0, true, Math.max(0, this.feverUntil - this.time.now));
    } else {
      this.feverProgress = Math.min(this.FEVER_GOAL, this.feverProgress + 1);
      this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);
      if (this.feverProgress >= this.FEVER_GOAL) this.startFever();
    }

    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    let dir: 'up' | 'left' | 'right' = 'up';
    if (Math.abs(cBody.velocity.x) > 10) dir = cBody.velocity.x < 0 ? 'left' : 'right';
    const isGold = tex === 'gbana' || val >= 10;
    this.triggerItemPose(dir, { spin: isGold });
  }

  // 고릴라
  private spawnGorilla() {
    const { width } = this.cameras.main;
    const type: 'block' | 'thief' = Math.random() < 0.5 ? 'block' : 'thief';
    const dir: -1 | 1 = Math.random() < 0.5 ? -1 : 1;

    const x = Phaser.Math.Between(60, width - 60);
    const startScreenY = -Phaser.Math.Between(100, 180);

    const key = this.getGorillaKey(type, dir);
    const g = this.gorillaGroup.create(x, 0, key) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    g.setScale(this.GORILLA_SCALE).setOrigin(0.5);
    g.body.setAllowGravity(false).setImmovable(true);

    g.setData('type', type);
    g.setData('dir', dir);
    g.setData('speed', Phaser.Math.Between(this.GORILLA_MIN_SPEED, this.GORILLA_MAX_SPEED));
    g.setData('hitUntil', 0);
    g.setData('startScreenY', startScreenY);
    g.setData('spawnScroll', this.scrollY);

    g.setY(startScreenY);
  }

  private getGorillaKey(type: 'block' | 'thief', dir: -1 | 1) {
    if (type === 'block') return dir === -1 ? 'gori_block_L' : 'gori_block_R';
    return dir === -1 ? 'gori_thief_L' : 'gori_thief_R';
  }

  private updateGorillas(delta: number) {
    const { width, height } = this.cameras.main;
    const dt = delta / 1000;
    const toKill: Phaser.GameObjects.GameObject[] = [];

    this.gorillaGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const g = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if (!g.active) return true;

      const startScreenY = Number(g.getData('startScreenY') ?? 0);
      const spawnScroll = Number(g.getData('spawnScroll') ?? 0);
      const y = startScreenY + (this.scrollY - spawnScroll) + this.GORILLA_FALL_SPEED * dt;
      g.setY(y);

      let dir = g.getData('dir') as -1 | 1;
      const type = g.getData('type') as 'block' | 'thief';
      const speed = g.getData('speed') as number;

      g.x += dir * speed * dt;

      const margin = 30;
      if (g.x < margin) {
        dir = 1;
        g.setTexture(this.getGorillaKey(type, dir));
      } else if (g.x > width - margin) {
        dir = -1;
        g.setTexture(this.getGorillaKey(type, dir));
      }
      g.setData('dir', dir);

      if (y > height + 100) toKill.push(g);
      return true;
    });

    for (const g of toKill) (g as Phaser.Types.Physics.Arcade.ImageWithDynamicBody).destroy();
  }

private hitGorilla(g: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
  if (this.isRespawning) return;

  const hitUntil = Number(g.getData('hitUntil') ?? 0);
  if (this.time.now < hitUntil) return;
  g.setData('hitUntil', this.time.now + this.GORILLA_HIT_COOLDOWN);

  const cBody = this.character.body as Phaser.Physics.Arcade.Body;
  const pushLeft = this.character.x > g.x;
  cBody.setVelocityX(pushLeft ? this.GORILLA_KNOCKBACK_X : -this.GORILLA_KNOCKBACK_X);
  cBody.setVelocityY(-this.GORILLA_KNOCKBACK_Y);

  if ((g.getData('type') as string) === 'thief') {
    this.coin = Math.max(0, this.coin - 5);
    this.emitCoin(this.coin);
  }
}


  // 프레임 루프
  update(_time: number, delta: number) {
    if (!this.character.active || this.gameOver) return;
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

    // 리스폰 해제
    if (this.isRespawning && cBody.velocity.y > 0) {
      this.isRespawning = false;
      this.tweens.killTweensOf(this.character);
      this.tweens.add({ targets: this.character, alpha: 1, duration: 400, ease: 'Sine.Out' });
      this.lastYForScore = this.character.y;
    }

    // 바 충돌 스윕 보정
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

    // 방향 추적
    if (Math.abs(cBody.velocity.x) > 10) {
      this.lastDir = cBody.velocity.x < 0 ? 'left' : 'right';
    } else {
      this.lastDir = 'up';
    }

    // 아이템 포즈 유지,해제
    const now = this.time.now;
    const vy = cBody.velocity.y;
    const apexPassed = this.prevVy < 0 && vy >= 0;
    if (this.poseActive) {
      const minHoldOk = now >= this.poseUntil - (this.POSE_BASE_MS - this.POSE_MIN_MS);
      const deadlinePassed = now >= this.poseUntil;
      if (minHoldOk && (deadlinePassed || apexPassed)) {
        this.poseActive = false;
        this.stopSpin();
        this.applyNormalJumpPose();
      }
    } else {
      if (!this.isRespawning) {
        if (vy === 0) this.setPose('sit');
        else if (vy > 0) this.setPose('character');
      }
    }

    // 점수,스폰
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

          // 고릴라 최대 수 제한
          if (this.gorillaGroup.getLength() < this.GORILLA_MAX_ON_SCREEN && Math.random() < this.GORILLA_SPAWN_PROB_PER_SLOT) {
            this.spawnGorilla();
          }
        }
      }
    }
    this.lastYForScore = this.character.y;

    this.updateBananas();
    this.updateGorillas(delta);

  // ★ 배경 업데이트 (scrollY 반영 & 구간 전환 처리)
    this.updateSegmentsY();     // scrollY 반영 → 아래로 흘러감
    this.cullBelow();           // 화면 아래로 사라진 세그먼트 제거
    this.handleZoneTransition();// 1000m/2000m에서 다음에 붙일 한 장만 start 예약
    this.fillAbove();           // 위쪽 비면 위로 계속 채움

    if (this.feverActive && this.time.now >= this.feverUntil) this.stopFever();

    this.checkOffscreenAndProcess();

    this.prevVy = vy;
    this.prevCharY = this.character.y;
  }
}

export default GameScene;
