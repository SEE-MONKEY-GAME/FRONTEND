import { isMinVersionSupported, openGameCenterLeaderboard } from '@apps-in-toss/web-framework';

export const openRank = () => {
  const isSupported = isMinVersionSupported({
    android: '5.221.0',
    ios: '5.221.0',
  });

  if (!isSupported) {
    return;
  }

  openGameCenterLeaderboard();
};
