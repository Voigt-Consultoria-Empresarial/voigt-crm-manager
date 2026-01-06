import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Prospeccao from "./pages/Prospeccao";
import Clientes from "./pages/Clientes";
import Contratos from "./pages/Contratos";
import Servicos from "./pages/Servicos";
import Equipe from "./pages/Equipe";
import Carteira from "./pages/Carteira";
import Reunioes from "./pages/Reunioes";
import Tarefas from "./pages/Tarefas";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 bg-background">
          <div className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
            <SidebarTrigger />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prospeccao" element={<Prospeccao />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/carteira" element={<Carteira />} />
            <Route path="/reunioes" element={<Reunioes />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/auth" element={<Navigate to="/" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
