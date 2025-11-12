import { type ReactNode, createContext, useContext, useState } from 'react';

interface SoundState {
  bgm: boolean;
  effect: boolean;
  toggleBgm: () => void;
  toggleEffect: () => void;
}

const SoundContext = createContext<SoundState | null>(null);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [bgm, setBgm] = useState(true);
  const [effect, setEffect] = useState(true);

  const toggleBgm = () => {
    setBgm((prev) => !prev);
  };

  const toggleEffect = () => {
    setEffect((prev) => !prev);
  };

  return <SoundContext.Provider value={{ bgm, effect, toggleBgm, toggleEffect }}>{children}</SoundContext.Provider>;
};

/* eslint-disable react-refresh/only-export-components */
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
