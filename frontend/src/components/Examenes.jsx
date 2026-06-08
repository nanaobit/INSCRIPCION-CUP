import React, { useState } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { BookOpen, Settings, Save, AlertCircle, CheckCircle, Edit, Star, Award, ShieldAlert } from 'lucide-react';

export default function Examenes() {
  const { 
    currentUser, 
    postulantes, 
    notas, 
    carreras, 
    evalConfig, 
    updateNotas, 
    updateEvalConfig, 
    calculateSubjectAverage, 
    calculateOverallAverage 
  } = useMockDB();

  // Selected subject
  const [selectedSubject, setSelectedSubject] = useState(() => {
    // If logged in as Docente, auto select their specialty
    if (currentUser?.rol === 'DOCENTE') {
      if (currentUser.especialidad === 'Matemáticas') return 'MATE';
      if (currentUser.especialidad === 'Computación') return 'COMP';
      if (currentUser.especialidad === 'Inglés') return 'ING';
      if (currentUser.especialidad === 'Física') return 'FIS';
    }
    return 'COMP';
  });

  const [activeTab, setActiveTab] = useState('notas'); // 'notas' or 'config'

  // Config editing state
  const [pct1, setPct1] = useState(evalConfig[selectedSubject][0]);
  const [pct2, setPct2] = useState(evalConfig[selectedSubject][1]);
  const [pct3, setPct3] = useState(evalConfig[selectedSubject][2]);

  // Sync percentages when subject changes
  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setPct1(evalConfig[subjectId][0]);
    setPct2(evalConfig[subjectId][1]);
    setPct3(evalConfig[subjectId][2]);
    setActionSuccess('');
    setActionError('');
  };

  // Grade edit inline state
  const [editingStudentReg, setEditingStudentReg] = useState('');
  const [editGrades, setEditGrades] = useState([0, 0, 0]);

  // Status alerts
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Handle Edit click
  const handleStartEdit = (p, currentGrades) => {
    setEditingStudentReg(p.nro_registro);
    setEditGrades([currentGrades[0] || 0, currentGrades[1] || 0, currentGrades[2] || 0]);
    setActionSuccess('');
    setActionError('');
  };

  // Handle Inline Grade Save
  const handleSaveGrades = (nro_registro) => {
    setActionSuccess('');
    setActionError('');

    // Bounded validations
    const invalid = editGrades.some(g => g < 0 || g > 100 || isNaN(g));
    if (invalid) {
      setActionError('Las calificaciones deben ser números enteros entre 0 y 100.');
      return;
    }

    const res = updateNotas(nro_registro, selectedSubject, editGrades.map(Number));
    if (res.success) {
      setActionSuccess('Calificaciones de la materia actualizadas.');
      setEditingStudentReg('');
    } else {
      setActionError(res.message);
    }
  };

  // Handle Percentage Weights Config Save
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');

    const p1 = Number(pct1);
    const p2 = Number(pct2);
    const p3 = Number(pct3);

    const res = updateEvalConfig(selectedSubject, [p1, p2, p3]);
    if (res.success) {
      setActionSuccess('Ponderaciones guardadas con éxito. Promedios actualizados.');
    } else {
      setActionError(res.message);
    }
  };

  // Check if current user is authorized to edit a subject
  const isAuthorized = (subjectId) => {
    if (currentUser?.rol === 'ADMIN') return true;
    if (currentUser?.rol === 'DOCENTE') {
      if (currentUser.especialidad === 'Computación' && subjectId === 'COMP') return true;
      if (currentUser.especialidad === 'Matemáticas' && subjectId === 'MATE') return true;
      if (currentUser.especialidad === 'Inglés' && subjectId === 'ING') return true;
      if (currentUser.especialidad === 'Física' && subjectId === 'FIS') return true;
    }
    return false;
  };

  // Subject details map
  const SUBJECTS_MAP = {
    COMP: { nombre: 'Computación', sigla: 'INF-110' },
    MATE: { nombre: 'Matemáticas', sigla: 'MAT-101' },
    ING: { nombre: 'Inglés', sigla: 'LIN-100' },
    FIS: { nombre: 'Física', sigla: 'FIS-102' }
  };

  // Filter students who are habilitados (Requirements APPROVED and PAID)
  const activePostulantes = postulantes.filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO');

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Planilla de Exámenes</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Control de calificaciones y promedios por área de conocimiento.</p>
        </div>

        {/* Tab Switcher (Visible only to Admin) */}
        {currentUser?.rol === 'ADMIN' && (
          <div className="flex p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('notas'); setActionSuccess(''); setActionError(''); }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'notas' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1.5" />
              Planilla Notas
            </button>
            <button
              onClick={() => { setActiveTab('config'); setActionSuccess(''); setActionError(''); }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'config' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1.5" />
              Configurar Ponderación
            </button>
          </div>
        )}
      </div>

      {/* Specialty lock warning for teachers */}
      {currentUser?.rol === 'DOCENTE' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center gap-3 text-xs text-slate-550 dark:text-slate-400 text-left">
          <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <span className="font-bold text-slate-750 dark:text-white">Rol Docente Habilitado:</span> Tu cuenta tiene privilegios limitados únicamente para ver y editar calificaciones de tu especialidad académica (<span className="font-bold underline text-blue-600 dark:text-blue-400">{currentUser.especialidad}</span>).
          </div>
        </div>
      )}

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm text-left">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250/30 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-450 text-sm text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Subject Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-2.5 border border-slate-100 dark:border-slate-850 rounded-3xl shadow-sm font-semibold text-sm">
        {Object.keys(SUBJECTS_MAP).map((subId) => {
          const subInfo = SUBJECTS_MAP[subId];
          const isSelected = selectedSubject === subId;
          const auth = isAuthorized(subId);

          return (
            <button
              key={subId}
              type="button"
              disabled={currentUser?.rol === 'DOCENTE' && !auth}
              onClick={() => handleSubjectChange(subId)}
              className={`py-3.5 px-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                isSelected 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10' 
                  : (currentUser?.rol === 'DOCENTE' && !auth)
                    ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-950 dark:border-slate-900 cursor-not-allowed opacity-40'
                    : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/60 border-slate-150 dark:border-slate-800'
              }`}
            >
              <span className={`text-xs uppercase tracking-wider font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {subInfo.sigla}
              </span>
              <span className="text-sm font-bold">{subInfo.nombre}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                ({evalConfig[subId].join('/')}%)
              </span>
            </button>
          );
        })}
      </div>

      {/* TABS PANELS */}
      {activeTab === 'notas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Planilla General de Alumnos Habilitados</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Mostrando únicamente postulantes que concluyeron exitosamente el registro de requisitos y pago.</p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Aprobados</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Reprobados</span>
            </div>
          </div>

          {activePostulantes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-350 mx-auto" />
              <h5 className="font-bold text-slate-800 dark:text-slate-200">No hay estudiantes habilitados</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Primero debes verificar y aprobar los requisitos físicos, y registrar el pago de los postulantes para que aparezcan en la planilla de exámenes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Postulante</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Examen 1 ({evalConfig[selectedSubject][0]}%)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Examen 2 ({evalConfig[selectedSubject][1]}%)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Examen 3 ({evalConfig[selectedSubject][2]}%)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Promedio Materia</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Promedio General</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Admisión</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Edición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePostulantes.map((p) => {
                    const studentGrades = notas[p.nro_registro]?.[selectedSubject] || [0, 0, 0];
                    const isEditing = editingStudentReg === p.nro_registro;
                    const subAvg = calculateSubjectAverage(studentGrades, selectedSubject);
                    const overallAvg = calculateOverallAverage(notas[p.nro_registro]);
                    
                    const isMateriaAprobado = subAvg >= 60;
                    const isGralAprobado = overallAvg >= 60;

                    // Career option color helper
                    let admLabel = 'Reprobado';
                    let admColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/20';

                    if (overallAvg === 0) {
                      admLabel = 'Pendiente';
                      admColor = 'text-slate-500 bg-slate-50 dark:bg-slate-950/30';
                    } else if (p.estado_admision === 'ADMITIDO_OPCION1') {
                      admLabel = `Admitido (${p.carrera_opcion1})`;
                      admColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';
                    } else if (p.estado_admision === 'ADMITIDO_OPCION2') {
                      admLabel = `Admitido (${p.carrera_opcion2})`;
                      admColor = 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400';
                    } else if (p.estado_admision === 'SIN_CUPO') {
                      admLabel = 'Espera (Sin Cupo)';
                      admColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400';
                    }

                    return (
                      <tr key={p.nro_registro} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                        
                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.nombres} {p.apellidos}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{p.nro_registro} • CI: {p.ci}</div>
                        </td>

                        {/* Grades 1-3 */}
                        {[0, 1, 2].map((idx) => (
                          <td key={idx} className="px-6 py-4 whitespace-nowrap text-center font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editGrades[idx] === 0 ? '' : editGrades[idx]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...editGrades];
                                  updated[idx] = val === '' ? 0 : Math.min(100, Math.max(0, Number(val)));
                                  setEditGrades(updated);
                                }}
                                className="w-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-sm font-semibold">{studentGrades[idx] || 0}</span>
                            )}
                          </td>
                        ))}

                        {/* Subject Average */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                            isMateriaAprobado
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                          }`}>
                            {subAvg}
                          </span>
                        </td>

                        {/* Overall Average */}
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-200 text-sm">
                          {overallAvg} / 100
                        </td>

                        {/* Admission Status */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${admColor}`}>
                            {admLabel}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => handleSaveGrades(p.nro_registro)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center space-x-1"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Guardar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p, studentGrades)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm text-left max-w-xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ponderación Académica</h4>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
              Define los porcentajes académicos para cada uno de los 3 exámenes de la materia seleccionada: <span className="font-bold underline text-blue-600 dark:text-blue-400">{SUBJECTS_MAP[selectedSubject].nombre}</span>. El sistema recalculará de manera retrospectiva e inmediata los promedios finales de todos los postulantes.
            </p>

            <div className="grid grid-cols-3 gap-4 font-semibold text-xs">
              
              {/* Examen 1 */}
              <div>
                <label className="block text-slate-550 uppercase mb-1.5">Examen 1 (%)</label>
                <input
                  type="number"
                  value={pct1}
                  onChange={(e) => setPct1(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Examen 2 */}
              <div>
                <label className="block text-slate-550 uppercase mb-1.5">Examen 2 (%)</label>
                <input
                  type="number"
                  value={pct2}
                  onChange={(e) => setPct2(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Examen 3 */}
              <div>
                <label className="block text-slate-550 uppercase mb-1.5">Examen 3 (%)</label>
                <input
                  type="number"
                  value={pct3}
                  onChange={(e) => setPct3(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Suma total de porcentajes:</span>
              <span className={`text-base font-extrabold ${Number(pct1) + Number(pct2) + Number(pct3) === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Number(pct1) + Number(pct2) + Number(pct3)}% / 100%
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition cursor-pointer text-sm shadow-md flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Ponderación Académica</span>
            </button>

          </form>
        </div>
      )}

    </div>
  );
}
