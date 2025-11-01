/** @jsxImportSource @emotion/react */
import Toggle from './toggle';
import { useState } from 'react';
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
import { getImage } from '@utils/get-images';

interface OptionProps {
  handleOption: () => void;
}

const Option = ({ handleOption }: OptionProps) => {
  const [contact, setContact] = useState<boolean>(false);

  const tab = getImage('home', 'option_tab');
  const close = getImage('home', 'close_button');
  const option_bgm = getImage('home', 'option_bgm');
  const option_sound = getImage('home', 'option_sound');
  const option_contact = getImage('home', 'option_contact_button');
  const option_send = getImage('home', 'option_send_button');

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
                <img src={option_send} alt="옵션_의견전송_버튼" css={optionSendButtonCss} />
              </div>
            </>
          ) : (
            <>
              <ul css={optionUlCss}>
                <li css={optionLiCss}>
                  <div css={optionTitleCss}>
                    <img src={option_sound} alt="옵션_효과음_이미지" css={optionIconCss} />
                    <span css={optionTextCss}>효과음</span>
                  </div>
                  <Toggle />
                </li>
                <li css={optionLiCss}>
                  <div css={optionTitleCss}>
                    <img src={option_bgm} alt="옵션_배경음악_이미지" css={optionIconCss} />
                    <span css={optionTextCss}>배경음악</span>
                  </div>
                  <Toggle />
                </li>
              </ul>
              <hr css={optionHrCss} />
              <img src={option_contact} alt="옵션_의견작성_버튼" css={optionContactButtonCss} onClick={handleContact} />
            </>
          )}
        </div>
        <img src={tab} alt="옵션_탭" css={optionTabCss} />
        <img src={close} alt="옵션_닫기" css={optionCloseButtonCss} onClick={onClickCloseButton} />
      </div>
      <div css={optionOverlayCss} />
    </>
  );
};

export default Option;
