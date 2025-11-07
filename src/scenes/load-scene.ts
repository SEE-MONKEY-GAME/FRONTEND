import Phaser from 'phaser';
import { getImage } from '@utils/get-images';

class LoadScene extends Phaser.Scene {
  constructor() {
    super('LoadScene');
  }

  preload() {
    this.load.image('bana', getImage('home', 'bana_sit'));
    this.load.image('platform', getImage('home', 'platform_tree'));
  }
}

export default LoadScene;
