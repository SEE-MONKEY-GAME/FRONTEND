import Phaser from 'phaser';

export function setCoverBackground(scene: Phaser.Scene, key: string) {
  const { width, height } = scene.scale;
  const bg = scene.add.image(width / 2, height / 2, key).setOrigin(0.5);

  const texture = scene.textures.get(key).getSourceImage() as HTMLImageElement;
  const imgWidth = texture.width;
  const imgHeight = texture.height;

  const scaleX = width / imgWidth;
  const scaleY = height / imgHeight;
  const scale = Math.max(scaleX, scaleY);

  bg.setScale(scale);
  bg.setDepth(-1);

  return bg;
}
