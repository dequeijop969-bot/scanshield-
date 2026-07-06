import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Sun,
  Moon,
  GraduationCap,
  User,
  ChevronRight,
  LogOut,
  Diamond,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStudentMode } from "@/lib/useStudentMode";
import StudentModeModal from "@/components/StudentModeModal";

export default function SettingsMenu({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const { isStudent, deactivate } = useStudentMode();
  const { user, isAuthenticated, logout } = useAuth();
  const menuRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleStudentToggle = () => {
    if (isStudent) {
      deactivate();
    } else {
      setOpen(false);
      setStudentModalOpen(true);
    }
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : null;

  return (
    <>
      <div className="relative ml-2" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`p-2 rounded-lg transition-all duration-200 ${
            open
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Configurações"
          aria-label="Abrir configurações"
          aria-expanded={open}
        >
          <Settings className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Perfil no topo */}
              {isAuthenticated && user ? (
                <Link
                  to="/Profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center">
                      <span className="text-sm font-black text-foreground/80">{initials}</span>
                    </div>
                    {isStudent && (
                      <span className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-md bg-emerald-500 flex items-center justify-center border-2 border-card">
                        <GraduationCap className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isStudent ? "Estudante verificado" : "Ver meu perfil"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Entrar</p>
                    <p className="text-xs text-muted-foreground">Acesse sua conta</p>
                  </div>
                </Link>
              )}

              {/* Preferências */}
              <div className="px-4 pt-3 pb-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preferências
                </span>
              </div>

              {/* Tema — switch inline */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-blue-300" />
                    ) : (
                      <Sun className="w-4 h-4 text-yellow-400" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Tema</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isDark ? "Escuro" : "Claro"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  role="switch"
                  aria-checked={isDark}
                  aria-label="Alternar tema"
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    isDark ? "bg-foreground/20" : "bg-foreground/10"
                  }`}
                >
                  <motion.span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                    animate={{ x: isDark ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  >
                    {isDark ? (
                      <Moon className="w-2.5 h-2.5 text-blue-300" />
                    ) : (
                      <Sun className="w-2.5 h-2.5 text-yellow-400" />
                    )}
                  </motion.span>
                </button>
              </div>

              {/* Modo estudante — switch inline */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isStudent ? "bg-emerald-500/15" : "bg-foreground/5"
                    }`}
                  >
                    <GraduationCap
                      className={`w-4 h-4 ${isStudent ? "text-emerald-400" : "text-muted-foreground"}`}
                    />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      Modo estudante
                      {isStudent && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isStudent ? "Ativo e verificado" : "Requer código estudantil"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStudentToggle}
                  role="switch"
                  aria-checked={isStudent}
                  aria-label="Alternar modo estudante"
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    isStudent ? "bg-emerald-500" : "bg-foreground/10"
                  }`}
                >
                  <motion.span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background border border-border shadow-sm"
                    animate={{ x: isStudent ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                </button>
              </div>

              {/* Atalhos */}
              <div className="border-t border-border mt-2">
                <Link
                  to="/Premium"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-foreground"
                >
                  <span className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                    <Diamond className="w-4 h-4 text-yellow-400" />
                  </span>
                  <span className="flex-1 font-medium">Planos e assinatura</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>

              {/* Sair */}
              {isAuthenticated && (
                <div className="border-t border-border">
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm font-medium text-red-400"
                  >
                    <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </span>
                    Sair da conta
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StudentModeModal open={studentModalOpen} onClose={() => setStudentModalOpen(false)} />
    </>
  );
}
