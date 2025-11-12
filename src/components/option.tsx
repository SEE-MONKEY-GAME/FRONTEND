/** @jsxImportSource @emotion/react */
import Toggle from './toggle';
import { useState } from 'react';
import { useSound } from '@context/sound-context';
import type { ImagesProps } from '@pages/home';
import {
  optionCloseButtonCss,
  optionContactAreaCss,
  optionContactButtonCss,
  optionContentCss,
  optionHrCss,
  optionIconCss,
  optionLiCss,
  optionOverlayCss,
  optionSendButtonCss,
  optionTabCss,
  optionTextCss,
  optionTextareaCss,
  optionTitleCss,
  optionUlCss,
  optionWrapperCss,
} from '@styles/components/option.css';

interface OptionProps {
  handleOption: () => void;
  images: ImagesProps;
}

const Option = ({ handleOption, images }: OptionProps) => {
  const { bgm, effect, toggleBgm, toggleEffect } = useSound();
  const [contact, setContact] = useState<boolean>(false);

  const handleContact = () => {
    setContact((contact) => !contact);
  };

  const onClickCloseButton = () => {
    setContact((contact) => !contact);
    handleOption();
  };

  return (
    <>
      <div css={optionWrapperCss}>
        <div css={optionContentCss}>
          {contact ? (
            <>
              <div css={optionContactAreaCss}>
                <textarea name="contact" placeholder="의견을 작성해주세요." css={optionTextareaCss}></textarea>
                <img src={images.option_send} alt="옵션_의견전송_버튼" css={optionSendButtonCss} />
              </div>
            </>
          ) : (
            <>
              <ul css={optionUlCss}>
                <li css={optionLiCss}>
                  <div css={optionTitleCss}>
                    <img src={images.option_sound} alt="옵션_효과음_이미지" css={optionIconCss} />
                    <span css={optionTextCss}>효과음</span>
                  </div>
                  <Toggle handleToggle={() => toggleEffect()} toggle={effect} />
                </li>
                <li css={optionLiCss}>
                  <div css={optionTitleCss}>
                    <img src={images.option_bgm} alt="옵션_배경음악_이미지" css={optionIconCss} />
                    <span css={optionTextCss}>배경음악</span>
                  </div>
                  <Toggle handleToggle={() => toggleBgm()} toggle={bgm} />
                </li>
              </ul>
              <hr css={optionHrCss} />
              <img
                src={images.option_contact}
                alt="옵션_의견작성_버튼"
                css={optionContactButtonCss}
                onClick={handleContact}
              />
            </>
          )}
        </div>
        <img src={images.tab_option} alt="옵션_탭" css={optionTabCss} />
        <img src={images.close} alt="옵션_닫기" css={optionCloseButtonCss} onClick={onClickCloseButton} />
      </div>
      <div css={optionOverlayCss} />
    </>
  );
};

export default Option;
