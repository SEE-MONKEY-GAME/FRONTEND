import Phaser from 'phaser';

export const FEVER_DURATION_MS = 8000;

class GameScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;
  private feverBgm?: Phaser.Sound.BaseSound;
  private effect_nbanana?: Phaser.Sound.BaseSound;
  private effect_bbanana?: Phaser.Sound.BaseSound;
  private effect_gbanana?: Phaser.Sound.BaseSound;
  private effect_hit?: Phaser.Sound.BaseSound;
  private effect_jump?: Phaser.Sound.BaseSound;
  private effect_count_down?: Phaser.Sound.BaseSound;

  private bar!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private character!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private barCollider!: Phaser.Physics.Arcade.Collider;

  private lastJumpAt = 0;
  private prevBarX = 0;
  private barVX = 0;
  private prevCharY = 0;

  private jumpedThisFrame = false;

  private thiefHitPlaying = false;
  private thiefHitFrame = 0;
  private thiefHitAccMs = 0;
  private readonly THIEF_HIT_FPS = 12;
  private readonly THIEF_HIT_TOTAL_FRAMES = 8;

  private readonly JUMP_SPEED = 600;
  private readonly JUMP_COOLDOWN = 120;

  // 스폰 난이도
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
  private rocketActive = false;
  private rocketEndTime = 0;
  private readonly ROCKET_DURATION = 5000;   
  private readonly ROCKET_DISTANCE_M = 801;
  private rocketDurationMs = 0;
  private rocketDistanceM = 0;

  private rocketFrameTimer?: Phaser.Time.TimerEvent;
  private rocketFrameIndex = 0;

  // 로켓 아이템 스폰용
  private rocketGroup!: Phaser.Physics.Arcade.Group;
  private readonly ROCKET_SPAWN_PROB_PER_SLOT = 0.05; 
  private readonly ROCKET_SCALE = 0.16;

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
  private isHitFlash = false;
  private hitFlashUntil = 0;

  // 배경
  private segs: Array<{
    img: Phaser.GameObjects.Image;
    startTop: number;
    spawnScroll: number;
    height: number;
  }> = [];

  private currentLoopKey = 'bg_jungle_loop';
  private pendingStartKey: string | null = null;
  private currentZone = 0;
    private thiefHitEffect?: Phaser.GameObjects.Sprite; 


  private readonly ZONES = [
    { startM: 0, startKey: 'bg_jungle_start', loopKey: 'bg_jungle_loop' },
    { startM: 900, startKey: 'bg_sky_start', loopKey: 'bg_sky_loop' },
    { startM: 2000, startKey: 'bg_space_start', loopKey: 'bg_space_loop' },
  ];

  // 배경 초기화
  private initBackground() {
    const { height } = this.cameras.main;

    [
      'bg_jungle_start',
      'bg_jungle_loop',
      'bg_sky_start',
      'bg_sky_loop',
      'bg_space_start',
      'bg_space_loop',
      'bg_fever',
    ].forEach((k) => this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST));

    this.feverSegs.forEach((f) => f.img.destroy());
    this.feverSegs = [];

    this.segs.forEach((s) => s.img.destroy());
    this.segs = [];
    this.scrollY = 0;
    this.currentZone = 0;
    this.currentLoopKey = this.ZONES[0].loopKey;
    this.pendingStartKey = null;

    const startKey = this.ZONES[0].startKey;
    this.createSegment(startKey, 0, true);
    this.fillAbove();
  }

  private createFeverSegment(currentTopY: number, fitTop = false): number {
    const { width } = this.cameras.main;
    const tex = this.textures.get('bg_fever').getSourceImage() as HTMLImageElement;

    const rawScale = width / tex.width;
    const displayH = Math.round(tex.height * rawScale);
    const scale = displayH / tex.height;

    const img = this.add
      .image(width / 2, 0, 'bg_fever')
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(this.FEVER_OVERLAY_DEPTH)
      .setAlpha(this.FEVER_ALPHA);
    img.setScale(scale);

    img.setDataEnabled();
    img.setData('startTop', currentTopY);
    img.setData('spawnScroll', this.scrollY);

    if (fitTop) img.setY(Math.round(currentTopY));

    this.feverSegs.push({
      img,
      startTop: currentTopY,
      spawnScroll: this.scrollY,
      height: displayH,
    });

    return displayH;
  }

  private updateFeverSegmentsY() {
    for (const seg of this.feverSegs) {
      const y = seg.startTop + (this.scrollY - seg.spawnScroll);
      seg.img.setY(Math.round(y));
    }
  }

  private cullFeverBelow() {
    const { height } = this.cameras.main;
    const margin = 4;

    this.feverSegs = this.feverSegs.filter((seg) => {
      const top = seg.startTop + (this.scrollY - seg.spawnScroll);
      const still = top < height + margin;
      if (!still) seg.img.destroy();
      return still;
    });
  }

  private fillFeverAbove() {
    const { height } = this.cameras.main;
    if (this.feverSegs.length === 0) return;

    const topMost = this.feverSegs.reduce((a, b) => {
      const ay = a.startTop + (this.scrollY - a.spawnScroll);
      const by = b.startTop + (this.scrollY - b.spawnScroll);
      return ay < by ? a : b;
    });
    let currentTopY = Math.round(topMost.startTop + (this.scrollY - topMost.spawnScroll));

    while (currentTopY > -height) {
      const nextH = this.peekDisplayHeight('bg_fever');
      const desiredY = Math.round(currentTopY - nextH + this.FEVER_OVERLAP_PX);
      this.createFeverSegment(desiredY, true);
      currentTopY = desiredY;
    }
  }

  private fillFeverBelow() {
    const { height } = this.cameras.main;
    if (this.feverSegs.length === 0) return;

    const bottomMost = this.feverSegs.reduce((a, b) => {
      const ayTop = a.startTop + (this.scrollY - a.spawnScroll);
      const byTop = b.startTop + (this.scrollY - b.spawnScroll);
      return ayTop + a.height > byTop + b.height ? a : b;
    });

    let bottomMostBottomY = Math.round(
      bottomMost.startTop + (this.scrollY - bottomMost.spawnScroll) + bottomMost.height,
    );

    while (bottomMostBottomY < height) {
      const nextH = this.peekDisplayHeight('bg_fever');
      const newTop = Math.round(bottomMostBottomY - this.FEVER_OVERLAP_PX);
      this.createFeverSegment(newTop, true);
      bottomMostBottomY = newTop + nextH;
    }
  }

  private initFeverOverlay() {
    if (this.segs.length === 0) return;

    const baseTopMost = this.segs.reduce((a, b) => {
      const ay = a.startTop + (this.scrollY - a.spawnScroll);
      const by = b.startTop + (this.scrollY - b.spawnScroll);
      return ay < by ? a : b;
    });
    const baseTopY = Math.round(baseTopMost.startTop + (this.scrollY - baseTopMost.spawnScroll));

    this.createFeverSegment(baseTopY, true);
    this.feverBgm = this.sound.add('fever_time_bgm', { loop: true, volume: 0.4 });
    this.feverBgm.play();

    this.fillFeverAbove();
    this.fillFeverBelow();
  }

  private destroyFeverOverlay() {
    this.feverSegs.forEach((s) => s.img.destroy());
    this.feverBgm?.destroy();
    this.feverSegs = [];
  }

  private getZoneIndexByMeters(m: number) {
    if (m >= 2000) return 2;
    if (m >= 900) return 1;
    return 0;
  }

  private createSegment(key: string, currentTopY: number, fitTop = false): number {
    const { width } = this.cameras.main;
    const tex = this.textures.get(key).getSourceImage() as HTMLImageElement;

    const rawScale = width / tex.width;

    const displayH = Math.round(tex.height * rawScale);
    const scale = displayH / tex.height;

    const img = this.add
      .image(width / 2, 0, key)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(-1000);
    img.setScale(scale);

    img.setDataEnabled();
    img.setData('startTop', currentTopY);
    img.setData('spawnScroll', this.scrollY);

    if (fitTop) img.setY(Math.round(currentTopY));

    const seg = {
      img,
      startTop: currentTopY,
      spawnScroll: this.scrollY,
      height: displayH,
    };
    this.segs.push(seg);

    return seg.height;
  }

  private fillAbove() {
    const { height } = this.cameras.main;
    if (this.segs.length === 0) return;

    const topMost = this.segs.reduce((a, b) => {
      const ay = a.startTop + (this.scrollY - a.spawnScroll);
      const by = b.startTop + (this.scrollY - b.spawnScroll);
      return ay < by ? a : b;
    });
    let currentTopY = Math.round(topMost.startTop + (this.scrollY - topMost.spawnScroll));

    while (currentTopY > -height) {
      const nextKey = this.pendingStartKey ?? this.currentLoopKey;

      const OVERLAP_PX = this.pendingStartKey ? 1 : 2;

      const nextH = this.peekDisplayHeight(nextKey);
      const desiredCurrentY = Math.round(currentTopY - nextH + OVERLAP_PX);

      this.createSegment(nextKey, desiredCurrentY, true);

      if (this.pendingStartKey) {
        const newZone = this.getZoneIndexByMeters(this.getMeters());
        this.currentZone = newZone;
        this.currentLoopKey = this.ZONES[newZone].loopKey;
        this.pendingStartKey = null;
      }

      currentTopY = desiredCurrentY;
    }
  }

  private cullBelow() {
    const { height } = this.cameras.main;
    const margin = 4;

    this.segs = this.segs.filter((seg) => {
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
  private onEnd = () => {
    if (!this.scene.isActive()) return;

    // 상태 초기화
    this.gameOver = false;
    this.lives = 3;
    this.coin = 0;
    this.totalAscentPx = 0;
    this.feverActive = false;
    this.feverProgress = 0;
    this.destroyFeverOverlay();
    this.tweens.killAll();
    this.time.removeAllEvents();

    // 홈 씬으로 전환
    if (this.bgm?.isPlaying) {
      this.bgm.stop();
    }

    if (this.feverBgm?.isPlaying) {
      this.feverBgm.stop();
    }

    this.game.events.off('UPDATE_SOUND_STATE', this.handleSoundState, this);
    this.scene.stop('GameScene');
    this.scene.start('HomeScene');
  };
  private onReplay = () => {
    if (!this.scene.isActive()) return;

    // 상태 초기화
    this.gameOver = false;
    this.lives = 3;
    this.coin = 0;
    this.totalAscentPx = 0;
    this.feverActive = false;
    this.feverProgress = 0;
    this.destroyFeverOverlay();

  this.tweens.killAll();
  this.time.removeAllEvents();

    // 재시작
    this.physics.resume();
    this.input.enabled = true;

    if (this.bgm?.isPlaying) {
      this.bgm.stop();
    }

    if (this.feverBgm?.isPlaying) {
      this.feverBgm.stop();
    }

    this.scene.restart();
  };

  constructor() {
    super('GameScene');
  }

  private feverSegs: Array<{
    img: Phaser.GameObjects.Image;
    startTop: number;
    spawnScroll: number;
    height: number;
  }> = [];
  private FEVER_OVERLAY_DEPTH = -900;
  private FEVER_ALPHA = 0.9;
  private FEVER_OVERLAP_PX = 2;

private startRocketBoost(durationMs: number, distanceM: number) {
  this.rocketActive = true;
  this.rocketDurationMs = durationMs;
  this.rocketDistanceM = distanceM;
  this.rocketEndTime = this.time.now + durationMs;

  const { height } = this.cameras.main;
  const cBody = this.character.body as Phaser.Physics.Arcade.Body;

  if (this.character.y > height * 0.75) {
    this.character.setY(height * 0.75);
  }

  cBody.setVelocity(0, 0);
  cBody.setAllowGravity(false); 

  this.character.setTexture('rocketmotion', 0);
  this.character.setOrigin(0.5, 0.5);
  this.character.setScale(0.18); 

  if (this.rocketFrameTimer) {
    this.rocketFrameTimer.remove();
    this.rocketFrameTimer = undefined;
  }

  this.rocketFrameIndex = 0;
  this.rocketFrameTimer = this.time.addEvent({
    delay: 1000 / 6,
    loop: true,
    callback: () => {
      this.rocketFrameIndex = (this.rocketFrameIndex + 1) % 2;
      this.character.setFrame(this.rocketFrameIndex);
    },
  });

  this.lastYForScore = this.character.y;
  this.prevCharY = this.character.y;
  this.prevVy = 0;
}


  create() {
    const { width, height } = this.cameras.main;

    if (!this.bgm) {
      this.bgm = this.sound.add('game_bgm', { loop: true, volume: 0.4 });
    }

    const init = (this.game as any).INIT_SOUND_STATE;
    if (init.bgm) {
      this.bgm?.play();
    }

    this.game.events.on('UPDATE_SOUND_STATE', this.handleSoundState, this);

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 1200;

    this.initBackground();

    window.addEventListener('game:end', this.onEnd);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:end', this.onEnd);
    });

    window.addEventListener('game:replay', this.onReplay);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:replay', this.onReplay);
    });

    this.anims.create({
      key: 'gori_block_walk',
      frames: this.anims.generateFrameNumbers('gori_block_sheet', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'gori_thief_walk',
      frames: this.anims.generateFrameNumbers('gori_thief_sheet', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hit_thief_anim',
      frames: this.anims.generateFrameNumbers('hit_thief', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
  key: 'rocketmotion_loop',
  frames: this.anims.generateFrameNumbers('rocketmotion', { start: 0, end: 1 }),
  frameRate: 6,  
  repeat: -1,
});


    // 캐릭터
    this.character = this.physics.add
      .image(width / 2, height / 3, 'character')
      .setOrigin(0.5)
      .setScale(this.CHARACTER_SCALE);
      this.character.setDepth(100); 

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
    (this.bar.body as Phaser.Physics.Arcade.Body).setSize(this.bar.displayWidth, this.bar.displayHeight * 1.5, true);

    // 라이프 UI
    this.createLivesUI();

    // 카운트다운
    const countdown = this.add
  .image(width / 2, height / 2, 'num3')
  .setOrigin(0.5)
  .setScale(0.6)
  .setDepth(9999)
  .setScrollFactor(0)
  .setVisible(false); 

const playFlash = () => {
  countdown.setScale(0.3);
  this.tweens.add({ targets: countdown, scale: 0.6, duration: 300, ease: 'Back.Out' });
};

const startCountdown = () => {
  countdown.setVisible(true);
  countdown.setTexture('num3'); 
  playFlash();
  
      const init = (this.game as any).INIT_SOUND_STATE;
      if (init.effect) {
        this.effect_count_down = this.sound.add('count_down_sound', { volume: 0.5 });
        this.effect_count_down.play();
      }

  this.time.delayedCall(1000, () => { countdown.setTexture('num2'); playFlash(); });
  this.time.delayedCall(2000, () => { countdown.setTexture('num1'); playFlash(); });
  this.time.delayedCall(3000, () => {
    (this.character.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    countdown.destroy();
  });
};

const startRocketBoost = () => {
    const w = window as any;
  w.__queuedGameStart = false;
  w.__rocketStart = false;

  this.startRocketBoost(this.ROCKET_DURATION, this.ROCKET_DISTANCE_M);
};



const onPlay = () => {
  const w = window as any;
  if (w.__rocketStart) {
    startRocketBoost();
  } else {
    w.__queuedGameStart = false;
    startCountdown();
  }
};

window.addEventListener('game:play', onPlay);
this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
  window.removeEventListener('game:play', onPlay);
});

if ((window as any).__queuedGameStart) {
  const w = window as any;
  if (w.__rocketStart) {
    startRocketBoost();
  } else {
    w.__queuedGameStart = false;
    startCountdown();
  }
}


    this.prevBarX = this.bar.x;
    this.prevCharY = this.character.y;

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
      () => this.canJumpFromAbove(),
    );

    // 좌,우 투명벽
    const worldW = width;
    const worldH = height;
    const WALL_THICKNESS = 40;
    const leftWall = this.add.rectangle(-WALL_THICKNESS / 2, worldH / 2, WALL_THICKNESS, worldH * 3, 0x000000, 0);
    const rightWall = this.add.rectangle(
      worldW + WALL_THICKNESS / 2,
      worldH / 2,
      WALL_THICKNESS,
      worldH * 3,
      0x000000,
      0,
    );
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
      this,
    );

  this.rocketGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(
      this.character,
      this.rocketGroup,
      (_ch, item) => this.collectRocket(item as Phaser.Types.Physics.Arcade.ImageWithDynamicBody),
      undefined,
      this,
    );

    // 고릴라
    this.gorillaGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(
      this.character,
      this.gorillaGroup,
      (_ch, g) => this.hitGorilla(g as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody),
      (_ch: any, g: any) => {
        if (this.isRespawning) return false;
        const go = g as Phaser.GameObjects.GameObject & { getData?: (k: string) => any; active?: boolean };
        if (!go || typeof go.getData !== 'function' || !go.active) return false;
        const hitUntil = Number(go.getData('hitUntil') ?? 0);
        return this.time.now >= hitUntil;
      },
      this,
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

    const init = (this.game as any).INIT_SOUND_STATE;
    if (init.effect) {
      this.effect_jump = this.sound.add('jump_sound', { volume: 0.6 });
      this.effect_jump.play();
    }

    this.time.delayedCall(50, () => {
      if (!this.character.active || this.poseActive || this.thiefHitPlaying || this.isHitFlash) return;
      const vxx = cBody.velocity.x;
      const DIR_THRESHOLD = 1;
      if (vxx > DIR_THRESHOLD) this.setPose('rjump');
      else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
      else this.setPose('jump');
    });

    this.lastJumpAt = this.time.now;
  }

  private setPose(
    key: 'character' | 'sit' | 'jump' | 'ljump' | 'rjump' | 'jump_item' | 'ljump_item' | 'rjump_item',
    force = false,
  ) {
    if (!force && (this.thiefHitPlaying || this.isHitFlash)) return;

    if (this.character.texture.key !== key) {
      this.character.setTexture(key);
    }
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
      window.dispatchEvent(
        new CustomEvent('game:over', {
          detail: { score: finalScore, coin: finalCoin },
        }),
      );

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
    this.bgm?.stop();

    this.initFeverOverlay();
  }

  private stopFever() {
    this.feverActive = false;
    this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);
    this.bgm?.resume();

    this.destroyFeverOverlay();
  }

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
    this.tweens.add({
      targets: ghost,
      scale: scale * 1.25,
      alpha: 0,
      duration: 150,
      onComplete: () => ghost.destroy(),
    });

    const init = (this.game as any).INIT_SOUND_STATE;
    if (init.effect) {
      this.effect_nbanana = this.sound.add('banana_1_sound', { volume: 0.5 });
      this.effect_bbanana = this.sound.add('banana_2_sound', { volume: 0.5 });
      this.effect_gbanana = this.sound.add('banana_3_sound', { volume: 0.5 });

      switch (tex) {
        case 'nbana':
          this.effect_nbanana.play();
          break;
        case 'bbana':
          this.effect_bbanana.play();
          break;
        case 'gbana':
          this.effect_gbanana.play();
          break;
      }
    }

    this.coin += val;
    this.emitCoin(this.coin);

    if (this.feverActive) {
      this.emitFever(0, true, Math.max(0, this.feverUntil - this.time.now));
    } else {
      this.feverProgress = Math.min(this.FEVER_GOAL, this.feverProgress + 1);
      this.emitFever(this.feverProgress / this.FEVER_GOAL, false, 0);
      if (this.feverProgress >= this.FEVER_GOAL) this.startFever();
    }

    if (this.rocketActive) {
      return;
    }

    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    let dir: 'up' | 'left' | 'right' = 'up';
    if (Math.abs(cBody.velocity.x) > 10) {
      dir = cBody.velocity.x < 0 ? 'left' : 'right';
    }
    const isGold = tex === 'gbana' || val >= 10;
    this.triggerItemPose(dir, { spin: isGold });
  }



    private spawnRocket() {
    const { width } = this.cameras.main;

    const x = Phaser.Math.Between(48, Math.max(52, width - 48));
    const startScreenY = -Phaser.Math.Between(80, 160);
    const spawnScroll = this.scrollY;

    const rocket = this.rocketGroup.create(x, 0, 'rocket') as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    rocket.setScale(this.ROCKET_SCALE).setOrigin(0.5);
    rocket.body.setAllowGravity(false).setImmovable(true);

    rocket.setData('startScreenY', startScreenY);
    rocket.setData('spawnScroll', spawnScroll);

    rocket.setY(startScreenY);

    const radius = Math.max(14, rocket.displayWidth * 0.35);
    rocket.body.setCircle(radius, rocket.displayWidth * 0.5 - radius, rocket.displayHeight * 0.5 - radius);
  }

   private updateRockets() {
    const { height } = this.cameras.main;
    const toKill: Phaser.GameObjects.GameObject[] = [];

    this.rocketGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
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

    private collectRocket(item: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    if (!item.active) return;

    item.disableBody(true, true);
    item.destroy();

    if (this.rocketActive) return;

    this.startRocketBoost(2000, 240);
  }

  // 고릴라
  private spawnGorilla() {
    const { width } = this.cameras.main;

    const type: 'block' | 'thief' = Math.random() < 0.5 ? 'block' : 'thief';
    const dir: -1 | 1 = Math.random() < 0.5 ? -1 : 1;

    const x = Phaser.Math.Between(60, width - 60);
    const startScreenY = -Phaser.Math.Between(100, 180);

    const sheetKey = type === 'block' ? 'gori_block_sheet' : 'gori_thief_sheet';
    const g = this.physics.add.sprite(x, 0, sheetKey) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    g.setOrigin(0.5, 0.5).setScale(this.GORILLA_SCALE);
    g.body.setAllowGravity(false).setImmovable(true);

    // 충돌박스
    const bw = Math.round(g.displayWidth * 0.6);
    const bh = Math.round(g.displayHeight * 0.8);
    g.body.setSize(bw, bh, true);

    g.setData('type', type);
    g.setData('dir', dir);
    g.setData('speed', Phaser.Math.Between(this.GORILLA_MIN_SPEED, this.GORILLA_MAX_SPEED));
    g.setData('hitUntil', 0);
    g.setData('startScreenY', startScreenY);
    g.setData('spawnScroll', this.scrollY);

    g.setY(startScreenY);

    const animKey = type === 'block' ? 'gori_block_walk' : 'gori_thief_walk';
    g.anims.play(animKey, true);
    g.setFlipX(dir === 1);

    this.gorillaGroup.add(g);
  }

  private updateGorillas(delta: number) {
    const { width, height } = this.cameras.main;
    const dt = delta / 1000;
    const toKill: Phaser.GameObjects.GameObject[] = [];

    this.gorillaGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const g = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!g.active) return true;

      const startScreenY = Number(g.getData('startScreenY') ?? 0);
      const spawnScroll = Number(g.getData('spawnScroll') ?? 0);
      const y = startScreenY + (this.scrollY - spawnScroll) + this.GORILLA_FALL_SPEED * dt;
      g.setY(y);

      let dir = g.getData('dir') as -1 | 1;
      const speed = g.getData('speed') as number;

      g.x += dir * speed * dt;

      const margin = 30;
      if (g.x < margin) {
        dir = 1;
        g.setData('dir', dir);
        g.setFlipX(true);
      } else if (g.x > width - margin) {
        dir = -1;
        g.setData('dir', dir);
        g.setFlipX(false);
      }

      if (y > height + 100) toKill.push(g);
      return true;
    });

    for (const g of toKill) (g as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).destroy();
  }

  private hitGorilla(g: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    if (this.isRespawning) return;
    if (this.rocketActive) return;


    const hitUntil = Number(g.getData('hitUntil') ?? 0);
    if (this.time.now < hitUntil) return;
    g.setData('hitUntil', this.time.now + this.GORILLA_HIT_COOLDOWN);

    const cBody = this.character.body as Phaser.Physics.Arcade.Body;
    const pushLeft = this.character.x > g.x;
    cBody.setVelocityX(pushLeft ? this.GORILLA_KNOCKBACK_X : -this.GORILLA_KNOCKBACK_X);
    cBody.setVelocityY(-this.GORILLA_KNOCKBACK_Y);

    const init = (this.game as any).INIT_SOUND_STATE;
    this.effect_hit = this.sound.add('hit_sound', { volume: 1.5 });

    if ((g.getData('type') as string) === 'block') {
      this.stopSpin();
      this.isHitFlash = true;
      this.hitFlashUntil = this.time.now + 250;
      this.character.setTexture('hit_block');

      if (init.effect) {
        this.effect_hit.play();
      }
    }

  if ((g.getData('type') as string) === 'thief') {
  this.coin = Math.max(0, this.coin - 5);
  this.emitCoin(this.coin);

  this.stopSpin();

  if (init.effect) {
    this.effect_hit.play();
  }

  if (!this.thiefHitPlaying) {
    this.thiefHitPlaying = true;
    this.thiefHitFrame = 0;
    this.thiefHitAccMs = 0;

    this.character.setTexture('hit_block');

    if (this.thiefHitEffect) {
      this.thiefHitEffect.destroy();
      this.thiefHitEffect = undefined;
    }

    const effect = this.add
      .sprite(this.character.x, this.character.y, 'hit_thief')
      .setOrigin(0.5, 0.5);

    const baseW = effect.width; 
    const targetW = this.character.displayWidth * 3.0; 
    effect.setScale(targetW / baseW);

    effect.setDepth(this.character.depth - 1);

    effect.play('hit_thief_anim');

    effect.on('animationcomplete', () => {
      effect.destroy();
      if (this.thiefHitEffect === effect) {
        this.thiefHitEffect = undefined;
      }
    });

    this.thiefHitEffect = effect;
  }
}

  }

  // 프레임 루프
  update(_time: number, delta: number) {
    if (!this.character.active || this.gameOver) return;
    const cBody = this.character.body as Phaser.Physics.Arcade.Body;

if (this.rocketActive) {
  const dt = delta; // ms
  const totalPx = this.rocketDistanceM * this.PX_PER_M;
  const speedPxPerMs = totalPx / this.rocketDurationMs;
  const stepPx = speedPxPerMs * dt;

  this.totalAscentPx += stepPx;
  const meters = Math.floor(this.totalAscentPx / this.PX_PER_M);
  this.emitScore(meters);

  this.scrollY += stepPx;
  this.lastSpawnScrollY = this.scrollY;

  this.updateSegmentsY();
  this.cullBelow();
  this.handleZoneTransition();
  this.fillAbove();

  if (this.feverActive) {
    this.updateFeverSegmentsY();
    this.cullFeverBelow();
    this.fillFeverAbove();
    this.fillFeverBelow();
  }

  this.updateBananas();
  this.updateGorillas(delta);
  this.updateRockets();

  cBody.setVelocity(0, 0);

  if (this.time.now >= this.rocketEndTime) {
    this.rocketActive = false;

    if (this.rocketFrameTimer) {
      this.rocketFrameTimer.remove();
      this.rocketFrameTimer = undefined;
    }

    this.character.setTexture('character');
    this.character.setOrigin(0.5, 0.5);
    this.character.setScale(this.CHARACTER_SCALE);

    cBody.setAllowGravity(true);
    cBody.setVelocityY(100);

    this.lastYForScore = this.character.y;
    this.prevCharY = this.character.y;
    this.prevVy = cBody.velocity.y;
  }

  return;
}




    this.jumpedThisFrame = false;

    // 리스폰 해제
    if (this.isRespawning && cBody.velocity.y > 0) {
      this.isRespawning = false;
      this.tweens.killTweensOf(this.character);
      this.tweens.add({ targets: this.character, alpha: 1, duration: 400, ease: 'Sine.Out' });
      this.lastYForScore = this.character.y;
    }

    // 스윕 보정 (Body 기반)
    if (cBody.velocity.y > 0 && !this.jumpedThisFrame) {
      const barBody = this.bar.body as Phaser.Physics.Arcade.Body;
      const charBody = this.character.body as Phaser.Physics.Arcade.Body;

      const barTop = barBody.top;
      const prevCharBottom = this.prevCharY + charBody.halfHeight;
      const charBottom = this.character.y + charBody.halfHeight;

      const horizontalOverlap = charBody.right > barBody.left && charBody.left < barBody.right;
      const crossedDown = prevCharBottom <= barTop && charBottom >= barTop;

      if (horizontalOverlap && crossedDown && this.time.now - this.lastJumpAt >= this.JUMP_COOLDOWN) {
        const targetY = barTop - charBody.halfHeight + 0.5;
        this.character.setY(targetY);
        charBody.updateFromGameObject?.();

        this.handleJump();
        this.jumpedThisFrame = true;
      }
    }

    if (Math.abs(cBody.velocity.x) > 10) {
      this.lastDir = cBody.velocity.x < 0 ? 'left' : 'right';
    } else {
      this.lastDir = 'up';
    }

    if (this.thiefHitPlaying) {
  this.thiefHitAccMs += delta;
  const frameDur = 1000 / this.THIEF_HIT_FPS;

  while (this.thiefHitAccMs >= frameDur && this.thiefHitPlaying) {
    this.thiefHitAccMs -= frameDur;
    this.thiefHitFrame++;

    if (this.thiefHitFrame >= this.THIEF_HIT_TOTAL_FRAMES) {
      // 🔽 애니메이션 한 사이클 끝
      this.thiefHitPlaying = false;

      // 원래 캐릭터 텍스처로 복귀
      this.character.setTexture('character');

      const vy = cBody.velocity.y;
      if (vy === 0) this.setPose('sit');
      else if (vy > 0) this.setPose('character');
      else this.applyNormalJumpPose();
    }
  }
}
else if (this.isHitFlash) {
      if (this.time.now >= this.hitFlashUntil) {
        this.isHitFlash = false;
        const vy = cBody.velocity.y;
        if (vy === 0) this.setPose('sit');
        else if (vy > 0) this.setPose('character');
        else this.applyNormalJumpPose();
      }
    } else {
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
    }

    // 점수, 스폰
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
          if (
            this.gorillaGroup.getLength() < this.GORILLA_MAX_ON_SCREEN &&
            Math.random() < this.GORILLA_SPAWN_PROB_PER_SLOT
          ) {
            this.spawnGorilla();
          }

           if (Math.random() < this.ROCKET_SPAWN_PROB_PER_SLOT) {
    this.spawnRocket();
  }
        }
      }
    }

    this.lastYForScore = this.character.y;

    this.updateBananas();
    this.updateGorillas(delta);
        this.updateRockets(); 


    this.updateSegmentsY();
    this.cullBelow();
    this.handleZoneTransition();
    this.fillAbove();

    if (this.feverActive) {
      this.updateFeverSegmentsY();
      this.cullFeverBelow();
      this.fillFeverAbove();
      this.fillFeverBelow();
    }

    if (this.feverActive && this.time.now >= this.feverUntil) this.stopFever();

    this.checkOffscreenAndProcess();

    this.prevVy = cBody.velocity.y;
    this.prevCharY = this.character.y;
  }

  // BGM 및 효과음 상태 조정
  private handleSoundState({ bgm, effect }: { bgm: boolean; effect: boolean }) {
    if (this.bgm) {
      if (bgm && !this.bgm.isPlaying) {
        this.bgm.play();
      } else if (!bgm && this.bgm.isPlaying) {
        this.bgm.stop();
      }
    }

    if (this.feverBgm) {
      if (bgm && !this.feverBgm.isPlaying) {
        this.feverBgm.play();
      } else if (!bgm && this.feverBgm.isPlaying) {
        this.feverBgm.stop();
      }
    }
  }
}

export default GameScene;
