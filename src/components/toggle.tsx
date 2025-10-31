/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import {
  toggleCss,
  toggleInnerCss,
  toggleInnerOffCss,
  toggleInnerOnCss,
  toggleOffCss,
  toggleOnCss,
  toggleTextCss,
  toggleTextOffCss,
  toggleTextOnCss,
} from '@styles/components/toggle.css';

const Toggle = () => {
  const [toggle, setToggle] = useState<boolean>(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  return (
    <>
      <div onClick={handleToggle} css={[toggleCss, toggle ? toggleOnCss : toggleOffCss]}>
        <span css={[toggleTextCss, toggle ? toggleTextOnCss : toggleTextOffCss]}>{toggle ? 'on' : 'off'}</span>
        <div css={[toggleInnerCss, toggle ? toggleInnerOnCss : toggleInnerOffCss]} />
      </div>
    </>
  );
};

export default Toggle;
