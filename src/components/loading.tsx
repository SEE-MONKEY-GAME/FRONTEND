import Canvas from '@canvas/canvas';

interface LoadProps {
  handleLoading: () => void;
}

const Loading = ({ handleLoading }: LoadProps) => {
  return (
    <div
      style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #93C47E, #16592D)' }}
      onClick={handleLoading}
    >
      <Canvas />
    </div>
  );
};

export default Loading;
