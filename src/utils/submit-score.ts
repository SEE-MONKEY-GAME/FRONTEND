import { submitGameCenterLeaderBoardScore } from '@apps-in-toss/web-framework';

export const submitScore = async (score: number) => {
  try {
    const result = await submitGameCenterLeaderBoardScore({ score: String(score) });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result.statusCode === 'SUCCESS') {
      console.log('점수 제출 성공!');
    } else {
      console.error('점수 제출 실패:', result.statusCode);
    }
  } catch (error) {
    console.error('점수 제출 중 오류가 발생했어요.', error);
  }
};
