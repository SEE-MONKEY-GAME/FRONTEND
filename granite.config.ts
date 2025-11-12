import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'banana-jump',
  brand: {
    displayName: 'banana-jump', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://rqotozcedcavgtcjrcmz.supabase.co/storage/v1/object/public/app/app_icon.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: 'basic',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc -b && vite build',
    },
  },
  webViewProps: {
    type: 'game',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  permissions: [],
  outdir: 'dist',
});
