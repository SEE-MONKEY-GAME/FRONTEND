import toast from 'react-hot-toast';
import { share } from '@apps-in-toss/web-framework';

export const shareMessage = async (score: number) => {
  try {
    await share({
      message: `친구의 ${score}m 달성🙊 도전해보시겠어요?\nintoss://banana-jump`,
    });
  } catch (error) {
    toast.error('잠시 후 다시 시도해주세요');
    console.log(error);
  }
};
