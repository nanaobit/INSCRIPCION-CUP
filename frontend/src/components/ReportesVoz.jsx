import React, { useState, useEffect, useRef } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { FileText, Download, Printer, Mic, MicOff, Volume2, Search, ArrowRight, ShieldCheck, Layers, Award, Users, BarChart3 } from 'lucide-react';

export default function ReportesVoz() {
  const { postulantes, docentes, carreras, getCalculatedGroups, notas, calculateOverallAverage, calculateSubjectAverage, asignacionesAcademicas } = useMockDB();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Current report sub-tab
  const [currentReport, setCurrentReport] = useState('general'); 
  // 'general', 'aprobados', 'reprobados', 'promedios', 'grupos', 'docentes', 'materias', 'tops'

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceSupport, setVoiceSupport] = useState(false);
  const [speechSynthesisSupport, setSpeechSynthesisSupport] = useState(false);
  
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition & Synthesis support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-BO'; // Bolivian Spanish
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceText('Escuchando comandos por voz...');
        speakText('Asistente de voz FICCT activo. Escuchando...');
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setVoiceText(`Dijiste: "${text}"`);
        processVoiceCommand(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Error de voz: ', event.error);
        setIsListening(false);
        setVoiceText(`Error: ${event.error}. Intenta de nuevo.`);
      };

      recognitionRef.current = recognition;
    }

    if (window.speechSynthesis) {
      setSpeechSynthesisSupport(true);
    }
  }, []);

  // Speak voice synthesizer helper
  const speakText = (text) => {
    if (window.speechSynthesis) {
      // Cancel ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Spanish
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Voice Command Routing Algorithm
  const processVoiceCommand = (command) => {
    const cmd = command.toLowerCase().trim();

    if (cmd.includes('aprobado') || cmd.includes('aprobados')) {
      setCurrentReport('aprobados');
      const count = postulantes.filter(p => p.estado_academico === 'APROBADO').length;
      speakText(`Mostrando reporte de postulantes aprobados. Hay un total de ${count} estudiantes que pasaron el curso con nota mayor o igual a sesenta puntos.`);
    } 
    else if (cmd.includes('reprobado') || cmd.includes('reprobados')) {
      setCurrentReport('reprobados');
      const count = postulantes.filter(p => p.estado_academico === 'REPROBADO').length;
      speakText(`Mostrando reporte de postulantes reprobados. Se registran ${count} estudiantes reprobados con notas inferiores a sesenta puntos.`);
    } 
    else if (cmd.includes('general') || cmd.includes('todos') || cmd.includes('postulante') || cmd.includes('postulantes')) {
      setCurrentReport('general');
      speakText(`Mostrando la lista general de todos los postulantes registrados en la base de datos de la facultad.`);
    }
    else if (cmd.includes('promedio') || cmd.includes('promedios')) {
      setCurrentReport('promedios');
      speakText(`Mostrando reporte de promedios generales y estadísticas globales del preuniversitario.`);
    }
    else if (cmd.includes('grupo') || cmd.includes('grupos') || cmd.includes('habilitados')) {
      setCurrentReport('grupos');
      const count = getCalculatedGroups().cantidadGrupos;
      speakText(`Mostrando reporte de grupos habilitados. De acuerdo al número total de estudiantes inscritos, se abrieron automáticamente ${count} grupos académicos.`);
    }
    else if (cmd.includes('docente') || cmd.includes('docentes')) {
      setCurrentReport('docentes');
      speakText(`Mostrando listado de asignaciones y docentes por cada grupo y materia.`);
    }
    else if (cmd.includes('materia') || cmd.includes('materias') || cmd.includes('estadística') || cmd.includes('estadísticas')) {
      setCurrentReport('materias');
      speakText(`Mostrando estadísticas de rendimiento promedio detallado por cada una de las materias del curso preuniversitario.`);
    }
    else if (cmd.includes('mejor') || cmd.includes('mejores') || cmd.includes('top') || cmd.includes('mayor aprobados')) {
      setCurrentReport('tops');
      speakText(`Mostrando grupos con mayor cantidad de aprobados y promedios más destacados.`);
    }
    else if (cmd.includes('excel') || cmd.includes('descargar') || cmd.includes('exportar')) {
      speakText(`Iniciando la descarga del reporte en formato excel CSV.`);
      handleExportCSV();
    }
    else if (cmd.includes('imprimir') || cmd.includes('pdf')) {
      speakText(`Preparando vista de impresión. Por favor guarde como PDF o seleccione su impresora.`);
      setTimeout(() => {
        window.print();
      }, 1000);
    }
    else if (cmd.includes('limpiar') || cmd.includes('buscar') || cmd.includes('reiniciar')) {
      setSearchTerm('');
      speakText(`Filtros de búsqueda limpiados.`);
    }
    else {
      speakText(`Comando no reconocido. Puedes decir aprobados, reprobados, grupos, materias, exportar excel o imprimir reporte.`);
    }
  };

  // Helper stats
  const { totalInscritos, cantidadGrupos, grupos } = getCalculatedGroups();

  const getSubjectAverages = (subjectId) => {
    const active = postulantes.filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO');
    if (active.length === 0) return 0;
    
    let sum = 0;
    let max = 0;
    let min = 100;
    let passedCount = 0;

    active.forEach(p => {
      const studentGrades = notas[p.nro_registro];
      if (studentGrades) {
        const percentages = [30, 30, 40];
        let subSum = 0;
        for (let i = 0; i < 3; i++) {
          subSum += (studentGrades[subjectId]?.[i] || 0) * (percentages[i] / 100);
        }
        sum += subSum;
        if (subSum > max) max = subSum;
        if (subSum < min && subSum > 0) min = subSum;
        if (subSum >= 60) passedCount++;
      }
    });

    return {
      promedio: Math.round((sum / active.length) * 10) / 10,
      maximo: Math.round(max * 10) / 10,
      minimo: min === 100 ? 0 : Math.round(min * 10) / 10,
      aprobadosPct: Math.round((passedCount / active.length) * 100)
    };
  };

  const compStats = getSubjectAverages('COMP');
  const mateStats = getSubjectAverages('MATE');
  const ingStats = getSubjectAverages('ING');
  const fisStats = getSubjectAverages('FIS');

  // Algorithm: Groups with highest approval counts
  const getGroupsApprovalRank = () => {
    return grupos.map(g => {
      // Find approvals count inside this group's students list
      const approvedCount = g.estudiantes.filter(s => s.estado_academico === 'APROBADO').length;
      const pct = g.estudiantes.length > 0 ? Math.round((approvedCount / g.estudiantes.length) * 100) : 0;
      
      // Calculate overall average of this group's students
      let sum = 0;
      g.estudiantes.forEach(s => {
        sum += calculateOverallAverage(notas[s.nro_registro]);
      });
      const avg = g.estudiantes.length > 0 ? Math.round((sum / g.estudiantes.length) * 10) / 10 : 0;

      return {
        nombre: g.nombre,
        inscritos: g.cantidad_inscritos,
        aprobados: approvedCount,
        aprobadosPct: pct,
        promedioGrupo: avg
      };
    }).sort((a, b) => b.aprobados - a.aprobados);
  };

  const groupRanks = getGroupsApprovalRank();

  // Export CSV handler
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `reporte_ficct_${currentReport}.csv`;

    if (currentReport === 'general' || currentReport === 'aprobados' || currentReport === 'reprobados') {
      headers = ['Nro Registro', 'CI', 'Nombres', 'Apellidos', 'Carrera Op1', 'Carrera Op2', 'Requisitos', 'Pago', 'Promedio Final', 'Estado Academico', 'Admision'];
      
      let list = postulantes;
      if (currentReport === 'aprobados') list = postulantes.filter(p => p.estado_academico === 'APROBADO');
      else if (currentReport === 'reprobados') list = postulantes.filter(p => p.estado_academico === 'REPROBADO');

      rows = list.map(p => [
        p.nro_registro,
        p.ci,
        p.nombres,
        p.apellidos,
        p.carrera_opcion1,
        p.carrera_opcion2,
        p.estado_requisitos,
        p.estado_pago,
        p.promedio_final,
        p.estado_academico,
        p.estado_admision
      ]);
    } 
    else if (currentReport === 'promedios') {
      headers = ['Nro Registro', 'Nombres', 'Apellidos', 'Computacion', 'Matematicas', 'Ingles', 'Fisica', 'Promedio Final', 'Resultado'];
      rows = postulantes
        .filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO')
        .map(p => {
          const stNotas = notas[p.nro_registro];
          return [
            p.nro_registro,
            p.nombres,
            p.apellidos,
            calculateSubjectAverage(stNotas.COMP, 'COMP'),
            calculateSubjectAverage(stNotas.MATE, 'MATE'),
            calculateSubjectAverage(stNotas.ING, 'ING'),
            calculateSubjectAverage(stNotas.FIS, 'FIS'),
            p.promedio_final,
            p.estado_academico
          ];
        });
    }
    else if (currentReport === 'grupos') {
      headers = ['Nombre Grupo', 'Alumnos Inscritos', 'Capacidad Maxima', 'Cupos Libres', 'Ocupacion'];
      rows = grupos.map(g => [
        g.nombre,
        g.cantidad_inscritos,
        g.cupo_maximo,
        g.cupo_disponible,
        `${Math.round((g.cantidad_inscritos / g.cupo_maximo) * 100)}%`
      ]);
    }
    else if (currentReport === 'docentes') {
      headers = ['Grupo', 'Materia', 'Sigla', 'Docente Asignado', 'Aula', 'Horario'];
      rows = [];
      grupos.forEach(g => {
        const groupSettings = asignacionesAcademicas.filter(a => a.grupo === g.nombre);
        ['COMP', 'MATE', 'ING', 'FIS'].forEach(mId => {
          const mNames = { COMP: 'Computación', MATE: 'Matemáticas', ING: 'Inglés', FIS: 'Física' };
          const mSiglas = { COMP: 'INF-110', MATE: 'MAT-101', ING: 'LIN-100', FIS: 'FIS-102' };
          const setting = groupSettings.find(a => a.materia === mId);
          rows.push([
            g.nombre,
            mNames[mId],
            mSiglas[mId],
            setting?.docente || 'Sin Docente',
            setting?.aula || 'N/A',
            setting?.horario || 'N/A'
          ]);
        });
      });
    }
    else {
      // Default fallback
      headers = ['Reporte', 'Detalles'];
      rows = [['Total Matriculados', totalInscritos], ['Cantidad de Grupos', cantidadGrupos]];
    }

    // Generate CSV content
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100 text-left">
      
      {/* Voice Assistant Panel Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-900/50 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Glowing aura */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 flex-1 max-w-xl">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-900/40 border border-blue-800/40 px-2.5 py-0.5 rounded-md">
              Módulo de IA Integrado
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">Asistente por Comandos de Voz FICCT</h3>
          <p className="text-xs text-blue-200/70 leading-relaxed font-light">
            Haz clic en el micrófono y consulta reportes en tiempo real usando tu voz. Comandos soportados: <span className="font-semibold text-white">"mostrar aprobados"</span>, <span className="font-semibold text-white">"mostrar reprobados"</span>, <span className="font-semibold text-white">"ver grupos"</span>, <span className="font-semibold text-white">"exportar excel"</span> o <span className="font-semibold text-white">"imprimir reporte"</span>.
          </p>
          {voiceText && (
            <p className="p-3 bg-blue-950/50 border border-blue-800/30 rounded-2xl text-xs text-blue-300 font-mono italic flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{voiceText}</span>
            </p>
          )}
        </div>

        {/* Floating Mic Button */}
        {voiceSupport ? (
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg transition-all shrink-0 duration-200 border-4 ${
              isListening 
                ? 'bg-rose-600 border-rose-400 hover:bg-rose-500 scale-105 shadow-rose-500/20' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-indigo-500/50 hover:from-blue-500 hover:to-indigo-500 hover:scale-102 shadow-blue-500/25'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-8 h-8 text-white" />
                <span className="text-[9px] font-bold text-white uppercase mt-1 animate-pulse-soft">Escuchando</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 text-white" />
                <span className="text-[9px] font-bold text-blue-100 uppercase mt-1">Activar Voz</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 shrink-0 max-w-[200px]">
            <p className="font-semibold">Navegador no compatible</p>
            <p className="text-[10px] text-slate-500 mt-1">La Web Speech API no está soportada en tu navegador actual. Recomendamos Google Chrome.</p>
          </div>
        )}

      </div>

      {/* Selector of Reports grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-semibold text-xs text-center">
        {[
          { id: 'general', label: 'Postulantes', icon: Users },
          { id: 'aprobados', label: 'Aprobados', icon: Award },
          { id: 'reprobados', label: 'Reprobados', icon: FileText },
          { id: 'promedios', label: 'Promedios', icon: FileText },
          { id: 'grupos', label: 'Grupos', icon: Layers },
          { id: 'docentes', label: 'Docentes', icon: ShieldCheck },
          { id: 'materias', label: 'Materias', icon: BarChart3 },
          { id: 'tops', label: 'Tops Aprobados', icon: Award }
        ].map(item => {
          const Icon = item.icon;
          const isSel = currentReport === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentReport(item.id)}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                isSel 
                  ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Export Controls & Quick filter search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
        
        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar reporte..."
            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Excel / PDF Actions */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir PDF</span>
          </button>
        </div>

      </div>

      {/* REPORT CONTENT SHEETS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-3xl shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Table Title description */}
        <div className="border-b border-slate-100 dark:border-slate-850 pb-4 text-left">
          <h4 className="text-base font-bold text-slate-800 dark:text-white capitalize">
            Reporte oficial: {currentReport.replace('tops', 'Grupos Destacados')}
          </h4>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">
            Generado automáticamente en el portal del preuniversitario de la FICCT.
          </p>
        </div>

        {/* 1. REPORT GENERAL / APROBADOS / REPROBADOS */}
        {(currentReport === 'general' || currentReport === 'aprobados' || currentReport === 'reprobados') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">Nro Registro</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">CI</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">Postulante</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">1ª / 2ª Opción</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">Requisitos</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">Pago</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Promedio Final</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {postulantes
                  .filter(p => {
                    if (currentReport === 'aprobados') return p.estado_academico === 'APROBADO';
                    if (currentReport === 'reprobados') return p.estado_academico === 'REPROBADO';
                    return true;
                  })
                  .filter(p => `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => {
                    const isPassed = p.estado_academico === 'APROBADO';
                    const paid = p.estado_pago === 'PAGADO';
                    const reqOk = p.estado_requisitos === 'APROBADO';

                    return (
                      <tr key={p.nro_registro} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3.5 font-semibold text-blue-600 dark:text-blue-400">{p.nro_registro}</td>
                        <td className="px-4 py-3.5 font-mono">{p.ci}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-750 dark:text-slate-200">{p.nombres} {p.apellidos}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-500">{p.carrera_opcion1} / {p.carrera_opcion2}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reqOk ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'}`}>
                            {reqOk ? 'OK' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-950 dark:text-slate-600'}`}>
                            {paid ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-sm text-slate-700 dark:text-slate-350">{p.promedio_final}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                          }`}>
                            {p.estado_academico}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REPORT PROMEDIOS GENERALES */}
        {currentReport === 'promedios' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest">Postulante</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Computación</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Matemáticas</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Inglés</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Física</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Promedio Final</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {postulantes
                  .filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO')
                  .filter(p => `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => {
                    const stNotas = notas[p.nro_registro];
                    const compAvg = calculateSubjectAverage(stNotas.COMP, 'COMP');
                    const mateAvg = calculateSubjectAverage(stNotas.MATE, 'MATE');
                    const ingAvg = calculateSubjectAverage(stNotas.ING, 'ING');
                    const fisAvg = calculateSubjectAverage(stNotas.FIS, 'FIS');

                    return (
                      <tr key={p.nro_registro} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-750 dark:text-slate-200">{p.nombres} {p.apellidos}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.nro_registro}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono">{compAvg}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{mateAvg}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{ingAvg}</td>
                        <td className="px-4 py-3.5 text-center font-mono">{fisAvg}</td>
                        <td className="px-4 py-3.5 text-center font-mono font-extrabold text-slate-800 dark:text-slate-200 text-sm">{p.promedio_final}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.estado_academico === 'APROBADO'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                          }`}>
                            {p.estado_academico}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. REPORT GRUPOS HABILITADOS */}
        {currentReport === 'grupos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Grupo</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Alumnos Matriculados</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Cupo Límite</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Cupos Disponibles</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Ocupación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grupos.map(g => (
                  <tr key={g.nombre} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-extrabold text-sm text-slate-850 dark:text-white">{g.nombre}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">{g.cantidad_inscritos}</td>
                    <td className="px-6 py-4 text-center font-mono">{g.cupo_maximo}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-400">{g.cupo_disponible}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold">
                        {Math.round((g.cantidad_inscritos / g.cupo_maximo) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. REPORT DOCENTES POR GRUPO */}
        {currentReport === 'docentes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Grupo</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Materia / Sigla</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Docente Asignado</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Aula</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Horario Programado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grupos.flatMap(g => {
                  const groupSettings = asignacionesAcademicas.filter(a => a.grupo === g.nombre);
                  
                  return ['COMP', 'MATE', 'ING', 'FIS'].map(mId => {
                    const mNames = { COMP: 'Computación', MATE: 'Matemáticas', ING: 'Inglés', FIS: 'Física' };
                    const mSiglas = { COMP: 'INF-110', MATE: 'MAT-101', ING: 'LIN-100', FIS: 'FIS-102' };
                    const setting = groupSettings.find(a => a.materia === mId);

                    return (
                      <tr key={`${g.nombre}-${mId}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="px-6 py-3.5 font-bold text-slate-850 dark:text-white">{g.nombre}</td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">{mNames[mId]}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{mSiglas[mId]}</div>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-blue-650 dark:text-blue-400">
                          {setting?.docente || 'Sin Docente programado'}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{setting?.aula || 'N/A'}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-500">{setting?.horario || 'N/A'}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. REPORT ESTADÍSTICAS POR MATERIA */}
        {currentReport === 'materias' && (
          <div className="space-y-6 text-left">
            <p className="text-xs text-slate-400">Estadísticas agregadas de rendimiento general obtenidas de los alumnos aprobados para cursar la nivelación.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {[
                { name: 'Computación', sigla: 'INF-110', stats: compStats, color: 'from-blue-600 to-cyan-500' },
                { name: 'Matemáticas', sigla: 'MAT-101', stats: mateStats, color: 'from-purple-600 to-indigo-500' },
                { name: 'Inglés', sigla: 'LIN-100', stats: ingStats, color: 'from-indigo-600 to-blue-500' },
                { name: 'Física', sigla: 'FIS-102', stats: fisStats, color: 'from-pink-600 to-rose-500' }
              ].map(sub => (
                <div key={sub.name} className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/20 dark:bg-slate-900/50 space-y-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.sigla}</span>
                    <h5 className="font-extrabold text-base text-slate-800 dark:text-white">{sub.name}</h5>
                  </div>
                  
                  <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Promedio Gral:</span>
                      <span className="text-slate-850 dark:text-white font-extrabold font-mono">{sub.stats.promedio} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nota Máxima:</span>
                      <span className="text-emerald-500 font-extrabold font-mono">{sub.stats.maximo} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nota Mínima:</span>
                      <span className="text-rose-500 font-extrabold font-mono">{sub.stats.minimo} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>% Aprobación:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold font-mono">{sub.stats.aprobadosPct}%</span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* 6. REPORT TOP GRUPOS CON MAYOR APROBADOS */}
        {currentReport === 'tops' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Lugar</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest">Grupo</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Matriculados</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Alumnos Aprobados</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">% de Aprobación</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-center font-mono">Promedio de Grupo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {groupRanks.map((r, idx) => (
                  <tr key={r.nombre} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-extrabold text-blue-650 dark:text-blue-400 text-sm">#{idx + 1}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-850 dark:text-white text-sm">{r.nombre}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-400">{r.inscritos}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-emerald-500">{r.aprobados}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold">
                        {r.aprobadosPct}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{r.promedioGrupo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
