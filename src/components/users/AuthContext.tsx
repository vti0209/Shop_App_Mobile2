import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../../database/types';
import { getUserById } from '../../database/projectDb';

interface AuthContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) {
      return;
    }

    const updated = await getUserById(currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshUser().catch((error: unknown) => {
      console.error('Lỗi làm mới thông tin người dùng:', error);
    });
  }, [refreshUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return context;
};
