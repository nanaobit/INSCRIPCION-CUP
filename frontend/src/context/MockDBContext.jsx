import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDBContext = createContext();

// Helper to generate registration numbers
const generateNroRegistro = (index) => {
  return `REG-2026-${String(index).padStart(4, '0')}`;
};

// Initial setup data
const INITIAL_CARRERAS = [
  { id: 'INF', nombre: 'Ingeniería Informática', descripcion: 'Desarrollo de software y computación científica.', cupos_max: 5, cupos_disponibles: 5 },
  { id: 'SIS', nombre: 'Ingeniería de Sistemas', descripcion: 'Gestión de proyectos tecnológicos y optimización.', cupos_max: 5, cupos_disponibles: 5 },
  { id: 'TEL', nombre: 'Ingeniería en Redes y Telecomunicaciones', descripcion: 'Redes, comunicaciones y conectividad global.', cupos_max: 5, cupos_disponibles: 5 }
];

const INITIAL_MATERIAS = [
  { id: 'COMP', sigla: 'INF-110', nombre: 'Computación', descripcion: 'Introducción a la programación y algoritmos.' },
  { id: 'MATE', sigla: 'MAT-101', nombre: 'Matemáticas', descripcion: 'Álgebra, funciones y cálculo básico.' },
  { id: 'ING', sigla: 'LIN-100', nombre: 'Inglés', descripcion: 'Comprensión lectora técnica e inglés básico.' },
  { id: 'FIS', sigla: 'FIS-102', nombre: 'Física', descripcion: 'Mecánica clásica y vectores.' }
];

const INITIAL_AULAS = [
  { id: 'A1', nombre: 'Aula 201 - Bloque FICCT', capacidad: 80, ubicacion: 'Piso 2' },
  { id: 'A2', nombre: 'Aula 202 - Bloque FICCT', capacidad: 80, ubicacion: 'Piso 2' },
  { id: 'A3', nombre: 'Laboratorio de Cómputo 1', capacidad: 45, ubicacion: 'Piso 1' },
  { id: 'A4', nombre: 'Auditorio FICCT', capacidad: 150, ubicacion: 'Planta Baja' }
];

const INITIAL_HORARIOS = [
  { id: 'H1', dia: 'Lunes a Viernes', hora_inicio: '07:30', hora_fin: '09:45', turno: 'Mañana' },
  { id: 'H2', dia: 'Lunes a Viernes', hora_inicio: '10:00', hora_fin: '12:15', turno: 'Mañana' },
  { id: 'H3', dia: 'Lunes a Viernes', hora_inicio: '14:00', hora_fin: '16:15', turno: 'Tarde' },
  { id: 'H4', dia: 'Lunes a Viernes', hora_inicio: '16:30', hora_fin: '18:45', turno: 'Tarde' }
];

const INITIAL_DOCENTES = [
  {
    codigo: 'DOC-101',
    nombre: 'Elena',
    apellido: 'Rojas Cabrera',
    ci: '4928123',
    correo: 'elena.rojas@ficct.uagrm.edu.bo',
    telefono: '72134567',
    especialidad: 'Matemáticas',
    tiene_maestria: true,
    tiene_diplomado: true,
    estado_contrato: 'CONTRATADO',
    fecha_creacion: '2026-01-15'
  },
  {
    codigo: 'DOC-102',
    nombre: 'Carlos',
    apellido: 'Mendoza Vargas',
    ci: '5384910',
    correo: 'carlos.mendoza@ficct.uagrm.edu.bo',
    telefono: '67482910',
    especialidad: 'Computación',
    tiene_maestria: true,
    tiene_diplomado: true,
    estado_contrato: 'CONTRATADO',
    fecha_creacion: '2026-01-20'
  },
  {
    codigo: 'DOC-103',
    nombre: 'Patricia',
    apellido: 'Suarez Roca',
    ci: '6192837',
    correo: 'patricia.suarez@ficct.uagrm.edu.bo',
    telefono: '78291029',
    especialidad: 'Inglés',
    tiene_maestria: true,
    tiene_diplomado: true,
    estado_contrato: 'CONTRATADO',
    fecha_creacion: '2026-02-10'
  },
  {
    codigo: 'DOC-104',
    nombre: 'Jorge',
    apellido: 'Ortiz Vaca',
    ci: '3928172',
    correo: 'jorge.ortiz@ficct.uagrm.edu.bo',
    telefono: '71029384',
    especialidad: 'Física',
    tiene_maestria: true,
    tiene_diplomado: false,
    estado_contrato: 'PENDIENTE',
    fecha_creacion: '2026-03-01'
  }
];

const INITIAL_POSTULANTES = [
  { ci: '9182736', nombres: 'Mateo', apellidos: 'Gómez Justiniano', fecha_nacimiento: '2008-05-14', sexo: 'M', direccion: 'Av. Bush 2do Anillo', telefono: '78945612', correo: 'mateo.gomez@gmail.com', colegio_procedencia: 'Colegio La Salle', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'SIS', carrera_opcion2: 'INF', fecha_registro: '2026-05-01T10:00:00Z' },
  { ci: '8273645', nombres: 'Sofía', apellidos: 'Flores Terrazas', fecha_nacimiento: '2007-09-22', sexo: 'F', direccion: 'Equipetrol Calle 8', telefono: '71234567', correo: 'sofia.flores@gmail.com', colegio_procedencia: 'Colegio Alemán', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'SIS', carrera_opcion2: 'TEL', fecha_registro: '2026-05-02T11:15:00Z' },
  { ci: '7364521', nombres: 'Lucas', apellidos: 'Pinto Melgar', fecha_nacimiento: '2008-01-30', sexo: 'M', direccion: 'Villa Primero de Mayo', telefono: '67891234', correo: 'lucas.pinto@hotmail.com', colegio_procedencia: 'Colegio San Agustín', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'INF', carrera_opcion2: 'SIS', fecha_registro: '2026-05-03T09:30:00Z' },
  { ci: '6452139', nombres: 'Valeria', apellidos: 'Salvatierra Alvis', fecha_nacimiento: '2007-12-05', sexo: 'F', direccion: 'Plan 3000 Curva de la Villa', telefono: '73456789', correo: 'valeria.salva@gmail.com', colegio_procedencia: 'C.E. Néstor Suárez', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'SIS', carrera_opcion2: 'INF', fecha_registro: '2026-05-04T15:45:00Z' },
  { ci: '5213948', nombres: 'Alejandro', apellidos: 'Vaca Pinto', fecha_nacimiento: '2008-03-18', sexo: 'M', direccion: 'Doble Vía La Guardia Km 6', telefono: '75678901', correo: 'ale.vaca@yahoo.com', colegio_procedencia: 'Colegio Don Bosco', ciudad: 'Montero', carrera_opcion1: 'SIS', carrera_opcion2: 'TEL', fecha_registro: '2026-05-05T14:20:00Z' },
  { ci: '4392817', nombres: 'Camila', apellidos: 'Justiniano Arteaga', fecha_nacimiento: '2007-07-09', sexo: 'F', direccion: 'Pampa de la Isla', telefono: '76890123', correo: 'camila.j@gmail.com', colegio_procedencia: 'Colegio Uboldi', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'SIS', carrera_opcion2: 'INF', fecha_registro: '2026-05-06T10:10:00Z' },
  { ci: '3829102', nombres: 'Bruno', apellidos: 'López Roca', fecha_nacimiento: '2008-02-27', sexo: 'M', direccion: 'Av. Banzer 5to Anillo', telefono: '71029384', correo: 'bruno.lopez@gmail.com', colegio_procedencia: 'Colegio Marista', ciudad: 'Santa Cruz de la Sierra', carrera_opcion1: 'INF', carrera_opcion2: 'TEL', fecha_registro: '2026-05-07T16:30:00Z' },
  { ci: '2910283', nombres: 'Natalia', apellidos: 'Ribera Cuellar', fecha_nacimiento: '2007-11-12', sexo: 'F', direccion: 'Cotoca Barrio San Martin', telefono: '62910293', correo: 'naty.ribera@outlook.com', colegio_procedencia: 'Colegio Josefina Bálsamo', ciudad: 'Cotoca', carrera_opcion1: 'TEL', carrera_opcion2: 'SIS', fecha_registro: '2026-05-08T08:50:00Z' }
];

// Helper functions to generate fresh structures statically
const getDefaultPostulantes = () => {
  return INITIAL_POSTULANTES.map((p, idx) => ({
    ...p,
    nro_registro: generateNroRegistro(idx + 1),
    estado_requisitos: idx < 6 ? 'APROBADO' : 'PENDIENTE',
    estado_pago: idx < 5 ? 'PAGADO' : 'PENDIENTE',
    estado_academico: 'PENDIENTE',
    estado_admision: 'PENDIENTE',
    promedio_final: 0
  }));
};

const getDefaultRequisitos = (posts) => {
  const reqs = {};
  posts.forEach((p, idx) => {
    reqs[p.nro_registro] = {
      titulo_bachiller: idx < 6,
      documento_identidad: idx < 6,
      otros_requisitos: idx < 6,
      observacion: idx < 6 ? 'Requisitos validados al ingresar.' : ''
    };
  });
  return reqs;
};

const getDefaultPagos = (posts) => {
  const pgs = {};
  posts.forEach((p, idx) => {
    pgs[p.nro_registro] = {
      monto: 350.00,
      concepto_pago: 'Curso Preuniversitario 2/2026',
      fecha: idx < 5 ? '2026-05-05T12:00:00Z' : '',
      metodo_pago: idx < 5 ? (idx % 2 === 0 ? 'QR Bancario' : 'Tarjeta de Crédito') : '',
      estado: idx < 5 ? 'COMPLETADO' : 'PENDIENTE'
    };
  });
  return pgs;
};

const getDefaultNotas = (posts) => {
  const nts = {};
  posts.forEach((p, idx) => {
    if (idx < 5) {
      nts[p.nro_registro] = {
        COMP: [80 - idx * 5, 85 - idx * 4, 90 - idx * 3],
        MATE: [75 - idx * 8, 70 - idx * 6, 85 - idx * 2],
        ING: [90, 85, 95],
        FIS: [70 - idx * 2, 75 - idx * 3, 80 - idx * 5]
      };
    } else {
      nts[p.nro_registro] = {
        COMP: [0, 0, 0],
        MATE: [0, 0, 0],
        ING: [0, 0, 0],
        FIS: [0, 0, 0]
      };
    }
  });
  return nts;
};

const DEFAULT_ASIGNACIONES = [
  { grupo: 'Grupo 1', materia: 'COMP', docente: 'Carlos Mendoza Vargas', aula: 'Laboratorio de Cómputo 1', horario: '07:30 - 09:45 (Lunes a Viernes)' },
  { grupo: 'Grupo 1', materia: 'MATE', docente: 'Elena Rojas Cabrera', aula: 'Aula 201 - Bloque FICCT', horario: '10:00 - 12:15 (Lunes a Viernes)' },
  { grupo: 'Grupo 1', materia: 'ING', docente: 'Patricia Suarez Roca', aula: 'Aula 202 - Bloque FICCT', horario: '14:00 - 16:15 (Lunes a Viernes)' },
  { grupo: 'Grupo 1', materia: 'FIS', docente: 'Jorge Ortiz Vaca', aula: 'Auditorio FICCT', horario: '16:30 - 18:45 (Lunes a Viernes)' }
];

const DEFAULT_BITACORA = [
  { id: 1, usuario: 'Administrador (admin)', modulo: 'SEGURIDAD', accion: 'Inicialización de Base de Datos', descripcion: 'Base de datos simulada creada con 8 postulantes iniciales y 4 docentes preestablecidos.', fecha_hora: '2026-05-31T20:50:00Z', tabla_afectada: 'varias', registro_afectado: 'todos' }
];

// Robust safe load helper
const safeLoad = (key, fallbackFunc) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate array or object isn't empty/corrupted
      if (parsed) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (!Array.isArray(parsed) && Object.keys(parsed).length > 0) return parsed;
      }
    }
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage, resetting...`, e);
  }
  return fallbackFunc();
};

export const MockDBProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ficct_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Calculate default post list first to avoid ordering dependencies
  const defaultPostList = getDefaultPostulantes();

  const [postulantes, setPostulantes] = useState(() => {
    return safeLoad('ficct_postulantes', () => defaultPostList);
  });

  const [requisitos, setRequisitos] = useState(() => {
    return safeLoad('ficct_requisitos', () => getDefaultRequisitos(postulantes || defaultPostList));
  });

  const [pagos, setPagos] = useState(() => {
    return safeLoad('ficct_pagos', () => getDefaultPagos(postulantes || defaultPostList));
  });

  const [docentes, setDocentes] = useState(() => {
    return safeLoad('ficct_docentes', () => INITIAL_DOCENTES);
  });

  const [carreras, setCarreras] = useState(() => {
    return safeLoad('ficct_carreras', () => INITIAL_CARRERAS);
  });

  const [evalConfig, setEvalConfig] = useState(() => {
    return safeLoad('ficct_eval_config', () => ({
      COMP: [30, 30, 40],
      MATE: [30, 30, 40],
      ING: [30, 30, 40],
      FIS: [30, 30, 40]
    }));
  });

  const [notas, setNotas] = useState(() => {
    return safeLoad('ficct_notas', () => getDefaultNotas(postulantes || defaultPostList));
  });

  const [bitacora, setBitacora] = useState(() => {
    return safeLoad('ficct_bitacora', () => DEFAULT_BITACORA);
  });

  const [asignacionesAcademicas, setAsignacionesAcademicas] = useState(() => {
    return safeLoad('ficct_asignaciones', () => DEFAULT_ASIGNACIONES);
  });

  // Save changes to localStorage on any state change
  useEffect(() => {
    if (postulantes) localStorage.setItem('ficct_postulantes', JSON.stringify(postulantes));
  }, [postulantes]);

  useEffect(() => {
    if (requisitos) localStorage.setItem('ficct_requisitos', JSON.stringify(requisitos));
  }, [requisitos]);

  useEffect(() => {
    if (pagos) localStorage.setItem('ficct_pagos', JSON.stringify(pagos));
  }, [pagos]);

  useEffect(() => {
    if (docentes) localStorage.setItem('ficct_docentes', JSON.stringify(docentes));
  }, [docentes]);

  useEffect(() => {
    if (carreras) localStorage.setItem('ficct_carreras', JSON.stringify(carreras));
  }, [carreras]);

  useEffect(() => {
    if (evalConfig) localStorage.setItem('ficct_eval_config', JSON.stringify(evalConfig));
  }, [evalConfig]);

  useEffect(() => {
    if (notas) localStorage.setItem('ficct_notas', JSON.stringify(notas));
  }, [notas]);

  useEffect(() => {
    if (bitacora) localStorage.setItem('ficct_bitacora', JSON.stringify(bitacora));
  }, [bitacora]);

  useEffect(() => {
    if (asignacionesAcademicas) localStorage.setItem('ficct_asignaciones', JSON.stringify(asignacionesAcademicas));
  }, [asignacionesAcademicas]);

  // Write log to Bitacora
  const addLog = (modulo, accion, descripcion, tabla_afectada = '', registro_afectado = '') => {
    const userString = currentUser ? `${currentUser.nombre} ${currentUser.apellido} (${currentUser.username})` : 'Invitado/Postulante';
    const newLog = {
      id: Date.now(),
      usuario: userString,
      modulo,
      accion,
      descripcion,
      fecha_hora: new Date().toISOString(),
      tabla_afectada,
      registro_afectado
    };
    setBitacora(prev => [newLog, ...prev]);
  };

  // Auth Functions
  const login = (username, password) => {
    if (!username || !password) {
      return { success: false, message: 'Usuario y contraseña obligatorios.' };
    }

    if (username === 'admin' && password === 'admin123') {
      const user = { username: 'admin', nombre: 'Administrador', apellido: 'General', rol: 'ADMIN' };
      setCurrentUser(user);
      localStorage.setItem('ficct_user', JSON.stringify(user));
      const logMsg = 'Inicio de sesión exitoso.';
      const newLog = {
        id: Date.now(),
        usuario: 'Administrador General (admin)',
        modulo: 'AUTENTICACIÓN',
        accion: 'Inicio de Sesión',
        descripcion: logMsg,
        fecha_hora: new Date().toISOString(),
        tabla_afectada: 'Usuario',
        registro_afectado: 'admin'
      };
      setBitacora(prev => [newLog, ...prev]);
      return { success: true, user };
    }

    // Check if it's a teacher
    const docente = docentes.find(d => d.correo.split('@')[0] === username && d.ci === password);
    if (docente) {
      const user = { username: username, nombre: docente.nombre, apellido: docente.apellido, rol: 'DOCENTE', codigo: docente.codigo, especialidad: docente.especialidad };
      setCurrentUser(user);
      localStorage.setItem('ficct_user', JSON.stringify(user));
      const logMsg = `Docente asignado inicia sesión: ${docente.especialidad}.`;
      const newLog = {
        id: Date.now(),
        usuario: `${docente.nombre} ${docente.apellido} (${username})`,
        modulo: 'AUTENTICACIÓN',
        accion: 'Inicio de Sesión Docente',
        descripcion: logMsg,
        fecha_hora: new Date().toISOString(),
        tabla_afectada: 'docente',
        registro_afectado: docente.codigo
      };
      setBitacora(prev => [newLog, ...prev]);
      return { success: true, user };
    }

    return { success: false, message: 'Credenciales incorrectas.' };
  };

  const logout = () => {
    addLog('AUTENTICACIÓN', 'Cierre de Sesión', 'El usuario cerró sesión en el panel.');
    setCurrentUser(null);
    localStorage.removeItem('ficct_user');
  };

  // Helper Averages
  const calculateSubjectAverage = (gradesList, subjectId) => {
    if (!gradesList || gradesList.length === 0) return 0;
    const percentages = evalConfig[subjectId] || [30, 30, 40];
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += (gradesList[i] || 0) * (percentages[i] / 100);
    }
    return Math.round(sum * 100) / 100;
  };

  const calculateOverallAverage = (studentGrades) => {
    if (!studentGrades) return 0;
    const compAvg = calculateSubjectAverage(studentGrades.COMP, 'COMP');
    const mateAvg = calculateSubjectAverage(studentGrades.MATE, 'MATE');
    const ingAvg = calculateSubjectAverage(studentGrades.ING, 'ING');
    const fisAvg = calculateSubjectAverage(studentGrades.FIS, 'FIS');

    return Math.round(((compAvg + mateAvg + ingAvg + fisAvg) / 4) * 100) / 100;
  };

  // Admission System Logic (Quotas algorithm)
  const runAdmissionAlgorithm = (currPostulantes, currNotas, currCarreras) => {
    // Reset quotas dynamically first
    const resetCarreras = INITIAL_CARRERAS.map(c => ({
      ...c,
      cupos_disponibles: c.cupos_max
    }));

    // Filter students: Who is APROBADO (average >= 60) AND PAGADO AND REQUISITOS APROBADOS
    const activeAprobados = currPostulantes
      .map(p => {
        const studentGrades = currNotas[p.nro_registro];
        const avg = calculateOverallAverage(studentGrades);
        return {
          ...p,
          promedio_final: avg,
          estado_academico: (p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO') 
            ? (avg >= 60 ? 'APROBADO' : 'REPROBADO') 
            : 'PENDIENTE'
        };
      })
      .filter(p => p.estado_academico === 'APROBADO')
      .sort((a, b) => b.promedio_final - a.promedio_final);

    // Track admissions map
    const admissionsMap = {};

    activeAprobados.forEach(p => {
      const op1 = p.carrera_opcion1;
      const op2 = p.carrera_opcion2;

      // Find in carreras
      const c1 = resetCarreras.find(c => c.id === op1);
      if (c1 && c1.cupos_disponibles > 0) {
        c1.cupos_disponibles -= 1;
        admissionsMap[p.nro_registro] = {
          estado: 'ADMITIDO_OPCION1',
          carrera: op1
        };
      } else {
        const c2 = resetCarreras.find(c => c.id === op2);
        if (c2 && c2.cupos_disponibles > 0) {
          c2.cupos_disponibles -= 1;
          admissionsMap[p.nro_registro] = {
            estado: 'ADMITIDO_OPCION2',
            carrera: op2
          };
        } else {
          admissionsMap[p.nro_registro] = {
            estado: 'SIN_CUPO',
            carrera: null
          };
        }
      }
    });

    // Rebuild careers
    setCarreras(resetCarreras);

    // Update all applicants' admissions state
    setPostulantes(prev => prev.map(p => {
      const studentGrades = currNotas[p.nro_registro];
      const avg = calculateOverallAverage(studentGrades);
      
      const isEligible = p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO';
      const acadState = isEligible ? (avg >= 60 ? 'APROBADO' : 'REPROBADO') : 'PENDIENTE';
      
      let admState = 'PENDIENTE';
      if (isEligible) {
        if (acadState === 'REPROBADO') {
          admState = 'RECHAZADO';
        } else if (admissionsMap[p.nro_registro]) {
          admState = admissionsMap[p.nro_registro].estado;
        } else {
          admState = 'PENDIENTE';
        }
      }

      return {
        ...p,
        promedio_final: avg,
        estado_academico: acadState,
        estado_admision: admState
      };
    }));
  };

  // Run the algorithm once when mounted, to synchronize admissions based on initial mock grades
  useEffect(() => {
    if (postulantes && notas && carreras) {
      runAdmissionAlgorithm(postulantes, notas, carreras);
    }
  }, []);

  // Postulante CRUD
  const registerPostulante = (data) => {
    // Validations
    if (!data.ci || !data.nombres || !data.apellidos || !data.correo || !data.carrera_opcion1 || !data.carrera_opcion2) {
      return { success: false, message: 'Todos los campos requeridos con asterisco (*) son obligatorios.' };
    }

    const duplicate = postulantes.some(p => p.ci === data.ci);
    if (duplicate) {
      return { success: false, message: `Ya existe un postulante registrado con el documento de identidad CI: ${data.ci}.` };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.correo)) {
      return { success: false, message: 'El correo electrónico proporcionado no tiene un formato válido.' };
    }

    const nextIndex = postulantes.length + 1;
    const newReg = generateNroRegistro(nextIndex);

    const newPostulante = {
      ...data,
      nro_registro: newReg,
      estado_requisitos: 'PENDIENTE',
      estado_pago: 'PENDIENTE',
      estado_academico: 'PENDIENTE',
      estado_admision: 'PENDIENTE',
      promedio_final: 0,
      fecha_registro: new Date().toISOString()
    };

    // Update requirements
    const newRequisitos = { ...requisitos };
    newRequisitos[newReg] = {
      titulo_bachiller: false,
      documento_identidad: false,
      otros_requisitos: false,
      observacion: 'Registrado en el sistema. Documentación física pendiente de revisión.'
    };

    // Update payments
    const newPagos = { ...pagos };
    newPagos[newReg] = {
      monto: 350.00,
      concepto_pago: 'Curso Preuniversitario 2/2026',
      fecha: '',
      metodo_pago: '',
      estado: 'PENDIENTE'
    };

    // Update grades
    const newNotas = { ...notas };
    newNotas[newReg] = {
      COMP: [0, 0, 0],
      MATE: [0, 0, 0],
      ING: [0, 0, 0],
      FIS: [0, 0, 0]
    };

    const updatedPostulantes = [...postulantes, newPostulante];

    setRequisitos(newRequisitos);
    setPagos(newPagos);
    setNotas(newNotas);
    setPostulantes(updatedPostulantes);

    addLog('REGISTRO', 'Registrar Postulante', `Nuevo postulante inscrito: ${data.nombres} ${data.apellidos} (CI: ${data.ci}).`, 'postulante', newReg);
    
    // Rerun admission engine
    runAdmissionAlgorithm(updatedPostulantes, newNotas, carreras);

    return { success: true, message: 'Postulante registrado exitosamente.', nro_registro: newReg };
  };

  const updatePostulante = (nro_registro, updatedData) => {
    if (!updatedData.ci || !updatedData.nombres || !updatedData.apellidos || !updatedData.correo) {
      return { success: false, message: 'Todos los campos requeridos son obligatorios.' };
    }

    const duplicate = postulantes.some(p => p.ci === updatedData.ci && p.nro_registro !== nro_registro);
    if (duplicate) {
      return { success: false, message: `Ya existe otro postulante con la cédula de identidad CI: ${updatedData.ci}.` };
    }

    const updated = postulantes.map(p => {
      if (p.nro_registro === nro_registro) {
        return { ...p, ...updatedData };
      }
      return p;
    });

    setPostulantes(updated);
    addLog('REGISTRO', 'Modificar Postulante', `Se actualizaron los datos personales de: ${updatedData.nombres} ${updatedData.apellidos}.`, 'postulante', nro_registro);
    
    runAdmissionAlgorithm(updated, notas, carreras);

    return { success: true, message: 'Datos de postulante modificados con éxito.' };
  };

  const deletePostulante = (nro_registro) => {
    const target = postulantes.find(p => p.nro_registro === nro_registro);
    if (!target) return { success: false, message: 'Postulante no encontrado.' };

    const updated = postulantes.filter(p => p.nro_registro !== nro_registro);
    
    const newRequisitos = { ...requisitos };
    delete newRequisitos[nro_registro];

    const newPagos = { ...pagos };
    delete newPagos[nro_registro];

    const newNotas = { ...notas };
    delete newNotas[nro_registro];

    setRequisitos(newRequisitos);
    setPagos(newPagos);
    setNotas(newNotas);
    setPostulantes(updated);

    addLog('REGISTRO', 'Eliminar Postulante', `Se eliminó el registro del postulante: ${target.nombres} ${target.apellidos} (Registro: ${nro_registro}).`, 'postulante', nro_registro);

    runAdmissionAlgorithm(updated, newNotas, carreras);

    return { success: true, message: 'Postulante de baja del sistema de manera definitiva.' };
  };

  // Requisitos & Pagos Action Handlers
  const verifyRequisitos = (nro_registro, reqsData) => {
    const updatedRequisitos = { ...requisitos };
    updatedRequisitos[nro_registro] = reqsData;
    setRequisitos(updatedRequisitos);

    const isApproved = reqsData.titulo_bachiller && reqsData.documento_identidad;
    const targetPostulante = postulantes.find(p => p.nro_registro === nro_registro);

    const updatedPostulantes = postulantes.map(p => {
      if (p.nro_registro === nro_registro) {
        return {
          ...p,
          estado_requisitos: isApproved ? 'APROBADO' : 'PENDIENTE'
        };
      }
      return p;
    });

    setPostulantes(updatedPostulantes);
    addLog('ADMISIONES', 'Verificar Requisitos', `Se auditaron los requisitos físicos para ${targetPostulante.nombres} ${targetPostulante.apellidos}. Estado: ${isApproved ? 'APROBADO' : 'OBSERVADO'}.`, 'requisito_postulante', nro_registro);

    runAdmissionAlgorithm(updatedPostulantes, notas, carreras);

    return { success: true, message: 'Requisitos actualizados correctamente.' };
  };

  const processPago = (nro_registro, paymentDetails) => {
    const updatedPagos = { ...pagos };
    updatedPagos[nro_registro] = {
      monto: 350.00,
      concepto_pago: 'Curso Preuniversitario 2/2026',
      fecha: new Date().toISOString(),
      metodo_pago: paymentDetails.metodo_pago,
      estado: 'COMPLETADO'
    };
    setPagos(updatedPagos);

    const targetPostulante = postulantes.find(p => p.nro_registro === nro_registro);
    const updatedPostulantes = postulantes.map(p => {
      if (p.nro_registro === nro_registro) {
        return {
          ...p,
          estado_pago: 'PAGADO'
        };
      }
      return p;
    });

    setPostulantes(updatedPostulantes);
    addLog('PAGOS', 'Registrar Pago Pasarela', `Pago recibido de ${targetPostulante.nombres} ${targetPostulante.apellidos} vía ${paymentDetails.metodo_pago} por Bs. 350.00.`, 'pago', nro_registro);

    runAdmissionAlgorithm(updatedPostulantes, notas, carreras);

    return { success: true, message: 'Pago registrado exitosamente.' };
  };

  // Grade updates
  const updateNotas = (nro_registro, subject, newGrades) => {
    const invalid = newGrades.some(g => g < 0 || g > 100 || isNaN(g));
    if (invalid) {
      return { success: false, message: 'Las calificaciones deben ser números válidos entre 0 y 100.' };
    }

    const updatedNotas = { ...notas };
    updatedNotas[nro_registro] = {
      ...updatedNotas[nro_registro],
      [subject]: newGrades
    };
    setNotas(updatedNotas);

    const target = postulantes.find(p => p.nro_registro === nro_registro);
    addLog('EVALUACIONES', 'Registrar Notas', `Notas actualizadas en ${subject} para ${target.nombres} ${target.apellidos}: [${newGrades.join(', ')}].`, 'nota_evaluacion', nro_registro);

    runAdmissionAlgorithm(postulantes, updatedNotas, carreras);

    return { success: true, message: 'Calificaciones actualizadas y promedio recalculado con éxito.' };
  };

  // Percentage Configurations Updates
  const updateEvalConfig = (subject, newPercentages) => {
    const sum = newPercentages.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      return { success: false, message: 'La suma de los porcentajes de evaluación debe ser estrictamente igual al 100%.' };
    }

    const updatedConfig = {
      ...evalConfig,
      [subject]: newPercentages
    };
    setEvalConfig(updatedConfig);

    addLog('CONFIGURACIÓN', 'Ponderación Evaluaciones', `Se reajustó la ponderación de ${subject} a [${newPercentages.map(p => p + '%').join(', ')}].`, 'evaluacion');

    runAdmissionAlgorithm(postulantes, notas, carreras);

    return { success: true, message: 'Configuración de ponderaciones modificada. Promedios globales recalculados.' };
  };

  // Docentes Administration
  const updateDocenteRequisitos = (codigo, data) => {
    const updatedDocentes = docentes.map(d => {
      if (d.codigo === codigo) {
        const complies = data.tiene_maestria && data.tiene_diplomado;
        return {
          ...d,
          ...data,
          estado_contrato: complies ? 'CONTRATADO' : 'PENDIENTE'
        };
      }
      return d;
    });

    setDocentes(updatedDocentes);
    const target = docentes.find(d => d.codigo === codigo);
    addLog('DOCENTES', 'Actualizar Requisitos', `Se actualizaron los requerimientos académicos del docente ${target.nombre} ${target.apellido}.`, 'docente', codigo);
    return { success: true, message: 'Requisitos y estado de contratación actualizados.' };
  };

  const registerDocente = (data) => {
    if (!data.ci || !data.nombre || !data.apellido || !data.correo || !data.especialidad) {
      return { success: false, message: 'Todos los campos marcados con asterisco (*) son requeridos.' };
    }

    if (docentes.some(d => d.ci === data.ci)) {
      return { success: false, message: 'El CI docente ya existe registrado.' };
    }

    const code = `DOC-${docentes.length + 101}`;
    const complies = data.tiene_maestria && data.tiene_diplomado;
    const newDocente = {
      codigo: code,
      ...data,
      estado_contrato: complies ? 'CONTRATADO' : 'PENDIENTE',
      fecha_creacion: new Date().toISOString().split('T')[0]
    };

    setDocentes(prev => [...prev, newDocente]);
    addLog('DOCENTES', 'Registrar Docente', `Nuevo docente registrado en el sistema: ${data.nombre} ${data.apellido}.`, 'docente', code);
    return { success: true, message: 'Docente registrado con éxito.' };
  };

  const deleteDocente = (codigo) => {
    const target = docentes.find(d => d.codigo === codigo);
    if (!target) return { success: false, message: 'Docente no encontrado.' };

    setDocentes(prev => prev.filter(d => d.codigo !== codigo));
    setAsignacionesAcademicas(prev => prev.map(a => {
      if (a.docente === `${target.nombre} ${target.apellido}`) {
        return { ...a, docente: 'Sin Docente Asignado' };
      }
      return a;
    }));

    addLog('DOCENTES', 'Eliminar Docente', `Se dio de baja al docente ${target.nombre} ${target.apellido}.`, 'docente', codigo);
    return { success: true, message: 'Docente dado de baja correctamente.' };
  };

  // Academic Assignments
  const assignAcademicSetting = (assignmentData) => {
    const teacherName = assignmentData.docente;
    
    if (teacherName !== 'Sin Docente Asignado') {
      const activeDocente = docentes.find(d => `${d.nombre} ${d.apellido}` === teacherName);
      if (activeDocente && activeDocente.estado_contrato !== 'CONTRATADO') {
        return { success: false, message: `El docente seleccionado no cumple con los requisitos de contratación (Maestría y Diplomado) y no puede impartir clases.` };
      }

      const otherAssignments = asignacionesAcademicas.filter(a => a.docente === teacherName && a.grupo !== assignmentData.grupo);
      const uniqueGroups = new Set(otherAssignments.map(a => a.grupo));
      uniqueGroups.add(assignmentData.grupo);

      if (uniqueGroups.size > 4) {
        return { success: false, message: `El docente ${teacherName} ya se encuentra asignado al límite máximo de 4 grupos.` };
      }
    }

    const exists = asignacionesAcademicas.some(a => a.grupo === assignmentData.grupo && a.materia === assignmentData.materia);

    let updated;
    if (exists) {
      updated = asignacionesAcademicas.map(a => {
        if (a.grupo === assignmentData.grupo && a.materia === assignmentData.materia) {
          return { ...a, ...assignmentData };
        }
        return a;
      });
    } else {
      updated = [...asignacionesAcademicas, assignmentData];
    }

    setAsignacionesAcademicas(updated);
    addLog('ASIGNACIÓN ACADÉMICA', 'Asignar Horario/Docente', `Se actualizó la carga académica para ${assignmentData.grupo} - ${assignmentData.materia}: Docente: ${assignmentData.docente}, Aula: ${assignmentData.aula}.`, 'asignacion_academica');

    return { success: true, message: 'Carga académica del grupo actualizada correctamente.' };
  };

  // Dynamic Grouping Algorithm
  const getCalculatedGroups = () => {
    const enrolledStudents = postulantes.filter(p => p.estado_pago === 'PAGADO' && p.estado_requisitos === 'APROBADO');
    const totalCount = enrolledStudents.length;

    const groupCount = Math.max(1, Math.ceil(totalCount / 70));
    
    const calculatedGroupsList = [];
    for (let i = 1; i <= groupCount; i++) {
      const groupName = `Grupo ${i}`;
      const start = (i - 1) * 70;
      const end = Math.min(start + 70, totalCount);
      const groupStudents = enrolledStudents.slice(start, end);

      calculatedGroupsList.push({
        nombre: groupName,
        cantidad_inscritos: groupStudents.length,
        cupo_maximo: 70,
        cupo_disponible: 70 - groupStudents.length,
        estudiantes: groupStudents
      });
    }

    return {
      totalInscritos: totalCount,
      cantidadGrupos: groupCount,
      grupos: calculatedGroupsList
    };
  };

  return (
    <MockDBContext.Provider
      value={{
        currentUser,
        postulantes,
        requisitos,
        pagos,
        docentes,
        carreras,
        materias: INITIAL_MATERIAS,
        aulas: INITIAL_AULAS,
        horarios: INITIAL_HORARIOS,
        evalConfig,
        notas,
        bitacora,
        asignacionesAcademicas,
        
        login,
        logout,
        registerPostulante,
        updatePostulante,
        deletePostulante,
        verifyRequisitos,
        processPago,
        updateNotas,
        updateEvalConfig,
        updateDocenteRequisitos,
        registerDocente,
        deleteDocente,
        assignAcademicSetting,
        getCalculatedGroups,
        calculateSubjectAverage,
        calculateOverallAverage
      }}
    >
      {children}
    </MockDBContext.Provider>
  );
};

export const useMockDB = () => {
  const context = useContext(MockDBContext);
  if (!context) {
    throw new Error('useMockDB must be used within a MockDBProvider');
  }
  return context;
};
