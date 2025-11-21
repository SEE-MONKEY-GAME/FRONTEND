import toast from 'react-hot-toast';
import { getTossShareLink, share } from '@apps-in-toss/web-framework';

export const shareMessage = async (score: number) => {
  const tossLink = await getTossShareLink('intoss://banana-jump');

  try {
    await share({
      message: `친구의 ${score}m 달성🙊 도전해보시겠어요?\n${tossLink}`,
    });
  } catch (error) {
    toast.error('잠시 후 다시 시도해주세요');
    console.log(error);
  }
};
