import Phaser from 'phaser';

export type PoseKey =
  | 'character'
  | 'sit'
  | 'jump'
  | 'ljump'
  | 'rjump'
  | 'jump_item'
  | 'ljump_item'
  | 'rjump_item'
  | 'hit_block';

type Dir = 'up' | 'left' | 'right';

export interface CharacterOptions {
  // 기본 스케일
  baseScale?: number;
  // 점프 쿨다운(ms)
  jumpCooldown?: number;
  // 점프 속도(px/s)
  jumpSpeed?: number;

  // 히트(도둑) 애니메이션 fps/총 프레임
  thiefHitFps?: number;
  thiefHitTotalFrames?: number;

  // 포즈 지속시간
  poseMinMs?: number;
  poseBaseMs?: number;
  poseRetriggerAddMs?: number;
  poseMaxMs?: number;

  // 코스튬 텍스쳐 선택기 (예: code-접두어)
  getTex?: (base: string) => string;

  // 아이템 포즈 시 스핀 여부 제어 외부 콜백이 필요하면 여기에 추가 가능
}

export class Character {
  private scene: Phaser.Scene;
  private sprite!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  private baseScale: number;
  private jumpCooldown: number;
  private jumpSpeed: number;

  private thiefHitFps: number;
  private thiefHitTotalFrames: number;

  private poseMinMs: number;
  private poseBaseMs: number;
  private poseRetriggerAddMs: number;
  private poseMaxMs: number;

  private getTex: (base: string) => string;

  // 상태
  lastDir: Dir = 'up';
  lastJumpAt = 0;

  // 포즈
  private poseActive = false;
  private poseUntil = 0;
  private spinTween?: Phaser.Tweens.Tween;

  // 히트/플래시
  thiefHitPlaying = false;
  private thiefHitFrame = 0;
  private thiefHitAccMs = 0;
  isHitFlash = false;
  private hitFlashUntil = 0;

  // 로켓
  rocketActive = false;
  private rocketEndTime = 0;
  private rocketDurationMs = 0;
  private rocketDistanceM = 0;
  private rocketFrameTimer?: Phaser.Time.TimerEvent;
  private rocketFrameIndex = 0;

  // 업데이트용
  prevVy = 0;

  // 포즈별 스케일 보정
  private readonly POSE_SCALE: Record<string, number> = {
    'SCARF-001-sit': 0.3,
  };

  constructor(scene: Phaser.Scene, opts: CharacterOptions = {}) {
    this.scene = scene;
    this.baseScale = opts.baseScale ?? 0.17;
    this.jumpCooldown = opts.jumpCooldown ?? 120;
    this.jumpSpeed = opts.jumpSpeed ?? 600;

    this.thiefHitFps = opts.thiefHitFps ?? 12;
    this.thiefHitTotalFrames = opts.thiefHitTotalFrames ?? 8;

    this.poseMinMs = opts.poseMinMs ?? 150;
    this.poseBaseMs = opts.poseBaseMs ?? 200;
    this.poseRetriggerAddMs = opts.poseRetriggerAddMs ?? 100;
    this.poseMaxMs = opts.poseMaxMs ?? 300;

    this.getTex = opts.getTex ?? ((b) => b);
  }

  /** 생성 */
  create(x: number, y: number, startKey: PoseKey = 'character') {
    const tex = this.getTex(startKey);
    const img = this.scene.physics.add
      .image(x, y, tex)
      .setOrigin(0.5)
      .setScale(this.baseScale);
    img.setDepth(100);
    img.body.setBounce(1, 0);
    (img.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    img.setCollideWorldBounds(false);

    this.sprite = img as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    return this.sprite;
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get image(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
    return this.sprite;
  }

  /** 점프 가능 여부 (위에서 내려찍을 때) */
  canJumpFromAbove(now: number, barY: number) {
    if (now - this.lastJumpAt < this.jumpCooldown) return false;
    const cBody = this.body;
    const falling = cBody.velocity.y > 0;
    const isAbove = this.sprite.y < barY;
    return falling && isAbove;
  }

  /** 점프 처리 */
  jump(now: number, vxFromBar: number) {
    const cBody = this.body;
    cBody.setVelocityY(-this.jumpSpeed);
    const vx = vxFromBar * 15;
    cBody.setVelocityX(vx);
    this.lastJumpAt = now;

    // 점프 직후 포즈(살짝 지연해서 방향 반영)
    this.scene.time.delayedCall(50, () => {
      if (!this.sprite.active || this.poseActive || this.thiefHitPlaying || this.isHitFlash || this.rocketActive) return;
      const vxx = cBody.velocity.x;
      const DIR_THRESHOLD = 1;
      if (vxx > DIR_THRESHOLD) this.setPose('rjump');
      else if (vxx < -DIR_THRESHOLD) this.setPose('ljump');
      else this.setPose('jump');
    });
  }

  /** 외부에서 방향 업데이트 (수평속도 기준) */
  updateDirectionByVelocity(vx: number) {
    if (Math.abs(vx) > 10) {
      this.lastDir = vx < 0 ? 'left' : 'right';
    } else {
      this.lastDir = 'up';
    }
  }

  /** 포즈 설정 */
  setPose(key: PoseKey, force = false) {
    if (!force && (this.thiefHitPlaying || this.isHitFlash)) return;
    if (this.rocketActive) return;

    const texKey = this.getTex(key);
    if (this.sprite.texture.key !== texKey) {
      this.sprite.setTexture(texKey);
    }

    let scale = this.baseScale;
    if (this.POSE_SCALE[texKey] !== undefined) {
      scale *= this.POSE_SCALE[texKey];
    }
    this.sprite.setScale(scale);
  }

  applyNormalJumpPose() {
    const key: PoseKey =
      this.lastDir === 'left' ? 'ljump' : this.lastDir === 'right' ? 'rjump' : 'jump';
    this.setPose(key);
  }

  /** 스핀 */
  private startSpin() {
    this.stopSpin();
    this.sprite.setAngle(0);
    this.spinTween = this.scene.tweens.add({
      targets: this.sprite,
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
    this.sprite.setAngle(0);
  }

  /** 아이템 포즈 트리거 */
  triggerItemPose(dir: Dir, opts?: { spin?: boolean }) {
    this.lastDir = dir;
    const itemKey: PoseKey = dir === 'left' ? 'ljump_item' : dir === 'right' ? 'rjump_item' : 'jump_item';
    this.setPose(itemKey);
    if (opts?.spin) this.startSpin();

    const now = this.scene.time.now;
    const base = this.poseActive ? this.poseRetriggerAddMs : this.poseBaseMs;
    const deadline = Math.max(this.poseUntil, now + base);
    this.poseUntil = Math.min(deadline, now + this.poseMaxMs);
    this.poseActive = true;
  }

  /** 블록 히트 연출 */
  hitBlock(now: number, flashMs = 250) {
    // 로켓 중이면 무시
    if (this.rocketActive) return;

    this.stopSpin();
    this.isHitFlash = true;
    this.hitFlashUntil = now + flashMs;
    this.setPose('hit_block', true);
  }

  /** 도둑 히트(코인 스틸 + 이펙트) */
  hitThief() {
    if (this.rocketActive) return;
    if (this.thiefHitPlaying) return;

    this.stopSpin();
    this.thiefHitPlaying = true;
    this.thiefHitFrame = 0;
    this.thiefHitAccMs = 0;

    this.setPose('hit_block', true);

    // 외부에서 넣어둔 스프라이트시트 키: 'hit_thief'
    // 이펙트는 씬이 책임지게 두고 싶다면 콜백으로 빼도 된다.
    const effect = this.scene.add
      .sprite(this.sprite.x, this.sprite.y, 'hit_thief')
      .setOrigin(0.5, 0.5);

    const baseW = effect.width;
    const targetW = this.sprite.displayWidth * 3.0;
    effect.setScale(targetW / baseW);
    effect.setDepth(this.sprite.depth - 1);
    effect.play('hit_thief_anim');

    effect.on('animationcomplete', () => effect.destroy());
  }

  /** 로켓 시작: 내부 애니 프레임과 중력/포즈 전환만 담당
   *  실제 거리/점수 증분은 update() 반환값으로 상위(GameScene)가 처리
   */
  startRocketBoost(durationMs: number, distanceM: number) {
    this.rocketActive = true;
    this.rocketDurationMs = durationMs;
    this.rocketDistanceM = distanceM;
    this.rocketEndTime = this.scene.time.now + durationMs;

    const cBody = this.body;
    cBody.setVelocity(0, 0);
    cBody.setAllowGravity(false);

    this.sprite.setTexture('rocketmotion', 0);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setScale(this.baseScale * (0.18 / 0.17)); // 기존 스케일 근사치 유지

    if (this.rocketFrameTimer) {
      this.rocketFrameTimer.remove();
      this.rocketFrameTimer = undefined;
    }
    this.rocketFrameIndex = 0;
    this.rocketFrameTimer = this.scene.time.addEvent({
      delay: 1000 / 6,
      loop: true,
      callback: () => {
        this.rocketFrameIndex = (this.rocketFrameIndex + 1) % 2;
        this.sprite.setFrame(this.rocketFrameIndex);
      },
    });
  }

  /** 로켓 종료 후 상태 복구 */
  private endRocket() {
    this.rocketActive = false;

    if (this.rocketFrameTimer) {
      this.rocketFrameTimer.remove();
      this.rocketFrameTimer = undefined;
    }

    this.setPose('character', true);
    const cBody = this.body;
    cBody.setAllowGravity(true);
    cBody.setVelocityY(100);
  }

  /**
   * 매 프레임 호출.
   * - 일반 상태 포즈 관리(앉기/상승/하강)
   * - 히트/플래시 해제
   * - 로켓 주행 중이면 "얼마나 전진했는지(px)"와 "종료되었는지"를 반환
   */
  update(deltaMs: number): { rocketAdvancePx: number; rocketFinished: boolean } | null {
    const now = this.scene.time.now;
    const cBody = this.body;

    // 로켓 중: 상향 이동량을 상위(Scene)에 위임하기 위해 px 증분 계산만 제공
    if (this.rocketActive) {
      const totalPx = this.rocketDistanceM * /* PX_PER_M은 상위에서 곱해줌 아님? → 상위에 위임 */ 1;
      const speedPxPerMs = totalPx / this.rocketDurationMs;
      const stepPx = speedPxPerMs * deltaMs;

      if (now >= this.rocketEndTime) {
        this.endRocket();
        return { rocketAdvancePx: stepPx, rocketFinished: true };
      }
      return { rocketAdvancePx: stepPx, rocketFinished: false };
    }

    // 히트/플래시 상태 해제
    if (this.thiefHitPlaying) {
      this.thiefHitAccMs += deltaMs;
      const frameDur = 1000 / this.thiefHitFps;

      while (this.thiefHitAccMs >= frameDur && this.thiefHitPlaying) {
        this.thiefHitAccMs -= frameDur;
        this.thiefHitFrame++;
        if (this.thiefHitFrame >= this.thiefHitTotalFrames) {
          this.thiefHitPlaying = false;
          this.setPose('character');
          const vy = cBody.velocity.y;
          if (vy === 0) this.setPose('sit');
          else if (vy > 0) this.setPose('character');
          else this.applyNormalJumpPose();
        }
      }
    } else if (this.isHitFlash) {
      if (now >= this.hitFlashUntil) {
        this.isHitFlash = false;
        const vy = cBody.velocity.y;
        if (vy === 0) this.setPose('sit');
        else if (vy > 0) this.setPose('character');
        else this.applyNormalJumpPose();
      }
    } else {
      // 일반 포즈 업데이트
      const vy = cBody.velocity.y;
      const apexPassed = this.prevVy < 0 && vy >= 0;

      if (this.poseActive) {
        const minHoldOk = now >= this.poseUntil - (this.poseBaseMs - this.poseMinMs);
        const deadlinePassed = now >= this.poseUntil;
        if (minHoldOk && (deadlinePassed || apexPassed)) {
          this.poseActive = false;
          this.stopSpin();
          this.applyNormalJumpPose();
        }
      } else {
        if (vy === 0) this.setPose('sit');
        else if (vy > 0) this.setPose('character');
      }

      this.prevVy = vy;
    }

    return null;
  }

  /** 바닥 아래로 떨어졌는지 체크용 (씬에서 호출) */
  isOffscreen(bottomEdgeY: number, screenBottomY: number, margin = 80) {
    return bottomEdgeY > screenBottomY + margin;
  }

  /** 리스폰(엑스트라 라이프 포함) 시 알파 점멸 시작 */
  beginRespawnBlink() {
    this.stopSpin();
    this.sprite.setAlpha(0.5);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.6, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.setPose('jump', true);
  }

  /** 리스폰 점멸 해제 */
  endRespawnBlink() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 400, ease: 'Sine.Out' });
  }

  /** 위치/물리 초기화(리스폰 공통) */
  respawnAt(x: number, y: number) {
    this.sprite.enableBody(true, x, y, true, true);
    this.sprite.setTexture(this.getTex('character')).setScale(this.baseScale).setOrigin(0.5);
    this.sprite.setCollideWorldBounds(false);

    const body = this.body;
    body.setVelocity(0, 0);
    body.setAllowGravity(true);
  }

  /** 로켓 상태 여부 */
  isRocketActive() {
    return this.rocketActive;
  }
}

export default Character;
