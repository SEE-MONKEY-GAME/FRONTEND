/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import type { ImagesProps } from '@pages/home';
import {
  guideCloseButtonCss,
  guideDirectionButtonCss,
  guideNextButtonCss,
  guideOverlayCss,
  guidePrevButtonCss,
  guideSlideCss,
  guideSlideImageCss,
  guideSlideTextCss,
  guideTabCss,
  guideWrapperCss,
} from '@styles/components/guide.css';
import { getImage } from '@utils/get-images';

interface GuideProps {
  handleGameGuide: () => void;
  images: ImagesProps;
}

const Guide = ({ handleGameGuide, images }: GuideProps) => {
  const [page, setPage] = useState<number>(0);

  const slides = [
    {
      text: '떨어지는 바나를 받아\n하늘로 올라가세요.',
      image: images.guide_1,
    },
    {
      text: '바나나를 모으고\n로켓을 이용하세요.',
      image: images.guide_2,
    },
    {
      text: '고릴라를 피하세요.\n도둑 고릴라는 바나나를 빼앗아요.',
      image: images.guide_3,
    },
  ];

  const onClickPrev = () => {
    setPage((page) => page - 1);
  };

  const onClickNext = () => {
    setPage((page) => page + 1);
  };

  return (
    <>
      <div css={guideWrapperCss}>
        <ul>
          {slides.map((slide, index) => (
            <li key={index} css={guideSlideCss(index === page)}>
              <div>
                <p css={guideSlideTextCss}>{slide.text}</p>
              </div>
              <img src={slide.image} alt={`게임방법 ${index + 1}`} css={guideSlideImageCss} />
            </li>
          ))}
        </ul>
        {page !== 0 && (
          <img
            src={images.prev_guide}
            alt="게임방법_이전_버튼"
            css={[guideDirectionButtonCss, guidePrevButtonCss]}
            onClick={onClickPrev}
          />
        )}
        {page !== 2 && (
          <img
            src={images.next_guide}
            alt="게임방법_다음_버튼"
            css={[guideDirectionButtonCss, guideNextButtonCss]}
            onClick={onClickNext}
          />
        )}
        <img src={images.tab_guide} alt="게임방법_탭" css={guideTabCss} />
        <img src={images.close} alt="게임방법_닫기_버튼" css={guideCloseButtonCss} onClick={handleGameGuide} />
      </div>
      <div css={guideOverlayCss} />
    </>
  );
};

export default Guide;
