import { Home, Users, FileText, Settings, FileStack, Briefcase, UserCog, FolderKanban, Calendar, ListTodo, Target, UserPlus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import logoVM from "@/assets/logo-vm-3x1-sb.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Prospecção", url: "/prospeccao", icon: FileText },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Contratos", url: "/contratos", icon: FileStack },
  { title: "Serviços", url: "/servicos", icon: Briefcase },
  { title: "Equipe", url: "/equipe", icon: UserCog },
  { title: "Carteira", url: "/carteira", icon: FolderKanban },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Reuniões", url: "/reunioes", icon: Calendar },
  { title: "Tarefas", url: "/tarefas", icon: ListTodo },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { funcionario } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-center">
          <img 
            src={logoVM} 
            alt="VM Gestão Estratégica" 
            className={`transition-all duration-300 ${isCollapsed ? 'h-8' : 'h-10'}`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <NavLink 
                    to={item.url} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && funcionario && (
          <div className="mb-3 pb-3 border-b border-sidebar-border">
            <p className="text-xs font-medium text-sidebar-foreground">{funcionario.nome}</p>
            <p className="text-xs text-sidebar-foreground/60">{funcionario.cargo}</p>
          </div>
        )}
        <a 
          href="https://topstack.com.br?utm_source=vm_gestao_crm&utm_medium=software_branding&utm_campaign=dev_by_topstack"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[10px] text-sidebar-foreground/50 transition-colors hover:text-[#20D4AD] active:text-[#20D4AD] mt-3 ${isCollapsed ? 'hidden' : 'block'}`}
        >
          Tecnologia TOPSTACK
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
