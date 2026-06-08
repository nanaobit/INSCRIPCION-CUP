import React, { useState, useEffect } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Search, CheckSquare, Square, Save, CreditCard, QrCode, Building, AlertCircle, FileText, CheckCircle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

export default function RequisitosYPagos({ selectedPostulanteReg, setSelectedPostulanteReg }) {
  const { postulantes, requisitos, pagos, verifyRequisitos, processPago } = useMockDB();

  // Local search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('requisitos'); // 'requisitos' or 'pagos'
  const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr', 'card', 'transfer'

  // Payment form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Local statuses
  const [reqObs, setReqObs] = useState('');
  const [titleCheck, setTitleCheck] = useState(false);
  const [ciCheck, setCiCheck] = useState(false);
  const [otherCheck, setOtherCheck] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Selected student
  const currentStudent = postulantes.find(p => p.nro_registro === selectedPostulanteReg) || postulantes[0] || null;

  // Sync checkboxes when selected student changes
  useEffect(() => {
    if (currentStudent && requisitos[currentStudent.nro_registro]) {
      const studentReqs = requisitos[currentStudent.nro_registro];
      setTitleCheck(studentReqs.titulo_bachiller || false);
      setCiCheck(studentReqs.documento_identidad || false);
      setOtherCheck(studentReqs.otros_requisitos || false);
      setReqObs(studentReqs.observacion || '');
      setActionSuccess('');
      setActionError('');
    }
  }, [selectedPostulanteReg, currentStudent, requisitos]);

  const handleSaveRequisitos = (e) => {
    e.preventDefault();
    if (!currentStudent) return;

    setActionSuccess('');
    setActionError('');

    const res = verifyRequisitos(currentStudent.nro_registro, {
      titulo_bachiller: titleCheck,
      documento_identidad: ciCheck,
      otros_requisitos: otherCheck,
      observacion: reqObs
    });

    if (res.success) {
      setActionSuccess('Requisitos y documentación actualizados correctamente.');
      // Auto toggle to payment tab if approved
      if (titleCheck && ciCheck) {
        setTimeout(() => {
          setActiveSubTab('pagos');
          setActionSuccess('');
        }, 1200);
      }
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!currentStudent) return;

    setActionSuccess('');
    setActionError('');

    if (paymentMethod === 'card') {
      if (cardNumber.length < 16 || !cardName.trim() || cardExpiry.length < 5 || cardCvv.length < 3) {
        setActionError('Todos los datos de la tarjeta son obligatorios para procesar la transacción.');
        return;
      }
    }

    setPaymentLoading(true);

    // Simulate payment processing time
    setTimeout(() => {
      let methodText = 'Código QR';
      if (paymentMethod === 'card') methodText = 'Tarjeta de Crédito (terminada en ' + cardNumber.slice(-4) + ')';
      else if (paymentMethod === 'transfer') methodText = 'Transferencia UNI-UAGRM';

      const res = processPago(currentStudent.nro_registro, { metodo_pago: methodText });
      setPaymentLoading(false);

      if (res.success) {
        setActionSuccess('Transacción aprobada. Estudiante habilitado académicamente.');
      } else {
        setActionError('Ocurrió un error al procesar el pago.');
      }
    }, 1500);
  };

  // Search filtered list
  const filteredStudents = postulantes.filter(p => {
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || p.ci.includes(searchTerm) || p.nro_registro.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeStudentReqs = currentStudent ? requisitos[currentStudent.nro_registro] : null;
  const activeStudentPago = currentStudent ? pagos[currentStudent.nro_registro] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Left panel: Students selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl shadow-sm flex flex-col h-[650px]">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Postulantes</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar postulante..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-9 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredStudents.map(p => {
            const isSelected = currentStudent?.nro_registro === p.nro_registro;
            const reqPassed = p.estado_requisitos === 'APROBADO';
            const paid = p.estado_pago === 'PAGADO';

            return (
              <button
                key={p.nro_registro}
                onClick={() => {
                  setSelectedPostulanteReg(p.nro_registro);
                  setActionSuccess('');
                  setActionError('');
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800' 
                    : 'bg-slate-50/20 hover:bg-slate-50 dark:hover:bg-slate-950/60 border-slate-150 dark:border-slate-800/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{p.nombres} {p.apellidos}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{p.nro_registro} • CI: {p.ci}</div>
                </div>

                <div className="flex gap-1.5 shrink-0 mt-0.5">
                  {/* Req check */}
                  <span 
                    title={reqPassed ? 'Requisitos presentados' : 'Faltan requisitos'}
                    className={`w-2.5 h-2.5 rounded-full ${reqPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  />
                  {/* Pago check */}
                  <span 
                    title={paid ? 'Matrícula pagada' : 'Pago pendiente'}
                    className={`w-2.5 h-2.5 rounded-full ${paid ? 'bg-emerald-500' : 'bg-slate-350'}`} 
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Details and Action sheets */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        
        {currentStudent ? (
          <>
            {/* Header info card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">
                    {currentStudent.nro_registro}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {currentStudent.nombres} {currentStudent.apellidos}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Carreras Postuladas: <span className="text-slate-700 dark:text-slate-200">1ª {currentStudent.carrera_opcion1} • 2ª {currentStudent.carrera_opcion2}</span>
                  </p>
                </div>

                {/* SubTab switcher */}
                <div className="flex p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveSubTab('requisitos')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                      activeSubTab === 'requisitos' 
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    1. Requisitos
                  </button>
                  <button
                    onClick={() => setActiveSubTab('pagos')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                      activeSubTab === 'pagos' 
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    2. Pago Matrícula
                  </button>
                </div>
              </div>
            </div>

            {/* Alert status box */}
            {actionSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250/30 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-450 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Content pane: Requisitos Verification */}
            {activeSubTab === 'requisitos' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm text-left flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verificación de Requisitos Académicos</h4>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    currentStudent.estado_requisitos === 'APROBADO' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                    {currentStudent.estado_requisitos === 'APROBADO' ? 'Verificados ✓' : 'Pendientes'}
                  </span>
                </div>

                <form onSubmit={handleSaveRequisitos} className="space-y-6">
                  
                  {/* Checklist */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Lista de Documentos Requeridos</p>
                    
                    {/* Requisito 1: Titulo Bachiller */}
                    <button
                      type="button"
                      onClick={() => setTitleCheck(!titleCheck)}
                      className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-left cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-250">Título de Bachiller (Copia legalizada / Original)</p>
                        <p className="text-xs text-slate-400">Verificar fotocopia legible o título de bachiller nacional.</p>
                      </div>
                      {titleCheck ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                      )}
                    </button>

                    {/* Requisito 2: CI Documento Identidad */}
                    <button
                      type="button"
                      onClick={() => setCiCheck(!ciCheck)}
                      className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-left cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-250">Cédula de Identidad (Original y fotocopia)</p>
                        <p className="text-xs text-slate-400">Cotejar con los datos del registro y que no esté caducado.</p>
                      </div>
                      {ciCheck ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                      )}
                    </button>

                    {/* Requisito 3: Otros requisitos */}
                    <button
                      type="button"
                      onClick={() => setOtherCheck(!otherCheck)}
                      className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-left cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-250">Formulario de Inscripción Firmado y otros requisitos</p>
                        <p className="text-xs text-slate-400">Formulario impreso del registro de postulantes y fotos 3x3.</p>
                      </div>
                      {otherCheck ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                      )}
                    </button>
                  </div>

                  {/* Observations */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Observaciones de la Auditoría</label>
                    <textarea
                      value={reqObs}
                      onChange={(e) => setReqObs(e.target.value)}
                      placeholder="Escribe alguna observación o comentario adicional sobre los documentos físicos presentados..."
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition cursor-pointer text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar y Validar Requisitos</span>
                  </button>

                </form>
              </div>
            )}

            {/* Content pane: Pasarela de Pago Mock */}
            {activeSubTab === 'pagos' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm text-left flex-1 flex flex-col justify-between">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pasarela de Pagos (Simulada)</h4>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    currentStudent.estado_pago === 'PAGADO' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-450'
                  }`}>
                    {currentStudent.estado_pago === 'PAGADO' ? 'Pagado ✓' : 'Pendiente'}
                  </span>
                </div>

                {/* If requirements are not approved yet */}
                {currentStudent.estado_requisitos !== 'APROBADO' ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-250">Pago Bloqueado</h5>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        De acuerdo a las reglas del negocio, el postulante primero debe presentar y cumplir con todos sus <span className="underline font-semibold">requisitos físicos</span> antes de poder proceder al pago.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('requisitos')}
                      className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      <span>Aprobar requisitos ahora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* If already paid, show Receipt */}
                    {currentStudent.estado_pago === 'PAGADO' ? (
                      <div className="flex-1 flex flex-col justify-between">
                        
                        {/* Receipt Box */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                          
                          {/* Stamp decoration */}
                          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 rounded-full border-4 border-dashed border-emerald-500/20 flex items-center justify-center transform rotate-12 pointer-events-none select-none">
                            <span className="text-[10px] font-extrabold text-emerald-500/30 uppercase tracking-widest">PAGADO</span>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Transacción Exitosa</p>
                              <h4 className="text-base font-bold text-slate-850 dark:text-white">Bs. 350.00 COP / Preuniversitario FICCT</h4>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200/50 dark:border-slate-800/80">
                                <div>
                                  <span className="text-slate-400">Concepto:</span>
                                  <p className="font-semibold text-slate-755 dark:text-slate-200">{activeStudentPago?.concepto_pago || 'Curso Preuniversitario 2/2026'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Método de Pago:</span>
                                  <p className="font-semibold text-slate-755 dark:text-slate-200">{activeStudentPago?.metodo_pago || 'Gateway Electrónico'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Fecha de Pago:</span>
                                  <p className="font-semibold text-slate-755 dark:text-slate-200">
                                    {activeStudentPago?.fecha ? new Date(activeStudentPago.fecha).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Nro. de Comprobante:</span>
                                  <p className="font-mono font-bold text-slate-755 dark:text-slate-200">REF-{String(currentStudent.ci).slice(-5)}-2026</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Print Receipt button */}
                        <button
                          onClick={() => window.print()}
                          className="mt-6 flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-650 dark:text-slate-300 font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition cursor-pointer text-sm"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir Comprobante Oficial</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col space-y-6">
                        
                        {/* Selector of payment methods */}
                        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-850 rounded-2xl font-semibold text-xs text-center">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('qr')}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                              paymentMethod === 'qr' 
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                            }`}
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Escaneo QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                              paymentMethod === 'card' 
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Tarjeta Crédito</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('transfer')}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                              paymentMethod === 'transfer' 
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                            }`}
                          >
                            <Building className="w-4 h-4" />
                            <span>Transferencia</span>
                          </button>
                        </div>

                        {/* Details form based on selected method */}
                        <form onSubmit={handleProcessPayment} className="space-y-6 flex-1 flex flex-col justify-between">
                          
                          {/* 1. QR code layout */}
                          {paymentMethod === 'qr' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                              <div className="p-4 bg-white border-4 border-slate-100 dark:border-slate-800 rounded-3xl shadow-md relative">
                                {/* Decorative scanner animation */}
                                <div className="absolute inset-x-4 top-4 h-0.5 bg-blue-500 animate-bounce" />
                                <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                                  {/* A clean vector mock QR code */}
                                  <path d="M5,5 h30 v30 h-30 z M10,10 h20 v20 h-20 z" />
                                  <path d="M65,5 h30 v30 h-30 z M70,10 h20 v20 h-20 z" />
                                  <path d="M5,65 h30 v30 h-30 z M10,70 h20 v20 h-20 z" />
                                  <rect x="15" y="15" width="10" height="10" />
                                  <rect x="75" y="15" width="10" height="10" />
                                  <rect x="15" y="75" width="10" height="10" />
                                  <path d="M45,5 h10 v10 h-10 z M45,25 h15 v5 h-15 z M45,45 h5 v5 h-5 z M5,45 h10 v5 h-10 z M25,45 h10 v10 h-10 z M55,45 h20 v10 h-20 z M45,65 h10 v15 h-10 z M65,65 h10 v10 h-10 z M75,75 h20 v20 h-20 z" />
                                </svg>
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">UAGRM BANCO FÁCIL QR</p>
                                <p className="text-xs text-slate-400">Escanea desde cualquier app bancaria autorizada.</p>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Monto: Bs. 350.00</p>
                              </div>
                            </div>
                          )}

                          {/* 2. Credit Card Form layout */}
                          {paymentMethod === 'card' && (
                            <div className="space-y-4 text-left flex-1">
                              
                              {/* Card Number */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Número de Tarjeta</label>
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                  placeholder="4111 2222 3333 4444"
                                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                />
                              </div>

                              {/* Card Name */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Nombre del Titular</label>
                                <input
                                  type="text"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                  placeholder="MARCOS PEREZ J."
                                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                                />
                              </div>

                              {/* Expiry & CVV */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Vencimiento</label>
                                  <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                                    placeholder="MM/AA"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">CVC / CVV</label>
                                  <input
                                    type="password"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    placeholder="•••"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. Bank Transfer Details layout */}
                          {paymentMethod === 'transfer' && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-955/50 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs space-y-3 flex-1 flex flex-col justify-center">
                              <p className="font-bold text-slate-800 dark:text-slate-250">Datos para transferencia bancaria directa:</p>
                              <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
                                <p><span className="text-slate-400">Banco:</span> Banco Unión S.A.</p>
                                <p><span className="text-slate-400">Titular de Cuenta:</span> U.A.G.R.M. - RECAUDACIONES</p>
                                <p><span className="text-slate-400">Cuenta Corriente:</span> 1-2401832</p>
                                <p><span className="text-slate-400">NIT:</span> 1028391024</p>
                              </div>
                              <p className="text-slate-400">Una vez hecha la transferencia de Bs. 350.00, presione el botón de abajo para registrar la transacción y simular la aprobación administrativa.</p>
                            </div>
                          )}

                          {/* Submit Action */}
                          <button
                            type="submit"
                            disabled={paymentLoading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition cursor-pointer text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {paymentLoading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Proceder a Pago (Bs. 350.00)</span>
                              </>
                            )}
                          </button>

                        </form>
                      </div>
                    )}
                  </>
                )}

              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-3xl text-center space-y-3 shadow-sm flex-1 flex flex-col justify-center">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Selecciona un Postulante</h4>
            <p className="text-slate-450 text-sm max-w-sm mx-auto">Selecciona un postulante de la barra lateral para revisar su documentación física y procesar su pago.</p>
          </div>
        )}

      </div>
    </div>
  );
}
