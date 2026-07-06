import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, ShieldCheck, Sparkles, BadgeCheck, Loader2 } from "lucide-react";
import { useStudentMode } from "@/lib/useStudentMode";

const BENEFITS = [
  { icon: ShieldCheck, text: "Análises com prioridade educacional" },
  { icon: Sparkles, text: "Recursos exclusivos para aprendizado" },
  { icon: BadgeCheck, text: "Selo de estudante verificado no perfil" },
];

export default function StudentModeModal({ open, onClose }) {
  const { activate } = useStudentMode();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setCode("");
    setError(false);
    setVerifying(false);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!code.trim() || verifying) return;
    setVerifying(true);
    setError(false);

    // Pequeno delay para dar sensação de verificação real
    setTimeout(() => {
      const ok = activate(code.trim());
      setVerifying(false);
      if (ok) {
        setSuccess(true);
        setTimeout(handleClose, 1400);
      } else {
        setError(true);
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Ativar modo estudante"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mb-5"
                >
                  <BadgeCheck className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-black tracking-tight text-foreground mb-1.5">
                  Modo estudante ativado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seus benefícios estudantis já estão disponíveis.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-400/15 to-emerald-500/5 border-b border-emerald-400/20">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80">
                        Verificação
                      </span>
                      <h3 className="text-lg font-black tracking-tight text-foreground">
                        Modo Estudante
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Benefits */}
                  <ul className="space-y-2.5 mb-5">
                    {BENEFITS.map((b, i) => (
                      <motion.li
                        key={b.text}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="flex items-center gap-3 text-sm text-foreground/80"
                      >
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <b.icon className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                        {b.text}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Input */}
                  <label
                    htmlFor="student-code"
                    className="block text-xs font-semibold text-muted-foreground mb-2"
                  >
                    Código estudantil
                  </label>
                  <input
                    id="student-code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                        handleSubmit();
                      }
                    }}
                    placeholder="Insira o código fornecido pela sua instituição"
                    className={`w-full bg-input border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:ring-2 ${
                      error
                        ? "border-red-500/60 focus:ring-red-500/30"
                        : "border-border focus:ring-emerald-400/30 focus:border-emerald-400/50"
                    }`}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 mt-2"
                      >
                        Código inválido. Verifique com sua instituição e tente novamente.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2.5 mt-5">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!code.trim() || verifying}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar código"
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground/60 text-center mt-4 text-pretty">
                    O código estudantil é distribuído por instituições parceiras do ScanShield.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
