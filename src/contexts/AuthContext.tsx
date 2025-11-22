import React, { createContext, useContext, useState, useEffect } from 'react';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

interface AuthContextType {
  funcionario: Funcionario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário teste fictício
const USUARIO_TESTE: Funcionario = {
  id: 'func-001',
  nome: 'João Silva',
  email: 'joao@voigt.com.br',
  cargo: 'Advogado Sênior'
};

const SENHA_TESTE = '123456';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

  useEffect(() => {
    // Carregar funcionário do localStorage
    const savedFuncionario = localStorage.getItem('auth_funcionario');
    if (savedFuncionario) {
      setFuncionario(JSON.parse(savedFuncionario));
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    if (email === USUARIO_TESTE.email && senha === SENHA_TESTE) {
      setFuncionario(USUARIO_TESTE);
      localStorage.setItem('auth_funcionario', JSON.stringify(USUARIO_TESTE));
      return true;
    }
    return false;
  };

  const logout = () => {
    setFuncionario(null);
    localStorage.removeItem('auth_funcionario');
  };

  return (
    <AuthContext.Provider value={{ 
      funcionario, 
      login, 
      logout, 
      isAuthenticated: !!funcionario 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
