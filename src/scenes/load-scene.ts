import Phaser from 'phaser';
import { getGif, getImage } from '@utils/get-images';
import { getBGMs, getEffects } from '@utils/get-sounds';

class LoadScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Image;
  private bana!: Phaser.GameObjects.Image;
  private inner!: Phaser.GameObjects.Image;
  private outer!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Image;
  private maskGraphics!: Phaser.GameObjects.Graphics;
  private mask!: Phaser.Display.Masks.GeometryMask;
  private reactImages: Record<string, string> = {};

  constructor() {
    super('LoadScene');
  }

  preload() {
    this.load.image('load_background', getImage('loading', 'loading_background'));
    this.load.image('load_title', getImage('loading', 'title'));
    this.load.image('load_bana', getImage('loading', 'loading_bana'));
    this.load.image('load_inner', getImage('loading', 'loading_inner'));
    this.load.image('load_outer', getImage('loading', 'loading_outer'));
    this.load.image('load_text', getImage('loading', 'loading_text'));
    this.load.image('load_touch', getImage('loading', 'loading_touch'));
  }

  create() {
    const { width, height } = this.cameras.main;

    this.background = this.add.image(width / 2, height / 2, 'load_background').setDisplaySize(width, height);
    this.title = this.add
      .image(0, 0, 'load_title')
      .setScale((width - 60) / this.textures.get('load_title').getSourceImage().width)
      .setOrigin(0.5, 0)
      .setPosition(width / 2, 50);
    this.bana = this.add
      .image(width / 2, height / 2, 'load_bana')
      .setScale((width - 72) / this.textures.get('load_bana').getSourceImage().width)
      .setOrigin(0.5, 0.5)
      .setPosition(width / 2, height / 2 + 40);
    this.inner = this.add
      .image(width / 2, height / 2, 'load_inner')
      .setScale((width - 280) / this.textures.get('load_inner').getSourceImage().width)
      .setOrigin(0.5, 1)
      .setPosition(width / 2, height - 80);
    this.outer = this.add
      .image(width / 2, height / 2, 'load_outer')
      .setScale((width - 280) / this.textures.get('load_outer').getSourceImage().width)
      .setOrigin(0.5, 1)
      .setPosition(width / 2, height - 80);
    this.text = this.add
      .image(width / 2, height / 2, 'load_text')
      .setScale(1.1)
      .setOrigin(0.5, 1)
      .setPosition(width / 2, height - 50);

    this.maskGraphics = this.add.graphics();
    this.mask = this.maskGraphics.createGeometryMask();

    this.load.on('progress', (value: number) => this.updateLoadingBar(value));
    this.load.once('complete', () => {
      (window as any)['PRELOADED_IMAGES'] = { ...this.reactImages };

      window.dispatchEvent(
        new CustomEvent('images:loaded', {
          detail: { ...this.reactImages },
        }),
      );

      this.inner.destroy();
      this.outer.destroy();
      this.text.destroy();

      this.add
        .image(width / 2, height / 2, 'load_touch')
        .setScale(0.5)
        .setOrigin(0.5)
        .setPosition(width / 2, height - 80)
        .setAlpha(1);

      const touch = this.add
        .rectangle(0, 0, width, height, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      touch.on('pointerup', () => {
        this.scene.start('HomeScene');
      });
    });

    this.loadAssets();
    this.load.start();
  }

  private updateLoadingBar(progress: number) {
    if (!this.outer) {
      return;
    }

    const { width, height } = this.cameras.main;
    const texture = this.textures.get('load_outer').getSourceImage();
    const scale = (width - 280) / texture.width;

    this.outer.setScale(scale);
    this.outer.setOrigin(0.5, 1);
    this.outer.setPosition(width / 2, height - 80);

    const textureWidth = texture.width;
    const textureHeight = texture.height;
    const visibleWidth = textureWidth * progress;

    this.outer.setCrop(0, 0, visibleWidth, textureHeight);
  }

  private loadAssets() {
    // bgm
    this.load.audio('home_bgm', getBGMs('home'));
    this.load.audio('game_bgm', getBGMs('game'));
    this.load.audio('fever_time_bgm', getBGMs('fever_time'));
    this.load.audio('button_main_sound', getBGMs('button_main'));
    this.load.audio('button_sub_sound', getBGMs('button_sub'));
    this.load.audio('daily_reward_sound', getBGMs('daily_reward'));
    this.load.audio('rockt_boost_1_sound', getBGMs('rocket_boost_1'));
    this.load.audio('rockt_boost_2_sound', getBGMs('rocket_boost_2'));

    this.load.audio('banana_1_sound', getEffects('banana_1'));
    this.load.audio('banana_2_sound', getEffects('banana_2'));
    this.load.audio('banana_3_sound', getEffects('banana_3'));
    this.load.audio('hit_sound', getEffects('hit'));
    this.load.audio('jump_sound', getEffects('jump'));
    this.load.audio('count_down_sound', getEffects('count_down'));

    // home
    this.load.image('bana', getImage('home', 'bana_sit'));
    this.load.image('bana_SCARF-001', getImage('home', 'bana_sit_SCARF-001'));
    this.load.image('platform', getImage('home', 'platform_tree'));

    this.reactImages.platform_tree = getImage('home', 'platform_tree');
    this.load.image('platform', this.reactImages.platform_tree);
    this.reactImages.home_bg = getImage('home', 'background');
    this.load.image('home_bg', this.reactImages.home_bg);
    this.reactImages.leaf_left = getImage('home', 'leaf_left');
    this.load.image('leaf_left', this.reactImages.leaf_left);
    this.reactImages.leaf_right = getImage('home', 'leaf_right');
    this.load.image('leaf_right', this.reactImages.leaf_right);
    this.reactImages.help = getImage('home', 'icon_help');
    this.load.image('help', this.reactImages.help);
    this.reactImages.check = getImage('home', 'icon_check');
    this.load.image('check', this.reactImages.check);
    this.reactImages.rank = getImage('home', 'icon_ranking');
    this.load.image('rank', this.reactImages.rank);
    this.reactImages.shop = getImage('home', 'icon_shop');
    this.load.image('shop', this.reactImages.shop);
    this.reactImages.etc = getImage('home', 'icon_option');
    this.load.image('etc', this.reactImages.etc);
    this.reactImages.gameStart = getImage('home', 'button_game_start');
    this.load.image('gameStart', this.reactImages.gameStart);
    this.reactImages.close = getImage('home', 'close_button');
    this.load.image('close', this.reactImages.close);

    this.reactImages.tab_option = getImage('home', 'option_tab');
    this.load.image('tab_option', this.reactImages.tab_option);
    this.reactImages.option_bgm = getImage('home', 'option_bgm');
    this.load.image('option_bgm', this.reactImages.option_bgm);
    this.reactImages.option_sound = getImage('home', 'option_sound');
    this.load.image('option_sound', this.reactImages.option_sound);
    this.reactImages.option_contact = getImage('home', 'option_contact_button');
    this.load.image('option_contact', this.reactImages.option_contact);
    this.reactImages.option_send = getImage('home', 'option_send_button');
    this.load.image('option_send', this.reactImages.option_send);

    this.reactImages.tab_guide = getImage('home', 'guide_tab');
    this.load.image('tab_guide', this.reactImages.tab_guide);
    this.reactImages.guide_1 = getImage('home', 'guide_pic_1');
    this.load.image('guide_1', this.reactImages.guide_1);
    this.reactImages.guide_2 = getImage('home', 'guide_pic_2');
    this.load.image('guide_2', this.reactImages.guide_2);
    this.reactImages.guide_3 = getImage('home', 'guide_pic_3');
    this.load.image('guide_3', this.reactImages.guide_3);
    this.reactImages.prev_guide = getImage('home', 'guide_left');
    this.load.image('prev_guide', this.reactImages.prev_guide);
    this.reactImages.next_guide = getImage('home', 'guide_right');
    this.load.image('next_guide', this.reactImages.next_guide);

    this.reactImages.check_close = getImage('home', 'check_close_button');
    this.load.image('check_close', this.reactImages.check_close);
    this.reactImages.shine = getGif('home', 'shine');
    this.load.image('shine', this.reactImages.shine);
    this.reactImages.tab_check = getImage('home', 'check_tab');
    this.load.image('tab_check', this.reactImages.tab_check);
    ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].forEach((day) => {
      const key = `check_${day}`;
      this.reactImages[key] = getImage('home', `check_${day}`);
      this.load.image(key, this.reactImages[key]);
    });
    ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].forEach((day) => {
      const key = `check_${day}_lock`;
      this.reactImages[key] = getImage('home', `check_${day}_lock`);
      this.load.image(key, this.reactImages[key]);
    });
    ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].forEach((day) => {
      const key = `check_${day}_done`;
      this.reactImages[key] = getImage('home', `check_${day}_done`);
      this.load.image(key, this.reactImages[key]);
    });
    ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].forEach((day) => {
      const key = `check_${day}_gift`;
      this.reactImages[key] = getImage('home', `check_${day}_gift`);
      this.load.image(key, this.reactImages[key]);
    });

    this.reactImages.shop_frame = getImage('shop', 'shop_frame');
    this.load.image('shop_frame', this.reactImages.shop_frame);
    this.reactImages.shop_box = getImage('shop', 'shop_box');
    this.load.image('shop_box', this.reactImages.shop_box);
    this.reactImages.shop_tab_1 = getImage('shop', 'shop_tab_1');
    this.load.image('shop_tab_1', this.reactImages.shop_tab_1);
    this.reactImages.shop_tab_2 = getImage('shop', 'shop_tab_2');
    this.load.image('shop_tab_2', this.reactImages.shop_tab_2);
    this.reactImages.shop_container = getImage('shop', 'shop_container');
    this.load.image('shop_container', this.reactImages.shop_container);
    this.reactImages.shop_buy = getImage('shop', 'shop_buy');
    this.load.image('shop_buy', this.reactImages.shop_buy);
    this.reactImages.shop_notbuy = getImage('shop', 'shop_notbuy');
    this.load.image('shop_notbuy', this.reactImages.shop_notbuy);
    this.reactImages.shop_use = getImage('shop', 'shop_use');
    this.load.image('shop_use', this.reactImages.shop_use);
    this.reactImages.shop_notuse = getImage('shop', 'shop_notuse');
    this.load.image('shop_notuse', this.reactImages.shop_notuse);
    this.reactImages.shop_minus = getImage('shop', 'shop_minus');
    this.load.image('shop_minus', this.reactImages.shop_minus);
    this.reactImages.shop_plus = getImage('shop', 'shop_plus');
    this.load.image('shop_plus', this.reactImages.shop_plus);
    this.reactImages.shop_price = getImage('shop', 'shop_price');
    this.load.image('shop_price', this.reactImages.shop_price);
    this.reactImages.shop_coin = getImage('shop', 'shop_coin');
    this.load.image('shop_coin', this.reactImages.shop_coin);

    this.reactImages['ITEM-001'] = getImage('shop', 'ITEM-001');
    this.load.image('ITEM-001', this.reactImages['ITEM-001']);
    this.reactImages['ITEM-002'] = getImage('shop', 'ITEM-002');
    this.load.image('ITEM-002', this.reactImages['ITEM-002']);
    this.reactImages['SCARF-001'] = getImage('shop', 'SCARF-001');
    this.load.image('SCARF-001', this.reactImages['SCARF-001']);

    // game
    this.reactImages['empty_guage_bar'] = getImage('game', 'empty_guage_bar');
    this.load.image('empty_guage_bar', this.reactImages['empty_guage_bar']);
    this.reactImages['full_guage_bar'] = getImage('game', 'full_guage_bar');
    this.load.image('full_guage_bar', this.reactImages['full_guage_bar']);
    this.reactImages['coin_count'] = getImage('game', 'coin_count');
    this.load.image('coin_count', this.reactImages['coin_count']);
    this.reactImages['home'] = getImage('game', 'home');
    this.load.image('home', this.reactImages['home']);
    this.reactImages['retry'] = getImage('game', 'retry');
    this.load.image('retry', this.reactImages['retry']);
    this.reactImages['share'] = getImage('game', 'share');
    this.load.image('share', this.reactImages['share']);
    this.reactImages['onecoin'] = getImage('game', 'onecoin');
    this.load.image('onecoin', this.reactImages['onecoin']);
    this.reactImages['gameover-tab'] = getImage('game', 'gameover-tab');
    this.load.image('gameover-tab', this.reactImages['gameover-tab']);

    this.load.image('bar', getImage('game', 'bar'));
    this.load.image('num3', getImage('game', '3'));
    this.load.image('num2', getImage('game', '2'));
    this.load.image('num1', getImage('game', '1'));
    this.load.image('character', getImage('game', 'character'));
    this.load.image('sit', getImage('game', 'sit-monkey'));
    this.load.image('jump', getImage('game', 'jump-monkey'));
    this.load.image('ljump', getImage('game', 'ljump-monkey'));
    this.load.image('rjump', getImage('game', 'rjump-monkey'));
    this.load.image('jump_item', getImage('game', 'jump-monkey-item'));
    this.load.image('ljump_item', getImage('game', 'ljump-monkey-item'));
    this.load.image('rjump_item', getImage('game', 'rjump-monkey-item'));
    this.load.image('hit_block', getImage('game', 'hit-blockgoril'));

    this.load.image('SCARF-001-character', getImage('game', 'SCARF-001-character'));
    this.load.image('SCARF-001-sit', getImage('game', 'SCARF-001-sit-monkey'));
    this.load.image('SCARF-001-jump', getImage('game', 'SCARF-001-jump-monkey'));
    this.load.image('SCARF-001-ljump', getImage('game', 'SCARF-001-ljump-monkey'));
    this.load.image('SCARF-001-rjump', getImage('game', 'SCARF-001-rjump-monkey'));
    this.load.image('SCARF-001-jump_item', getImage('game', 'SCARF-001-jump-monkey-item'));
    this.load.image('SCARF-001-ljump_item', getImage('game', 'SCARF-001-ljump-monkey-item'));
    this.load.image('SCARF-001-jump_item', getImage('game', 'SCARF-001-rjump-monkey-item'));
    this.load.image('SCARF-001-hit_block', getImage('game', 'SCARF-001-hit-blockgoril'));

    this.load.image('flife', getImage('game', 'life_full'));
    this.load.image('elife', getImage('game', 'life_empty'));
    this.load.image('nbana', getImage('game', 'banana_normal'));
    this.load.image('bbana', getImage('game', 'banana_bunch'));
    this.load.image('gbana', getImage('game', 'banana_gold'));
    this.load.image('rocket', getImage('game', 'rocket'));
    this.load.image('fevertime_title', getImage('game', 'fevertime_title'));

    this.load.image('fullguage', getImage('game', 'full_guage_bar'));
    this.load.image('emptyguage', getImage('game', 'empty_guage_bar'));

    this.load.spritesheet('gori_block_sheet', getImage('game', 'gorilla_block_sheet'), {
      frameWidth: 300,
      frameHeight: 300,
    });
    this.load.spritesheet('gori_thief_sheet', getImage('game', 'gorilla_thief_sheet'), {
      frameWidth: 300,
      frameHeight: 300,
    });
    this.load.spritesheet('rocketmotion', getImage('game', 'rocketmotion'), {
      frameWidth: 502,
      frameHeight: 883,
    });

    this.load.image('bg_jungle_start', getImage('game', 'bg_jungle_start'));
    this.load.image('bg_jungle_loop', getImage('game', 'bg_jungle_loop'));
    this.load.image('bg_sky_start', getImage('game', 'bg_sky_start'));
    this.load.image('bg_sky_loop', getImage('game', 'bg_sky_loop'));
    this.load.image('bg_space_start', getImage('game', 'bg_space_start'));
    this.load.image('bg_space_loop', getImage('game', 'bg_space_loop'));
    this.load.image('bg_fever', getImage('game', 'bg_fever'));
    this.load.spritesheet('hit_thief', getImage('game', 'hit-thiefgoril'), {
      frameWidth: 630,
      frameHeight: 630,
    });
  }
}

export default LoadScene;
