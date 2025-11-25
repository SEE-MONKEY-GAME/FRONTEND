import Phaser from 'phaser';

export interface FeverConfig {
  goal: number;
  durationMs: number;
  overlayDepth: number;
  overlayAlpha: number;
  overlayOverlapPx: number;
}

class Fever {
  private scene: Phaser.Scene;
  private config: FeverConfig;

  private feverActive = false;
  private feverProgress = 0;
  private feverUntil = 0;
  private fevSegs: Array<{
    img: Phaser.GameObjects.Image;
    startTop: number;
    spawnScroll: number;
    height: number;
  }> = [];

  private feverBgm?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene, config: FeverConfig) {
    this.scene = scene;
    this.config = config;
  }

  // 스크롤 업데이트
  updateScroll(scrollY: number) {
    if (!this.feverActive) {
      return;
    }

    this.updateSegmentsY(scrollY);
    this.cullBelow(scrollY);
    this.fillAbove(scrollY);
    this.fillBelow(scrollY);

    if (this.scene.time.now >= this.feverUntil) {
      this.stopFever();
    }
  }

  // 피버 진행률 증가
  addProgress(amount: number) {
    if (this.feverActive) {
      return;
    }

    this.feverProgress = Math.min(this.config.goal, this.feverProgress + amount);
    const ratio = this.feverProgress / this.config.goal;

    window.dispatchEvent(
      new CustomEvent('game:fever', {
        detail: { progress: ratio, active: false, timeLeftMs: 0 },
      }),
    );

    if (this.feverProgress >= this.config.goal) {
      this.startFever();
    }
  }

  // 피버 활성화 판별
  isActive() {
    return this.feverActive;
  }

  // 초기화
  reset() {
    this.stopFever();
    this.fevSegs.forEach((s) => s.img.destroy());
    this.fevSegs = [];
    this.feverProgress = 0;
    this.feverActive = false;
    this.feverBgm?.destroy();
    this.feverBgm = undefined;
  }

  // 피버 시작
  private startFever() {
    this.feverActive = true;
    this.feverProgress = 0;

    this.feverUntil = this.scene.time.now + this.config.durationMs;

    window.dispatchEvent(
      new CustomEvent('game:fever', {
        detail: { progress: 0, active: true, timeLeftMs: this.config.durationMs },
      }),
    );

    this.initOverlay();
    this.showFeverTitle();

    // BGM 전환
    const init = (this.scene.game as any).INIT_SOUND_STATE;
    if (init.bgm) {
      this.feverBgm = this.scene.sound.add('fever_time_bgm', {
        loop: true,
        volume: 0.4,
      });
      this.feverBgm.play();
    }
  }

  // 피버 종료
  private stopFever() {
    this.feverActive = false;

    window.dispatchEvent(
      new CustomEvent('game:fever', {
        detail: { progress: this.feverProgress / this.config.goal, active: false, timeLeftMs: 0 },
      }),
    );

    this.destroyOverlay();

    // BGM 정리
    this.feverBgm?.stop();
    this.feverBgm?.destroy();
    this.feverBgm = undefined;
  }

  // 피버 타이틀 추가
  private showFeverTitle() {
    const { width, height } = this.scene.cameras.main;

    const startX = width / 2 + 100;
    const centerX = width / 2;
    const endX = width / 2 - 100;
    const y = height * 0.35;

    const t = this.scene.add
      .image(startX, y, 'fevertime_title')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: t,
      x: centerX,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        this.scene.time.delayedCall(500, () => {
          this.scene.tweens.add({
            targets: t,
            x: endX,
            alpha: 0,
            duration: 300,
            onComplete: () => t.destroy(),
          });
        });
      },
    });
  }

  // 오버레이 삽입
  private initOverlay() {
    const { width } = this.scene.cameras.main;

    const tex = this.scene.textures.get('bg_fever').getSourceImage() as HTMLImageElement;

    const rawScale = width / tex.width;
    const displayH = Math.round(tex.height * rawScale);
    const scale = displayH / tex.height;

    const img = this.scene.add
      .image(width / 2, 0, 'bg_fever')
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(this.config.overlayDepth)
      .setAlpha(this.config.overlayAlpha);

    img.setScale(scale);

    this.fevSegs.push({
      img,
      startTop: 0,
      spawnScroll: 0,
      height: displayH,
    });
  }

  // 오버레이 제거
  private destroyOverlay() {
    this.fevSegs.forEach((s) => s.img.destroy());
    this.fevSegs = [];
  }

  // 피버 배경 조각 업데이트
  private updateSegmentsY(scrollY: number) {
    for (const seg of this.fevSegs) {
      const y = seg.startTop + (scrollY - seg.spawnScroll);
      seg.img.setY(Math.round(y));
    }
  }

  // 하단의 피버 배경 조각 제거
  private cullBelow(scrollY: number) {
    const { height } = this.scene.cameras.main;

    this.fevSegs = this.fevSegs.filter((seg) => {
      const top = seg.startTop + (scrollY - seg.spawnScroll);
      const still = top < height + 4;
      if (!still) {
        seg.img.destroy();
      }

      return still;
    });
  }

  // 하단에 피버 배경 조각 채우기
  private fillBelow(scrollY: number) {
    const { height } = this.scene.cameras.main;

    if (this.fevSegs.length === 0) {
      return;
    }
    const bottomMost = this.fevSegs.reduce((a, b) => {
      const ay = a.startTop + (scrollY - a.spawnScroll) + a.height;
      const by = b.startTop + (scrollY - b.spawnScroll) + b.height;
      return ay > by ? a : b;
    });

    let bottomY = Math.round(bottomMost.startTop + (scrollY - bottomMost.spawnScroll) + bottomMost.height);

    while (bottomY < height) {
      const nextH = this.peekHeight();
      const newTop = Math.round(bottomY - this.config.overlayOverlapPx);
      this.createSegment(newTop, scrollY);
      bottomY = newTop + nextH;
    }
  }

  // 상단에 피버 배경 조각 채우기
  private fillAbove(scrollY: number) {
    const { height } = this.scene.cameras.main;

    if (this.fevSegs.length === 0) {
      return;
    }
    const topMost = this.fevSegs.reduce((a, b) => {
      const ay = a.startTop + (scrollY - a.spawnScroll);
      const by = b.startTop + (scrollY - b.spawnScroll);
      return ay < by ? a : b;
    });

    let currentTop = Math.round(topMost.startTop + (scrollY - topMost.spawnScroll));

    while (currentTop > -height) {
      const nextH = this.peekHeight();
      const y = Math.round(currentTop - nextH + this.config.overlayOverlapPx);
      this.createSegment(y, scrollY);
      currentTop = y;
    }
  }

  // 피버 배경 조각 생성
  private createSegment(startTop: number, scrollY: number) {
    const { width } = this.scene.cameras.main;
    const tex = this.scene.textures.get('bg_fever').getSourceImage() as HTMLImageElement;

    const rawScale = width / tex.width;
    const displayH = Math.round(tex.height * rawScale);
    const scale = displayH / tex.height;

    const img = this.scene.add
      .image(width / 2, startTop, 'bg_fever')
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(this.config.overlayDepth)
      .setAlpha(this.config.overlayAlpha);

    img.setScale(scale);

    this.fevSegs.push({
      img,
      startTop,
      spawnScroll: scrollY,
      height: displayH,
    });
  }

  // 조각 높이 계산
  private peekHeight(): number {
    const { width } = this.scene.cameras.main;
    const tex = this.scene.textures.get('bg_fever').getSourceImage() as HTMLImageElement;
    const scale = width / tex.width;
    return tex.height * scale;
  }
}

export default Fever;
