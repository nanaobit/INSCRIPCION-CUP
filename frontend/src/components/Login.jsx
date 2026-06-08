import React, { useState } from 'react';
import { useMockDB } from '../context/MockDBContext';
import { Lock, User, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useMockDB();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }

    setLoading(true);
    
    // Artificial slight delay for micro-animation feel
    setTimeout(() => {
      const res = login(username.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Decorative background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/60">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse-soft">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">FICCT Preuniversitario</h2>
          <p className="text-slate-400 text-xs mt-1 font-light uppercase tracking-widest">Portal Administrativo</p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Cuentas de Acceso:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><span className="text-blue-400 font-mono">admin</span> / <span className="font-mono">admin123</span> (Administrador)</li>
            <li><span className="text-indigo-400 font-mono">carlos.mendoza</span> / <span className="font-mono">5384910</span> (Docente Computación)</li>
            <li><span className="text-indigo-400 font-mono">elena.rojas</span> / <span className="font-mono">4928123</span> (Docente Matemáticas)</li>
          </ul>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 rounded-2xl flex items-start space-x-3 text-red-200 text-sm animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 ml-1">
              Usuario <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. admin"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <button 
                type="button" 
                onClick={() => setError('Contacta al Administrador del Sistema de la FICCT en decanato.')} 
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                ¿Olvidó la contraseña?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-600">
          U.A.G.R.M. © {new Date().getFullYear()} • Facultad de Ingeniería de Ciencias de la Computación y Telecomunicaciones
        </p>
      </div>
    </div>
  );
}
