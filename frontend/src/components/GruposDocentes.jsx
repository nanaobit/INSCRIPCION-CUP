import React, { useState } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Layers, GraduationCap, Calendar, UserCheck, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, MapPin, Sparkles, Trash2, Plus, Info } from 'lucide-react';

export default function GruposDocentes() {
  const { 
    docentes, 
    carreras, 
    materias, 
    aulas, 
    horarios, 
    getCalculatedGroups, 
    registerDocente, 
    deleteDocente, 
    updateDocenteRequisitos, 
    assignAcademicSetting, 
    asignacionesAcademicas 
  } = useMockDB();

  // Subtabs
  const [activeSection, setActiveSection] = useState('grupos'); // 'grupos', 'docentes', 'horarios'

  // Expand group state
  const [expandedGroup, setExpandedGroup] = useState('');

  // Add Docente Form
  const [showAddDocente, setShowAddDocente] = useState(false);
  const [docenteForm, setDocenteForm] = useState({
    ci: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    especialidad: 'Computación',
    tiene_maestria: false,
    tiene_diplomado: false
  });

  // Assign Academic settings form state
  const [assignForm, setAssignForm] = useState({
    grupo: 'Grupo 1',
    materia: 'COMP',
    docente: 'Sin Docente Asignado',
    aula: 'Laboratorio de Cómputo 1',
    horario: '07:30 - 09:45 (Lunes a Viernes)'
  });

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Get dynamic groups data
  const { totalInscritos, cantidadGrupos, grupos } = getCalculatedGroups();

  const handleDocenteFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDocenteForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddDocente = (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');

    const res = registerDocente(docenteForm);
    if (res.success) {
      setActionSuccess(res.message);
      setShowAddDocente(false);
      setDocenteForm({
        ci: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        especialidad: 'Computación',
        tiene_maestria: false,
        tiene_diplomado: false
      });
    } else {
      setActionError(res.message);
    }
  };

  const handleToggleDocenteReq = (codigo, key, val) => {
    setActionSuccess('');
    setActionError('');

    const targetDocente = docentes.find(d => d.codigo === codigo);
    if (!targetDocente) return;

    const updatedData = {
      tiene_maestria: key === 'maestria' ? val : targetDocente.tiene_maestria,
      tiene_diplomado: key === 'diplomado' ? val : targetDocente.tiene_diplomado
    };

    const res = updateDocenteRequisitos(codigo, updatedData);
    if (res.success) {
      setActionSuccess(res.message);
    }
  };

  const handleAssignAcademic = (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');

    const res = assignAcademicSetting(assignForm);
    if (res.success) {
      setActionSuccess(res.message);
    } else {
      setActionError(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Grupos y Cuerpo Docente</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Organización de grupos, horarios y asignación académica.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => { setActiveSection('grupos'); setActionSuccess(''); setActionError(''); }}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'grupos' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-1.5" />
            Grupos ({cantidadGrupos})
          </button>
          <button
            onClick={() => { setActiveSection('docentes'); setActionSuccess(''); setActionError(''); }}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'docentes' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <GraduationCap className="w-4 h-4 inline mr-1.5" />
            Contratación Docente
          </button>
          <button
            onClick={() => { setActiveSection('horarios'); setActionSuccess(''); setActionError(''); }}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSection === 'horarios' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Carga Académica
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm text-left">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250/30 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-450 text-sm text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 1. SECCIÓN GRUPOS AUTOMÁTICOS */}
      {activeSection === 'grupos' && (
        <div className="space-y-6 text-left">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-850 dark:text-white">Motor de Clasificación y Agrupación Automática</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
              La facultad agrupa a los estudiantes de manera automática según concluyan exitosamente sus requisitos y el pago de matrícula. Cada grupo tiene una capacidad máxima de <span className="font-bold underline text-blue-600 dark:text-blue-400">70 estudiantes</span>. Actualmente hay <span className="font-bold text-slate-800 dark:text-white">{totalInscritos} alumnos inscritos habilitados</span> distribuidos en <span className="font-bold text-slate-850 dark:text-white">{cantidadGrupos} grupo(s) habilitado(s)</span>.
            </p>
          </div>

          <div className="space-y-4">
            {grupos.map((g) => {
              const isExpanded = expandedGroup === g.nombre;
              const fillPct = Math.round((g.cantidad_inscritos / g.cupo_maximo) * 100);

              return (
                <div key={g.nombre} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition duration-200">
                  
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedGroup(isExpanded ? '' : g.nombre)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{g.nombre}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-350 px-2 py-0.5 rounded font-mono">Max 70 Alumnos</span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">{g.cantidad_inscritos} estudiantes matriculados</p>
                    </div>

                    <div className="flex items-center space-x-6 w-full sm:w-auto">
                      {/* Percent progress */}
                      <div className="hidden sm:block text-right space-y-1 w-32 shrink-0">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capacidad Llenada</div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                        <span className="text-slate-800 dark:text-slate-200">{g.cupo_disponible} cupos libres</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-450" /> : <ChevronDown className="w-5 h-5 text-slate-450" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded list of students */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-850 p-6 bg-slate-50/30 dark:bg-slate-950/20">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lista de Estudiantes Matriculados en {g.nombre}</p>
                      
                      {g.estudiantes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No hay alumnos asignados a este grupo todavía.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {g.estudiantes.map((est, eidx) => (
                            <div key={est.nro_registro} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3 text-xs shadow-sm">
                              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold flex items-center justify-center shrink-0">
                                {eidx + 1}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{est.nombres} {est.apellidos}</p>
                                <p className="text-[10px] text-slate-400 font-mono">CI: {est.ci} • {est.carrera_opcion1}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 2. SECCIÓN CONTRATACIÓN DOCENTES */}
      {activeSection === 'docentes' && (
        <div className="space-y-6 text-left">
          
          {/* Header & Add Button */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Cuerpo Docente de la Facultad</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Control reglamentario de requisitos académicos y habilitación de contratos.</p>
            </div>
            <button
              onClick={() => setShowAddDocente(!showAddDocente)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Docente</span>
            </button>
          </div>

          {/* Add Docente Form Card */}
          {showAddDocente && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-md animate-slideDown max-w-xl mx-auto">
              <h4 className="text-base font-bold text-slate-800 dark:text-white mb-4">Registrar Nuevo Docente</h4>
              <form onSubmit={handleAddDocente} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Cédula de Identidad *</label>
                    <input
                      type="text"
                      name="ci"
                      value={docenteForm.ci}
                      onChange={handleDocenteFormChange}
                      placeholder="Ej. 4928123"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Materia / Especialidad</label>
                    <select
                      name="especialidad"
                      value={docenteForm.especialidad}
                      onChange={handleDocenteFormChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Computación">Computación</option>
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Inglés">Inglés</option>
                      <option value="Física">Física</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Nombres *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={docenteForm.nombre}
                      onChange={handleDocenteFormChange}
                      placeholder="Ej. Carlos"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Apellidos *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={docenteForm.apellido}
                      onChange={handleDocenteFormChange}
                      placeholder="Ej. Suárez Justiniano"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Correo *</label>
                    <input
                      type="email"
                      name="correo"
                      value={docenteForm.correo}
                      onChange={handleDocenteFormChange}
                      placeholder="Ej. carlos.suarez@ficct.uagrm.edu.bo"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Teléfono *</label>
                    <input
                      type="text"
                      name="telefono"
                      value={docenteForm.telefono}
                      onChange={handleDocenteFormChange}
                      placeholder="Ej. 78945612"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Requirements check in registration */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2 text-xs font-semibold">
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest mb-2.5">Cumplimiento de Habilitación Docente</p>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="tiene_maestria"
                      checked={docenteForm.tiene_maestria}
                      onChange={handleDocenteFormChange}
                      className="accent-blue-600 rounded"
                    />
                    <span>Cuenta con Postgrado de Maestría en el Área</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="tiene_diplomado"
                      checked={docenteForm.tiene_diplomado}
                      onChange={handleDocenteFormChange}
                      className="accent-blue-600 rounded"
                    />
                    <span>Posee Diplomado en Educación Superior</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDocente(false)}
                    className="border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-955 px-4 py-2 rounded-xl text-xs cursor-pointer font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                  >
                    Guardar Docente
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Docentes grid card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docentes.map((d) => {
              const isHired = d.estado_contrato === 'CONTRATADO';
              
              // Count assigned groups from Carga Académica distinct list
              const distinctGroupsCount = new Set(
                asignacionesAcademicas
                  .filter(a => a.docente === `${d.nombre} ${d.apellido}`)
                  .map(a => a.grupo)
              ).size;

              return (
                <div key={d.codigo} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition duration-200">
                  
                  {/* Top info row */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                        {d.codigo}
                      </span>
                      <h5 className="font-extrabold text-base text-slate-850 dark:text-white mt-1">
                        {d.nombre} {d.apellido}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                        Especialidad: <span className="text-slate-650 dark:text-slate-300 font-bold">{d.especialidad}</span>
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isHired 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                    }`}>
                      {isHired ? 'Habilitado ✓' : 'Faltan Requisitos'}
                    </span>
                  </div>

                  {/* Contact / Group count */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-medium bg-slate-50/50 dark:bg-slate-950/45 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <p><span className="text-slate-400">CI:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{d.ci}</span></p>
                    <p><span className="text-slate-400">Correo:</span> <span className="text-slate-700 dark:text-slate-300">{d.correo}</span></p>
                    <p><span className="text-slate-400">Grupos Asignados:</span> <span className="font-bold text-slate-800 dark:text-white">{distinctGroupsCount} / 4</span></p>
                  </div>

                  {/* Requirements checklist */}
                  <div className="space-y-2 text-xs font-semibold">
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest ml-0.5">Control de Credenciales Habilitadoras</p>
                    
                    {/* Maestria checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleDocenteReq(d.codigo, 'maestria', !d.tiene_maestria)}
                      className="w-full p-2.5 bg-slate-50/30 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-left cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Título de Maestría en el Área</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${d.tiene_maestria ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {d.tiene_maestria && '✓'}
                      </span>
                    </button>

                    {/* Diplomado checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleDocenteReq(d.codigo, 'diplomado', !d.tiene_diplomado)}
                      className="w-full p-2.5 bg-slate-50/30 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-left cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Diplomado en Educación Superior</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${d.tiene_diplomado ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {d.tiene_diplomado && '✓'}
                      </span>
                    </button>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">
                      Fecha alta: {d.fecha_creacion}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro de dar de baja al docente ${d.nombre} ${d.apellido}?`)) {
                          deleteDocente(d.codigo);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-450 rounded-lg transition border border-transparent hover:border-slate-250 dark:hover:border-slate-800 cursor-pointer"
                      title="Dar de baja docente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 3. SECCIÓN HORARIOS Y CARGA ACADÉMICA */}
      {activeSection === 'horarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          {/* Assignment form (Left pane) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col h-fit">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h4 className="text-base font-bold text-slate-850 dark:text-white">Programar Carga Académica</h4>
            </div>
            
            <form onSubmit={handleAssignAcademic} className="space-y-4">
              <p className="text-xs text-slate-450 dark:text-slate-400 mb-2 leading-relaxed">
                Asigna docentes, aulas y turnos horarios a las materias de cada grupo preuniversitario. El sistema validará que los docentes cumplan requisitos mínimos y que no excedan el límite de 4 grupos.
              </p>

              {/* Grupo selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Grupo Habilitado</label>
                <select
                  value={assignForm.grupo}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, grupo: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                >
                  {grupos.map(g => (
                    <option key={g.nombre} value={g.nombre}>{g.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Materia selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Materia</label>
                <select
                  value={assignForm.materia}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, materia: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                >
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} ({m.sigla})</option>
                  ))}
                </select>
              </div>

              {/* Docente selector (Filtered by subject specialty if desired, or all) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Docente Candidato</label>
                <select
                  value={assignForm.docente}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, docente: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                >
                  <option value="Sin Docente Asignado">Sin Docente Asignado</option>
                  {docentes.map(d => (
                    <option key={d.codigo} value={`${d.nombre} ${d.apellido}`}>{d.nombre} {d.apellido} ({d.especialidad})</option>
                  ))}
                </select>
              </div>

              {/* Aula selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Aula Asignada</label>
                <select
                  value={assignForm.aula}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, aula: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                >
                  {aulas.map(a => (
                    <option key={a.id} value={a.nombre}>{a.nombre} (Cap: {a.capacidad})</option>
                  ))}
                </select>
              </div>

              {/* Horario selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Horario / Turno</label>
                <select
                  value={assignForm.horario}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, horario: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                >
                  {horarios.map(h => (
                    <option key={h.id} value={`${h.hora_inicio} - ${h.hora_fin} (${h.dia})`}>{h.hora_inicio} - {h.hora_fin} ({h.turno})</option>
                  ))}
                </select>
              </div>

              {/* Save */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition cursor-pointer text-xs flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Asignar Carga Académica</span>
              </button>

            </form>
          </div>

          {/* Academic schedules grid (Right pane) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-850 dark:text-white">Planilla de Asignaciones y Horarios Activos</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Mapeo institucional de clases en curso para el preuniversitario de la FICCT.</p>
            </div>

            <div className="space-y-4 flex-1 mt-4 overflow-y-auto max-h-[460px] pr-1">
              {grupos.map((g) => {
                const groupSettings = asignacionesAcademicas.filter(a => a.grupo === g.nombre);

                return (
                  <div key={g.nombre} className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                    
                    {/* Header */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 font-extrabold text-slate-800 dark:text-white flex justify-between">
                      <span>{g.nombre} - Carga Horaria y Aulas</span>
                      <span className="text-slate-400 font-medium">Inscritos: {g.cantidad_inscritos}</span>
                    </div>

                    {/* Class slots */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {materias.map(m => {
                        const classSetting = groupSettings.find(a => a.materia === m.id);

                        return (
                          <div key={m.id} className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            {/* Subject */}
                            <div className="space-y-0.5 shrink-0">
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">{m.nombre}</p>
                              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{m.sigla}</p>
                            </div>

                            {/* Details */}
                            {classSetting ? (
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 pl-0 sm:pl-4">
                                <div className="flex items-center space-x-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span className="truncate" title={classSetting.docente}>{classSetting.docente}</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span className="truncate">{classSetting.aula}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 sm:col-span-2">
                                  <Clock className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                  <span className="truncate">{classSetting.horario}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/20 py-1 px-3 rounded-md">
                                <Info className="w-3.5 h-3.5 shrink-0" />
                                <span>Clase no programada</span>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
