import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "customer" | "carrier";

interface User {
  email: string;
  name: string;
  company?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: User | null;
  login: (role: UserRole, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  role: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = (newRole: UserRole, userData: User) => {
    setIsAuthenticated(true);
    setRole(newRole);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
