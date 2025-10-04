import { theme } from '@styles/tokens';
import { setCoverBackground } from '@utils/setCoverBackground';
import Phaser from 'phaser';

class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  preload() {
    // 임시 로드 이미지, 모든 이미지 파일은 LoadingScene에서 preload 되어야 함
    this.load.image('background', 'src/assets/background/home.png');
    this.load.image('banaSit', 'src/assets/character/bana-sit.png');
    this.load.image('gameStart', 'src/assets/components/game-start.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 배경
    setCoverBackground(this, 'background');

    // 캐릭터
    const character = this.add.image(0, 0, 'banaSit');
    character.setScale(0.3);
    character.setOrigin(0.5, 1);
    character.setPosition(width / 2, height - 205);

    // 게임 시작 버튼
    const gameStart = this.add.image(0, 0, 'gameStart');
    gameStart.setScale(0.9);
    gameStart.setOrigin(0.5, 1);
    gameStart.setPosition(width / 2, height - 80);

    // 코인
    const coin = this.add.text(0, 0, '12,345', {
      fontFamily: `${theme.fonts.title}`,
      fontSize: 16,
      color: '#222222',
    });

    coin.setResolution(4);
    coin.setPosition(30, 50);

    // 내 기록
    const title = this.add.text(0, 0, '최고 기록', {
      fontFamily: `${theme.fonts.title}`,
      fontSize: 16,
      color: '#FFFFFF',
    });

    title.setResolution(4);
    title.setOrigin(0.5, 0.5);
    title.setPosition(width / 2, 90);

    const score = this.add.text(0, 0, '42,195 m', {
      fontFamily: `${theme.fonts.title}`,
      fontSize: 24,
      color: '#FFFFFF',
      stroke: '#9c5712',
      strokeThickness: 2,
    });

    score.setResolution(4);
    score.setOrigin(0.5, 0.5);
    score.setPosition(width / 2, 120);

    // 기타 버튼
    const sideButtonPadding = 50; // 위아래 버튼 간 간격
    const sideButtonOffsetX = 40; // 좌우 위치
    const sideButtonStartY = 150; // 상단 버튼 위치 조정

    for (let i = 0; i < 4; i++) {
      const leftBtn = this.add.dom(sideButtonOffsetX, sideButtonStartY + i * (32 + sideButtonPadding)).createFromHTML(`
        <button style="
          width: 32px;
          height: 32px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
        ">${i + 1}</button>
      `);

      leftBtn.setOrigin(0.5, 0.5);
    }
    const rightBtn = this.add.dom(width - sideButtonOffsetX, sideButtonStartY).createFromHTML(`
      <button style="
        width: 32px;
        height: 32px;
        font-size: 16px;
        border-radius: 8px;
        cursor: pointer;
      ">5</button>
    `);

    rightBtn.setOrigin(0.5, 0.5);
  }
}

export default HomeScene;
