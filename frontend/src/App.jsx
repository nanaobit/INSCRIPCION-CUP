import React, { useState, useEffect } from 'react';
import { useMockDB } from './context/MockDBContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Postulantes from './components/Postulantes';
import RequisitosYPagos from './components/RequisitosYPagos';
import Examenes from './components/Examenes';
import GruposDocentes from './components/GruposDocentes';
import ReportesVoz from './components/ReportesVoz';
import Configuracion from './components/Configuracion';

import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  BookOpen, 
  Layers, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  Sun, 
  Moon, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const { currentUser, logout } = useMockDB();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPostulanteReg, setSelectedPostulanteReg] = useState('');
  
  // Theme dark/light state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ficct_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply dark class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ficct_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ficct_theme', 'light');
    }
  }, [darkMode]);

  // If not logged in, show lock screen
  if (!currentUser) {
    return <Login />;
  }

  // Navigation items mapping
  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'postulantes', label: 'Postulantes', icon: Users, roles: ['ADMIN'] },
    { id: 'pagos', label: 'Requisitos y Pagos', icon: FileCheck, roles: ['ADMIN'] },
    { id: 'examenes', label: 'Planilla Exámenes', icon: BookOpen, roles: ['ADMIN', 'DOCENTE'] },
    { id: 'grupos', label: 'Grupos y Docentes', icon: Layers, roles: ['ADMIN'] },
    { id: 'reportes', label: 'Reportes y Voz IA', icon: FileText, roles: ['ADMIN'] },
    { id: 'configuracion', label: 'Bitácora / Ajustes', icon: Settings, roles: ['ADMIN'] }
  ];

  // Filter menu items by user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentUser.rol));

  // Auto fallback for docente to examenes page
  if (currentUser.rol === 'DOCENTE' && activeTab !== 'examenes') {
    setActiveTab('examenes');
  }

  // Tab renderer routing
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'postulantes':
        return (
          <Postulantes 
            setActiveTab={setActiveTab} 
            setSelectedPostulanteReg={setSelectedPostulanteReg} 
          />
        );
      case 'pagos':
        return (
          <RequisitosYPagos 
            selectedPostulanteReg={selectedPostulanteReg} 
            setSelectedPostulanteReg={setSelectedPostulanteReg} 
          />
        );
      case 'examenes':
        return <Examenes />;
      case 'grupos':
        return <GruposDocentes />;
      case 'reportes':
        return <ReportesVoz />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. LEFT SIDEBAR */}
      <aside 
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 flex flex-col justify-between transition-all duration-300 relative z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="space-y-6 pt-6">
          {/* Brand Logo Header */}
          <div className={`flex items-center space-x-3 px-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="text-left leading-tight">
                <span className="font-extrabold text-base tracking-wide dark:text-white">FICCT PreU</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gestión de Ingreso</p>
              </div>
            )}
          </div>

          {/* Nav list */}
          <nav className="space-y-1.5 px-4">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 py-3 px-4 rounded-2xl font-semibold text-sm transition cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10' 
                      : 'text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950/60 hover:text-slate-800 dark:hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions in sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
          
          {/* User profile brief card */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3 text-left">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-extrabold text-xs">
                {currentUser.nombre[0]}
              </div>
              <div className="overflow-hidden leading-tight">
                <p className="font-bold text-xs truncate dark:text-white">{currentUser.nombre} {currentUser.apellido}</p>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold text-slate-500 px-1.5 py-0.2 rounded font-mono uppercase">
                  {currentUser.rol}
                </span>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={logout}
            className={`w-full flex items-center space-x-3 py-3 px-4 rounded-2xl text-rose-500 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKING CANVAS */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-250 dark:border-slate-850 flex items-center justify-between px-8 relative z-25">
          <div className="flex items-center space-x-4">
            {/* Sidebar collapse button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-805 cursor-pointer transition"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Módulo Administrativo</span>
              <span>/</span>
              <span className="text-slate-650 dark:text-slate-250 font-extrabold">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle (Dark/Light) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-805 cursor-pointer transition"
              title="Alternar Tema Claro/Oscuro"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Institution stamp */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-bold font-mono">
              <span className="text-slate-400">U.A.G.R.M.</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-650 dark:text-blue-400">FICCT</span>
            </div>
          </div>
        </header>

        {/* Content body wrapper */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

    </div>
  );
}
