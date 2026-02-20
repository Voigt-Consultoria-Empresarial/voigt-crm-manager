import React, { createContext, useContext, useState, useEffect } from 'react';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  isSupervisor: boolean;
}

interface AuthContextType {
  funcionario: Funcionario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários teste fictícios
const USUARIOS_TESTE: Record<string, { funcionario: Funcionario; senha: string }> = {
  'joao@vmgestao.com.br': {
    funcionario: {
      id: 'func-001',
      nome: 'João Silva',
      email: 'joao@vmgestao.com.br',
      cargo: 'Advogado Sênior',
      isSupervisor: true,
    },
    senha: '123456',
  },
  'maria@vmgestao.com.br': {
    funcionario: {
      id: 'func-002',
      nome: 'Maria Santos',
      email: 'maria@vmgestao.com.br',
      cargo: 'Advogada Tributarista',
      isSupervisor: false,
    },
    senha: '123456',
  },
};

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
    const usuario = USUARIOS_TESTE[email];
    if (usuario && usuario.senha === senha) {
      setFuncionario(usuario.funcionario);
      localStorage.setItem('auth_funcionario', JSON.stringify(usuario.funcionario));
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
