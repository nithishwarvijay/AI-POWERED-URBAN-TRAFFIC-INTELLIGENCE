import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem('intelliflow-token');
    const storedUser = localStorage.getItem('intelliflow-user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('intelliflow-token', authToken);
    localStorage.setItem('intelliflow-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('intelliflow-token');
    localStorage.removeItem('intelliflow-user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('intelliflow-user', JSON.stringify(userData));
  };

  const isAuthenticated = !!user && !!token;

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        loading,
        login, 
        logout, 
        updateUser,
        isAuthenticated,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
