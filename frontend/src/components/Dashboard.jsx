import React from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Users, CheckCircle, XCircle, Layers, Calendar, ArrowRight, Activity, Award } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { postulantes, docentes, carreras, getCalculatedGroups, bitacora, calculateOverallAverage, notas } = useMockDB();

  // Get dynamic grouping stats
  const { totalInscritos, cantidadGrupos, grupos } = getCalculatedGroups();

  // Get statistics
  const totalPostulantes = postulantes.length;

  const fullyEnrolled = postulantes.filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO');
  const countFullyEnrolled = fullyEnrolled.length;

  const aprobados = postulantes.filter(p => p.estado_academico === 'APROBADO').length;
  const reprobados = postulantes.filter(p => p.estado_academico === 'REPROBADO').length;
  const pendientesGrades = postulantes.filter(p => p.estado_academico === 'PENDIENTE').length;

  // Calculate subject average for all graded students
  const getSubjectOverallAverage = (subjectId) => {
    const graded = postulantes.filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO');
    if (graded.length === 0) return 0;
    
    let sum = 0;
    let count = 0;
    graded.forEach(p => {
      const studentGrades = notas[p.nro_registro];
      if (studentGrades) {
        // Calculate average for subject
        const percentages = [30, 30, 40]; // default
        let subjSum = 0;
        for (let i = 0; i < 3; i++) {
          subjSum += (studentGrades[subjectId]?.[i] || 0) * (percentages[i] / 100);
        }
        sum += subjSum;
        count++;
      }
    });

    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  };

  const compAvg = getSubjectOverallAverage('COMP');
  const mateAvg = getSubjectOverallAverage('MATE');
  const ingAvg = getSubjectOverallAverage('ING');
  const fisAvg = getSubjectOverallAverage('FIS');

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  // Percentages for donut chart
  const gradedCount = aprobados + reprobados;
  const pctAprobados = gradedCount > 0 ? Math.round((aprobados / gradedCount) * 100) : 0;
  const pctReprobados = gradedCount > 0 ? Math.round((reprobados / gradedCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Panel Administrativo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión académica y proceso de ingreso del curso preuniversitario de la FICCT.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gestión Académica: 2/2026</span>
        </div>
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Inscritos (Iniciaron el registro) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Postulantes</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalPostulantes}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <span>{countFullyEnrolled} Habilitados</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Aprobados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Aprobados</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{aprobados}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nota final ≥ 60 puntos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Reprobados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Reprobados</p>
            <h3 className="text-3xl font-extrabold text-rose-500 dark:text-rose-400">{reprobados}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nota final &lt; 60 puntos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Grupos Habilitados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Grupos Habilitados</p>
            <h3 className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">{cantidadGrupos}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Máx. 70 alumnos c/u
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Careers and Quota capacity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cupos de Carrera FICCT</h4>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold">Admisión en curso</span>
          </div>

          <div className="space-y-6">
            {carreras.map((c, idx) => {
              const cuposLlenos = c.cupos_max - c.cupos_disponibles;
              const fillPct = Math.min(100, Math.round((cuposLlenos / c.cupos_max) * 100));
              
              // Color gradient index helper
              const barColors = [
                'from-blue-600 to-cyan-500',
                'from-indigo-600 to-purple-500',
                'from-violet-600 to-fuchsia-500'
              ];

              return (
                <div key={c.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.nombre}</span>
                      <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-bold">{c.id}</span>
                    </div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {cuposLlenos} / {c.cupos_max} <span className="text-xs text-slate-400 font-light">admitidos</span>
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${barColors[idx % barColors.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{c.cupos_disponibles} cupos libres</span>
                    <span>{fillPct}% de ocupación</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert on career quota redirect rule */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-left text-xs text-amber-700 dark:text-amber-300">
            <span className="font-bold">💡 Regla del Negocio:</span> Cuando los cupos de la primera opción de carrera se agotan, el postulante aprobado es admitido automáticamente en su <span className="underline font-semibold">segunda opción de carrera</span>. Puedes probar esto fácilmente reduciendo o llenando los 5 cupos de ejemplo.
          </div>
        </div>

        {/* Right: Academic Performance Pie Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Rendimiento Académico</h4>

          {gradedCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-400 text-sm">Sin calificaciones registradas.</p>
              <button 
                onClick={() => setActiveTab('examenes')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Registrar notas ahora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              {/* Clean SVG Donut Chart */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer circle track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="3" />
                  
                  {/* Approved segment */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" 
                          strokeDasharray={`${pctAprobados} ${100 - pctAprobados}`} 
                          strokeDashoffset="0" />
                  
                  {/* Reproved segment */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f43f5e" strokeWidth="3" 
                          strokeDasharray={`${pctReprobados} ${100 - pctReprobados}`} 
                          strokeDashoffset={-pctAprobados} />
                </svg>
                
                {/* Center percentages */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{pctAprobados}%</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Aprobados</span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="w-full grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/10">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Aprobados</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{aprobados}</p>
                </div>
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-100/50 dark:border-rose-900/10">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Reprobados</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{reprobados}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Averages by Subject and System Log (Bitácora) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Overall averages by Subject */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Promedios Generales por Materia</h4>
          
          <div className="space-y-4">
            
            {/* Computación */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Computación (INF-110)</span>
                <span className="text-slate-800 dark:text-white font-bold">{compAvg} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${compAvg}%` }} />
              </div>
            </div>

            {/* Matemáticas */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Matemáticas (MAT-101)</span>
                <span className="text-slate-800 dark:text-white font-bold">{mateAvg} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${mateAvg}%` }} />
              </div>
            </div>

            {/* Inglés */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Inglés (LIN-100)</span>
                <span className="text-slate-800 dark:text-white font-bold">{ingAvg} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${ingAvg}%` }} />
              </div>
            </div>

            {/* Física */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Física (FIS-102)</span>
                <span className="text-slate-800 dark:text-white font-bold">{fisAvg} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${fisAvg}%` }} />
              </div>
            </div>

          </div>
        </div>

        {/* Right: Latest logs in Audit trail (Bitácora) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bitácora de Eventos (Auditoría)</h4>
            </div>
            <button 
              onClick={() => setActiveTab('configuracion')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white hover:underline cursor-pointer"
            >
              Ver todo
            </button>
          </div>

          <div className="space-y-4">
            {bitacora.slice(0, 4).map((log) => {
              
              // Color map
              let tagColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
              if (log.modulo === 'AUTENTICACIÓN' || log.modulo === 'SEGURIDAD') {
                tagColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
              } else if (log.modulo === 'PAGOS') {
                tagColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
              } else if (log.modulo === 'REGISTRO') {
                tagColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
              } else if (log.modulo === 'EVALUACIONES') {
                tagColor = 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400';
              }

              return (
                <div key={log.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl text-left space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tagColor}`}>
                      {log.modulo}
                    </span>
                    <span className="text-[10px] text-slate-400 font-light">
                      {formatDate(log.fecha_hora)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.accion}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{log.descripcion}</p>
                  <p className="text-[10px] text-slate-400 font-light">
                    Realizado por: <span className="font-semibold text-slate-500 dark:text-slate-350">{log.usuario}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
