import { type ReactNode, createContext, useContext, useState } from 'react';

interface SoundState {
  bgm: boolean;
  effect: boolean;
  setBgm: React.Dispatch<React.SetStateAction<boolean>>;
  setEffect: React.Dispatch<React.SetStateAction<boolean>>;
}

const SoundContext = createContext<SoundState | null>(null);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [bgm, setBgm] = useState(false);
  const [effect, setEffect] = useState(false);

  return <SoundContext.Provider value={{ bgm, effect, setBgm, setEffect }}>{children}</SoundContext.Provider>;
};

/* eslint-disable react-refresh/only-export-components */
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
