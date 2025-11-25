export interface BananaSpec {
  key: 'nbana' | 'bbana' | 'gbana';
  value: number;
  scale: number;
}

export interface BananaConfig {
  spawnGapPx: number;
  spawnLimit: number;
  probTable: Array<{
    untilM: number;
    probs: { nbana: number; bbana: number; gbana: number };
  }>;
}

export interface BananaCollectInfo {
  val: number;
  key: string;
  scale: number;
  x: number;
  y: number;
  isGold: boolean;
}

class Banana {
  private scene: Phaser.Scene;
  private group: Phaser.Physics.Arcade.Group;
  private config: BananaConfig;

  private lastSpawnScrollY = 0;

  constructor(scene: Phaser.Scene, physics: Phaser.Physics.Arcade.ArcadePhysics, config: BananaConfig) {
    this.scene = scene;
    this.config = config;
    this.group = physics.add.group({ allowGravity: false, immovable: true });
  }

  // 캐릭터와 바나나 충돌 감지
  public setupCollision(
    target: Phaser.GameObjects.GameObject,
    callback: (banana: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) => void,
  ) {
    this.scene.physics.add.overlap(
      target,
      this.group,
      (_ch, b) => callback(b as Phaser.Types.Physics.Arcade.ImageWithDynamicBody),
      (_obj1: any, obj2: any): boolean => {
        const go = obj2 as Phaser.GameObjects.GameObject & {
          getData?: (k: string) => any;
          active?: boolean;
        };

        if (!go || typeof go.getData !== 'function' || !go.active) {
          return false;
        }

        return !go.getData('collected');
      },
      this.scene,
    );
  }

  // 현재 미터에 따른 바나나 스폰 확률 조정
  private pickBananaSpec(m: number, feverActive: boolean): BananaSpec {
    if (feverActive) {
      return { key: 'gbana', value: 10, scale: 0.22 };
    }

    const tier = this.config.probTable.find((t) => m <= t.untilM)!;
    const { bbana, gbana } = tier.probs;
    const r = Math.random();

    let key: BananaSpec['key'] = 'nbana';
    if (r < gbana) {
      key = 'gbana';
    } else if (r < gbana + bbana) {
      key = 'bbana';
    }

    if (key === 'gbana') {
      return { key, value: 10, scale: 0.22 };
    }
    if (key === 'bbana') {
      return { key, value: 5, scale: 0.2 };
    }

    return { key: 'nbana', value: 1, scale: 0.18 };
  }

  // 바나나 스폰
  private spawnBanana(scrollY: number, meters: number, feverActive: boolean) {
    const { width } = this.scene.cameras.main;
    const spec = this.pickBananaSpec(meters, feverActive);

    const x = Phaser.Math.Between(48, width - 48);
    const startScreenY = -Phaser.Math.Between(60, 140);

    const banana = this.group.create(x, startScreenY, spec.key) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    banana.setScale(spec.scale).setOrigin(0.5);
    banana.body.setAllowGravity(false).setImmovable(true);

    banana.setData('value', spec.value);
    banana.setData('startScreenY', startScreenY);
    banana.setData('spawnScroll', scrollY);

    const radius = Math.max(10, banana.displayWidth * 0.35);
    banana.body.setCircle(radius, banana.displayWidth * 0.5 - radius, banana.displayHeight * 0.5 - radius);
  }

  // 바나나 수집
  public collect(item: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, onCollect: (info: BananaCollectInfo) => void) {
    if (!item.active || item.getData('collected')) {
      return;
    }

    item.setData('collected', true);

    const val = Number(item.getData('value'));
    const x = item.x;
    const y = item.y;
    const key = item.texture.key;
    const scale = item.scale;

    const ghost = this.scene.add.image(x, y, key).setScale(scale).setDepth(10);
    this.scene.tweens.add({
      targets: ghost,
      scale: scale * 1.25,
      alpha: 0,
      duration: 150,
      onComplete: () => ghost.destroy(),
    });

    const init = (this.scene.game as any).INIT_SOUND_STATE;
    if (init.effect) {
      const soundMap: Record<string, string> = {
        normal: 'banana_1_sound',
        bunch: 'banana_2_sound',
        gold: 'banana_3_sound',
      };

      const soundKey = soundMap[key];
      if (soundKey) {
        const sound = this.scene.sound.add(soundKey, { volume: 0.5 });
        sound.play();
      }
    }

    item.disableBody(true, true);
    item.destroy();

    const isGold = key === 'gold' || val >= 10;

    onCollect({ val, key, scale, x, y, isGold });
  }

  // 프레임 업데이트
  public update(scrollY: number, getMeters: () => number, feverActive: boolean) {
    const meters = getMeters();
    const { height } = this.scene.cameras.main;

    // 스폰 처리
    let spawned = 0;
    while (scrollY - this.lastSpawnScrollY >= this.config.spawnGapPx && spawned < this.config.spawnLimit) {
      this.lastSpawnScrollY += this.config.spawnGapPx;
      this.spawnBanana(scrollY, meters, feverActive);
      spawned++;
    }

    // 화면 아래로 떨어진 바나나 제거
    const toKill: Phaser.GameObjects.GameObject[] = [];
    this.group.children.iterate((child) => {
      const item = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if (!item.active) {
        return true;
      }

      const startY = Number(item.getData('startScreenY'));
      const spawnScroll = Number(item.getData('spawnScroll'));

      const y = startY + (scrollY - spawnScroll);
      item.setY(y);

      if (y > height + 80) {
        toKill.push(item);
      }

      return true;
    });
    toKill.forEach((i) => i.destroy());
  }
}

export default Banana;
