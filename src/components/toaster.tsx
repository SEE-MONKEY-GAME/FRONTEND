import { Toaster } from 'react-hot-toast';
import { fonts } from '@styles/tokens/fonts';

const Toast = () => {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            marginTop: '8px',
            background: '#2D2D2D',
            color: 'white',
            fontFamily: `${fonts.title}`,
          },
          success: {
            iconTheme: {
              primary: '#28A745',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC3545',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
};

export default Toast;
