import { 
  IoHome,
  IoSettings,
  IoCube,
  IoCall,
  IoAnalytics,
  IoCalendar,
  IoStatsChart,
  IoPieChart
} from "react-icons/io5";

// Configuração centralizada de rotas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PEDIDOS_RETIDOS: '/pedidos-retidos',
  LISTA_TELEFONES: '/lista-telefones',
  REPORTS: '/reports',
  SLA: '/sla',
  ANALISE: '/analise',
  D1: '/d1',
  CONFIGURACOES: '/configuracoes'
}

// Configuração do menu principal - SIMPLES SEM ACCORDION
export const MAIN_MENU_ITEMS = [
  {
    path: ROUTES.HOME,
    icon: IoHome,
    label: 'Home',
    component: 'Home',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
  },
  {
    path: ROUTES.PEDIDOS_RETIDOS,
    icon: IoCube,
    label: 'Sem movimentação',
    component: 'PedidosRetidos',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
  },
  {
    path: ROUTES.D1,
    icon: IoCalendar,
    label: ['Sem movimentação', 'relatorio robusto 1 mes +'],
    component: 'D1',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
  },
  {
    path: ROUTES.SLA,
    icon: IoAnalytics,
    label: 'SLA',
    component: 'SLA',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
  },
  {
    path: ROUTES.REPORTS,
    icon: IoStatsChart,
    label: 'Relatórios',
    component: 'Reports',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    path: ROUTES.ANALISE,
    icon: IoPieChart,
    label: 'Análise',
    component: 'Analise',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    path: ROUTES.LISTA_TELEFONES,
    icon: IoCall,
    label: 'Lista de Telefones',
    component: 'ListaTelefones',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
  },
  {
    path: ROUTES.CONFIGURACOES,
    icon: IoSettings,
    label: 'Configurações',
    component: 'Configuracoes',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
  }
]

// Todas as rotas em um array para facilitar iteração
export const ALL_ROUTES = MAIN_MENU_ITEMS

// Função para obter configuração de rota por path
export const getRouteConfig = (pathname) => {
  return ALL_ROUTES.find(route => route.path === pathname)
}