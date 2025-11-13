import { type ReactNode, createContext, useContext, useState } from 'react';

interface UserState {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<UserState | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>('');

  return <UserContext.Provider value={{ token, setToken }}>{children}</UserContext.Provider>;
};

/* eslint-disable react-refresh/only-export-components */
export const useToken = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useToken must be used within a UserProvider');
  }
  return context;
};
