import React, { useState } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Search, UserPlus, Edit2, Trash2, ShieldCheck, Mail, Phone, Calendar, MapPin, Award, CheckCircle, AlertCircle, X, ChevronRight, ChevronLeft, CreditCard } from 'lucide-react';

export default function Postulantes({ setActiveTab, setSelectedPostulanteReg }) {
  const { postulantes, registerPostulante, updatePostulante, deletePostulante, carreras } = useMockDB();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraFilter, setCarreraFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReg, setCurrentReg] = useState('');
  
  // Multi-step form step state
  const [formStep, setFormStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Initial form state
  const initialFormState = {
    ci: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'M',
    direccion: '',
    telefono: '',
    correo: '',
    colegio_procedencia: '',
    ciudad: 'Santa Cruz de la Sierra',
    carrera_opcion1: '',
    carrera_opcion2: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered applicants list
  const filteredPostulantes = postulantes.filter(p => {
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    const searchMatch = fullName.includes(searchTerm.toLowerCase()) || p.ci.includes(searchTerm) || p.nro_registro.toLowerCase().includes(searchTerm.toLowerCase());
    const carreraMatch = !carreraFilter || p.carrera_opcion1 === carreraFilter || p.carrera_opcion2 === carreraFilter;
    
    let estadoMatch = true;
    if (estadoFilter) {
      if (estadoFilter === 'PENDIENTE_PAGO') estadoMatch = p.estado_pago === 'PENDIENTE';
      else if (estadoFilter === 'PENDIENTE_REQUISITOS') estadoMatch = p.estado_requisitos === 'PENDIENTE';
      else if (estadoFilter === 'ADMITIDO') estadoMatch = p.estado_admision.startsWith('ADMITIDO');
      else if (estadoFilter === 'REPROBADO') estadoMatch = p.estado_academico === 'REPROBADO';
    }

    return searchMatch && carreraMatch && estadoMatch;
  });

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setFormStep(1);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (postulante) => {
    setFormData({
      ci: postulante.ci,
      nombres: postulante.nombres,
      apellidos: postulante.apellidos,
      fecha_nacimiento: postulante.fecha_nacimiento,
      sexo: postulante.sexo,
      direccion: postulante.direccion,
      telefono: postulante.telefono,
      correo: postulante.correo,
      colegio_procedencia: postulante.colegio_procedencia,
      ciudad: postulante.ciudad,
      carrera_opcion1: postulante.carrera_opcion1,
      carrera_opcion2: postulante.carrera_opcion2
    });
    setCurrentReg(postulante.nro_registro);
    setIsEditMode(true);
    setFormStep(1);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    // Basic step 1 validations
    if (formStep === 1) {
      if (!formData.ci || !formData.nombres || !formData.apellidos || !formData.correo) {
        setFormError('Los campos CI, Nombres, Apellidos y Correo son obligatorios.');
        return;
      }
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        setFormError('El correo electrónico no es válido.');
        return;
      }
      setFormError('');
    }
    setFormStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setFormError('');
    setFormStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validations
    if (!formData.carrera_opcion1 || !formData.carrera_opcion2) {
      setFormError('Debes seleccionar obligatoriamente las dos opciones de carrera.');
      return;
    }

    if (formData.carrera_opcion1 === formData.carrera_opcion2) {
      setFormError('La segunda opción de carrera debe ser diferente a la primera opción.');
      return;
    }

    if (isEditMode) {
      const res = updatePostulante(currentReg, formData);
      if (res.success) {
        setFormSuccess(res.message);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1000);
      } else {
        setFormError(res.message);
      }
    } else {
      const res = registerPostulante(formData);
      if (res.success) {
        setFormSuccess(res.message);
        setTimeout(() => {
          setIsModalOpen(false);
          // Redirect user to the payments page so they can pay! Very intuitive flow.
          setSelectedPostulanteReg(res.nro_registro);
          setActiveTab('pagos');
        }, 1200);
      } else {
        setFormError(res.message);
      }
    }
  };

  const handleDelete = (nro_registro, name) => {
    if (window.confirm(`¿Está completamente seguro de eliminar el registro de ${name}? Esta acción es irreversible.`)) {
      deletePostulante(nro_registro);
    }
  };

  const handlePayDirect = (nro_registro) => {
    setSelectedPostulanteReg(nro_registro);
    setActiveTab('pagos');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Registro de Postulantes</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Administra los postulantes al curso preuniversitario.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span>Inscribir Postulante</span>
        </button>
      </div>

      {/* Search and Filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por CI, nombre, apellidos o registro..."
            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filter by Career */}
        <div>
          <select
            value={carreraFilter}
            onChange={(e) => setCarreraFilter(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">Todas las Carreras</option>
            {carreras.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.id})</option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">Todos los Estados</option>
            <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
            <option value="PENDIENTE_REQUISITOS">Pendiente Requisitos</option>
            <option value="ADMITIDO">Admitidos FICCT</option>
            <option value="REPROBADO">Reprobados</option>
          </select>
        </div>
      </div>

      {/* Grid of applicants */}
      {filteredPostulantes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-12 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="text-lg font-bold text-slate-850 dark:text-slate-100">No se encontraron postulantes</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Prueba a reajustar los filtros de búsqueda o registra un nuevo postulante presionando el botón superior.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nro Registro</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Postulante</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">CI / Teléfono</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Opciones Carrera</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Requisitos / Pago</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Académico</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPostulantes.map((p) => {
                  
                  // Req badge
                  const reqApproved = p.estado_requisitos === 'APROBADO';
                  // Pago badge
                  const paid = p.estado_pago === 'PAGADO';

                  // Admission label
                  let admLabel = 'Inscrito';
                  let admColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                  
                  if (p.estado_admision === 'ADMITIDO_OPCION1') {
                    admLabel = `Admitido (1ª Opción: ${p.carrera_opcion1})`;
                    admColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
                  } else if (p.estado_admision === 'ADMITIDO_OPCION2') {
                    admLabel = `Admitido (2ª Opción: ${p.carrera_opcion2})`;
                    admColor = 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400';
                  } else if (p.estado_admision === 'SIN_CUPO') {
                    admLabel = 'Sin Cupo (En Espera)';
                    admColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
                  } else if (p.estado_admision === 'RECHAZADO') {
                    admLabel = 'Reprobado';
                    admColor = 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-450';
                  }

                  return (
                    <tr key={p.nro_registro} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                      
                      {/* Nro Reg */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {p.nro_registro}
                      </td>

                      {/* Name / Email */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.nombres} {p.apellidos}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{p.correo}</span>
                        </div>
                      </td>

                      {/* CI / Tel */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">CI: {p.ci}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{p.telefono}</span>
                        </div>
                      </td>

                      {/* Career Choices */}
                      <td className="px-6 py-4 text-xs font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <div><span className="text-slate-400">1ª:</span> <span className="text-slate-750 dark:text-slate-200">{p.carrera_opcion1}</span></div>
                          <div><span className="text-slate-400">2ª:</span> <span className="text-slate-750 dark:text-slate-200">{p.carrera_opcion2}</span></div>
                        </div>
                      </td>

                      {/* Requisitos / Pagos Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center space-x-1">
                            <span className={`w-2 h-2 rounded-full ${reqApproved ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {reqApproved ? 'Requisitos Aprobados' : 'Docs. Pendientes'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {paid ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pagado</span>
                              </>
                            ) : (
                              <button 
                                onClick={() => handlePayDirect(p.nro_registro)}
                                className="flex items-center gap-0.5 text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pagar Bs. 350</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Academic / Admission */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${admColor}`}>
                            {admLabel}
                          </span>
                          {p.estado_academico !== 'PENDIENTE' && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Promedio: <span className="font-bold text-slate-650 dark:text-slate-250">{p.promedio_final} pts</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar Datos"
                            className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 dark:bg-slate-950 dark:hover:bg-blue-900/30 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.nro_registro, `${p.nombres} ${p.apellidos}`)}
                            title="Eliminar Registro"
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-slate-950 dark:hover:bg-rose-900/30 dark:text-slate-400 dark:hover:text-rose-450 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-step Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isEditMode ? 'Modificar Registro Postulante' : 'Inscripción de Postulante'}
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Completar la información requerida por la administración académica.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-center space-x-6 text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${formStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${formStep >= 1 ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300'}`}>1</span>
                Datos Personales
              </span>
              <ChevronRight className="w-4 h-4 text-slate-350" />
              <span className={`flex items-center gap-1.5 ${formStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${formStep >= 2 ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300'}`}>2</span>
                Datos Académicos
              </span>
            </div>

            {/* Form Action */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {formError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl flex items-start gap-2 text-rose-600 dark:text-rose-450 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl flex items-start gap-2 text-emerald-600 dark:text-emerald-450 text-sm">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* STEP 1: Personal Details */}
              {formStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  
                  {/* CI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">CI <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="ci"
                      value={formData.ci}
                      onChange={handleInputChange}
                      placeholder="Ej. 8234910"
                      disabled={isEditMode}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Ciudad de procedencia</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ej. Santa Cruz"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Nombres */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Nombres <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      placeholder="Ej. Juan Marcos"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Apellidos <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Ej. Pérez Justiniano"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Fecha Nacimiento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Fecha Nacimiento <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Sexo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-1.5 text-sm">
                        <input
                          type="radio"
                          name="sexo"
                          value="M"
                          checked={formData.sexo === 'M'}
                          onChange={handleInputChange}
                          className="accent-blue-600 focus:ring-0"
                        />
                        <span>Masculino</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-sm">
                        <input
                          type="radio"
                          name="sexo"
                          value="F"
                          checked={formData.sexo === 'F'}
                          onChange={handleInputChange}
                          className="accent-blue-600 focus:ring-0"
                        />
                        <span>Femenino</span>
                      </label>
                    </div>
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      placeholder="Ej. juan.perez@gmail.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Teléfono Celular <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="Ej. 78941032"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Dirección de Domicilio</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Ej. Barrio Los Olivos Calle 3 #45"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                </div>
              )}

              {/* STEP 2: Academic Details */}
              {formStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  
                  {/* Colegio de Procedencia */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Colegio de Procedencia <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="colegio_procedencia"
                      value={formData.colegio_procedencia}
                      onChange={handleInputChange}
                      placeholder="Ej. Colegio La Salle"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Carrera Opción 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Primera opción de Carrera <span className="text-red-500">*</span></label>
                    <select
                      name="carrera_opcion1"
                      value={formData.carrera_opcion1}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">-- Seleccionar --</option>
                      {carreras.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Carrera Opción 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-0.5">Segunda opción de Carrera <span className="text-red-500">*</span></label>
                    <select
                      name="carrera_opcion2"
                      value={formData.carrera_opcion2}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">-- Seleccionar --</option>
                      {carreras.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Notice */}
                  <div className="sm:col-span-2 p-4 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-150/40 dark:border-blue-900/20 rounded-2xl text-xs text-blue-700 dark:text-blue-400 mt-2">
                    <span className="font-bold">Información de requisitos iniciales:</span> Al registrarse, se asume un estado temporal pendiente de verificación. Deberás cargar o corroborar los documentos físicos (Título de Bachiller y Cédula de Identidad original) en el siguiente módulo de requisitos para poder habilitar al estudiante para pagos e ingreso a clases.
                  </div>

                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div>
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-650 dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl cursor-pointer text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Atrás</span>
                    </button>
                  )}
                </div>

                <div>
                  {formStep < 2 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl active:scale-95 cursor-pointer text-sm"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-2.5 rounded-xl active:scale-95 cursor-pointer text-sm shadow-md"
                    >
                      <span>{isEditMode ? 'Guardar Cambios' : 'Confirmar Registro'}</span>
                    </button>
                  )}
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
