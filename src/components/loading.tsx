import Canvas from '@canvas/canvas';

interface LoadProps {
  handleLoading: () => void;
}

const Loading = ({ handleLoading }: LoadProps) => {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#99ECEC' }} onClick={handleLoading}>
      <Canvas />
    </div>
  );
};

export default Loading;
