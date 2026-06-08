import React, { useState } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Activity, RefreshCw, Trash2, Search, Filter, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Configuracion() {
  const { bitacora } = useMockDB();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  // Reset database handler
  const handleResetDB = () => {
    if (window.confirm('¿Está seguro de restablecer por completo la base de datos de simulación? Se borrarán todos los cambios locales y se restaurará el estado original de fábrica.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Clear log trace
  const handleClearLogs = () => {
    if (window.confirm('¿Está seguro de purgar la bitácora de eventos del sistema? Esta acción limpiará todo el historial de auditoría local.')) {
      localStorage.removeItem('ficct_bitacora');
      window.location.reload();
    }
  };

  // Filter logs list
  const filteredLogs = bitacora.filter(log => {
    const searchMatch = log.accion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    const moduleMatch = !moduleFilter || log.modulo === moduleFilter;

    return searchMatch && moduleMatch;
  });

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-slate-800 dark:text-slate-100 text-left">
      
      {/* Settings Options (Left Pane) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-6 h-fit">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configuración del Sistema</h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Herramientas de mantenimiento para el motor de datos local.</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-light">
            Este sistema web se ejecuta de manera local en tu navegador. Todos los registros de postulantes, calificaciones de exámenes, pagos en pasarela mock, asignación académica de docentes e historial de bitácora se persisten automáticamente en el almacenamiento local del navegador (<span className="font-mono font-bold">localStorage</span>).
          </p>

          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-150/40 dark:border-blue-900/20 rounded-2xl text-xs space-y-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-450 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Integridad de Auditoría
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Cualquier cambio realizado en la base de datos registra de forma automatizada un asiento con el ID del usuario, fecha/hora, tabla afectada e ID del registro para cumplir los requisitos de auditoría de Sistemas 1.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col">
          <button
            onClick={handleResetDB}
            className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-md cursor-pointer transition active:scale-98 text-xs"
          >
            <RefreshCw className="w-4 h-4 animate-spin-hover" />
            <span>Restablecer Todo de Fábrica</span>
          </button>
          
          <button
            onClick={handleClearLogs}
            className="w-full flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-550 dark:text-slate-300 font-bold py-3 rounded-2xl cursor-pointer transition active:scale-98 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purgar Historial de Bitácora</span>
          </button>
        </div>
      </div>

      {/* Bitacora View (Right Pane) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col h-[650px]">
        
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-650 dark:text-blue-400" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Registro de Auditoría (Bitácora)</h4>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar bitácora..."
                className="w-full sm:w-44 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            
            {/* Module filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            >
              <option value="">Módulos</option>
              <option value="AUTENTICACIÓN">Seguridad</option>
              <option value="REGISTRO">Registro</option>
              <option value="PAGOS">Pagos</option>
              <option value="EVALUACIONES">Evaluación</option>
              <option value="CONFIGURACIÓN">Ajustes</option>
            </select>
          </div>
        </div>

        {/* Audit List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300" />
              <p className="text-slate-400 text-sm font-semibold">No se encontraron logs de auditoría.</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              
              // Badge color mapping
              let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
              if (log.modulo === 'AUTENTICACIÓN' || log.modulo === 'SEGURIDAD') {
                badgeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455';
              } else if (log.modulo === 'PAGOS') {
                badgeColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
              } else if (log.modulo === 'REGISTRO') {
                badgeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
              } else if (log.modulo === 'EVALUACIONES') {
                badgeColor = 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400';
              } else if (log.modulo === 'ASIGNACIÓN ACADÉMICA') {
                badgeColor = 'bg-violet-50 text-violet-650 dark:bg-violet-950/20 dark:text-violet-400';
              }

              return (
                <div key={log.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col space-y-2 hover:border-slate-200 dark:hover:border-slate-750 transition text-xs font-semibold">
                  
                  {/* Category and timestamp */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${badgeColor}`}>
                      {log.modulo}
                    </span>
                    <span className="text-slate-400 font-light font-mono">
                      {formatDate(log.fecha_hora)}
                    </span>
                  </div>

                  {/* Log core details */}
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{log.accion}</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{log.descripcion}</p>
                  </div>

                  {/* Impact reference */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-wrap justify-between text-[10px] text-slate-400">
                    <p>Usuario: <span className="font-bold text-slate-550 dark:text-slate-350">{log.usuario}</span></p>
                    {log.registro_affected || log.registro_afectado ? (
                      <p>Afectado: <span className="font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1 py-0.2 rounded font-bold">{log.registro_afectado || log.registro_affected}</span></p>
                    ) : null}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
