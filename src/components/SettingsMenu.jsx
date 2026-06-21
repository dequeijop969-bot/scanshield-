import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Settings, Sun, Moon, GraduationCap, X, Check, User } from "lucide-react";

const STUDENT_CODE = "zc&t0hieSK9h/|>Z=9w1";
const STUDENT_KEY = "scanshield_student_mode";

export default function SettingsMenu({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [showStudentInput, setShowStudentInput] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [isStudent, setIsStudent] = useState(() => localStorage.getItem(STUDENT_KEY) === "true");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setShowStudentInput(false);
        setCode("");
        setCodeError(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleStudentClick = () => {
    if (isStudent) {
      localStorage.removeItem(STUDENT_KEY);
      setIsStudent(false);
      return;
    }
    setShowStudentInput(true);
  };

  const handleCodeSubmit = () => {
    if (code === STUDENT_CODE) {
      localStorage.setItem(STUDENT_KEY, "true");
      setIsStudent(true);
      setShowStudentInput(false);
      setCode("");
      setCodeError(false);
      setOpen(false);
    } else {
      setCodeError(true);
    }
  };

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        onClick={() => { setOpen(o => !o); setShowStudentInput(false); setCode(""); setCodeError(false); }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Configurações"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurações</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => { onToggleTheme(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span>{theme === "dark" ? "Mudar para claro" : "Mudar para escuro"}</span>
          </button>

          {/* Student mode */}
          <div className="border-t border-border">
            {!showStudentInput ? (
              <button
                onClick={handleStudentClick}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
              >
                <GraduationCap className={`w-4 h-4 ${isStudent ? "text-emerald-400" : "text-muted-foreground"}`} />
                <span className="flex-1 text-left">
                  {isStudent ? "Modo estudante ativo" : "Usar como estudante"}
                </span>
                {isStudent && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Código estudantil</span>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value); setCodeError(false); }}
                  onKeyDown={e => e.key === "Enter" && handleCodeSubmit()}
                  placeholder="Digite o código..."
                  className={`w-full bg-input border ${codeError ? "border-red-500" : "border-border"} rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring`}
                  autoFocus
                />
                {codeError && <p className="text-xs text-red-400">Código inválido. Tente novamente.</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCodeSubmit}
                    className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => { setShowStudentInput(false); setCode(""); setCodeError(false); }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Meu Perfil */}
          <div className="border-t border-border">
            <Link
              to="/Profile"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-foreground"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Meu Perfil</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}