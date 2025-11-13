/** @jsxImportSource @emotion/react */
import Toggle from './toggle';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createFeedback } from '@api/feedback-api';
import { updateSound } from '@api/member-api';
import { useSound } from '@context/sound-context';
import { useToken } from '@context/user-context';
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
  const { token } = useToken();
  const { bgm, effect, setBgm, setEffect } = useSound();
  const [contact, setContact] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const handleContact = () => {
    setContact((contact) => !contact);
  };

  const onChangeFeedback = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const submitFeedback = async () => {
    const date = String(new Date().toISOString());

    if (feedback === '') {
      toast.error('피드백 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await createFeedback(token, feedback, date);
      toast.success('피드백 전송 완료 🍌');
      setFeedback('');
      setContact(false);
    } catch (error) {
      console.log(error);
      toast.error(`피드백 전송 실패`);
    }
  };

  const onClickCloseButton = () => {
    setContact((contact) => !contact);
    handleOption();
  };

  const handleBgm = async () => {
    try {
      const response = await updateSound(token, 'BGM', !bgm);
      setBgm((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEffect = async () => {
    try {
      const response = await updateSound(token, 'EFFECT', !effect);
      setEffect((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div css={optionWrapperCss}>
        <div css={optionContentCss}>
          {contact ? (
            <>
              <div css={optionContactAreaCss}>
                <textarea
                  name="contact"
                  value={feedback}
                  onChange={onChangeFeedback}
                  placeholder="의견을 작성해주세요."
                  css={optionTextareaCss}
                ></textarea>
                <img
                  src={images.option_send}
                  alt="옵션_의견전송_버튼"
                  css={optionSendButtonCss}
                  onClick={submitFeedback}
                />
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
                  <Toggle handleToggle={handleEffect} toggle={effect} />
                </li>
                <li css={optionLiCss}>
                  <div css={optionTitleCss}>
                    <img src={images.option_bgm} alt="옵션_배경음악_이미지" css={optionIconCss} />
                    <span css={optionTextCss}>배경음악</span>
                  </div>
                  <Toggle handleToggle={handleBgm} toggle={bgm} />
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
