/** @jsxImportSource @emotion/react */
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

interface ToggleProps {
  handleToggle: () => void;
  toggle: boolean;
}

const Toggle = ({ handleToggle, toggle }: ToggleProps) => {
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
