import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ThemeSwitch";
import {
  Mail,
  LogOut,
  Trash2,
  Crown,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  X,
  Loader2,
  UserCircle2,
  BookOpen,
  History,
  ChevronRight,
  SunMoon,
  GraduationCap,
  Check,
  Wrench,
} from "lucide-react";

// Email do desenvolvedor — só ele vê o seletor de planos gratuito (modo de teste)
const DEV_EMAIL = "dequeijop969@gmail.com";

const STUDENT_CODE = "zc&t0hieSK9h/|>Z=9w1";
const STUDENT_KEY = "scanshield_student_mode";

const PLAN_STYLES = {
  iniciante: {
    label: "Iniciante",
    icon: ShieldCheck,
    gradient: "from-zinc-500/20 to-zinc-600/10",
    border: "border-zinc-400/30",
    text: "text-zinc-300",
    iconColor: "text-zinc-300",
  },
  intermediario: {
    label: "Intermediário",
    icon: Sparkles,
    gradient: "from-yellow-400/25 to-yellow-500/10",
    border: "border-yellow-400/50",
    text: "text-yellow-300",
    iconColor: "text-yellow-400",
  },
  pro: {
    label: "PRO",
    icon: Crown,
    gradient: "from-yellow-300/30 via-amber-400/20 to-yellow-500/10",
    border: "border-yellow-300/60",
    text: "text-yellow-200",
    iconColor: "text-yellow-300",
  },
};

const STUDENT_STYLE = {
  label: "Estudante",
  icon: GraduationCap,
  gradient: "from-emerald-400/25 to-emerald-500/10",
  border: "border-emerald-400/50",
  text: "text-emerald-300",
  iconColor: "text-emerald-400",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [isStudent, setIsStudent] = useState(() => localStorage.getItem(STUDENT_KEY) === "true");
  const [studentCode, setStudentCode] = useState("");
  const [studentError, setStudentError] = useState(false);
  const [showStudentInput, setShowStudentInput] = useState(false);

  const planKey = user?.is_premium ? (user?.plan_name?.toLowerCase() || "iniciante") : null;
  const basePlan = planKey && PLAN_STYLES[planKey] ? PLAN_STYLES[planKey] : null;
  // Modo estudante tem prioridade visual sobre o plano pago, já que dá benefícios especiais
  const plan = isStudent ? STUDENT_STYLE : basePlan;

  const isDev = user?.email === DEV_EMAIL;
  const [settingTestPlan, setSettingTestPlan] = useState(false);

  const handleSetTestPlan = async (key) => {
    setSettingTestPlan(true);
    try {
      const updates = key === null
        ? { is_premium: false, plan_name: null }
        : { is_premium: true, plan_name: key };
      await supabase.from("profiles").update(updates).eq("id", user.id);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao trocar plano de teste:", err);
      setSettingTestPlan(false);
    }
  };

  const handleStudentToggle = () => {
    if (isStudent) {
      localStorage.removeItem(STUDENT_KEY);
      setIsStudent(false);
      return;
    }
    setShowStudentInput(true);
  };

  const handleStudentSubmit = () => {
    if (studentCode === STUDENT_CODE) {
      localStorage.setItem(STUDENT_KEY, "true");
      setIsStudent(true);
      setShowStudentInput(false);
      setStudentCode("");
      setStudentError(false);
    } else {
      setStudentError(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setError("");
    if (confirmText !== "EXCLUIR") {
      setError('Digite "EXCLUIR" para confirmar.');
      return;
    }
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/deleteAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao excluir conta");
      }
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Não foi possível excluir a conta. Tente novamente.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1">Meu Perfil</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Gerencie sua conta e suas informações.
        </p>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
            <UserCircle2 className="w-12 h-12 text-foreground/80" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Card principal */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          {/* Plano em destaque */}
          {plan ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`relative px-6 py-6 bg-gradient-to-br ${plan.gradient} border-b ${plan.border} overflow-hidden`}
            >
              {planKey === "pro" && !isStudent && (
                <motion.div
                  className="absolute -top-6 -right-6 opacity-20"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="w-28 h-28 text-yellow-300" />
                </motion.div>
              )}
              <div className="relative flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.7, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 250, delay: 0.2 }}
                  className={`w-12 h-12 rounded-xl bg-background/40 backdrop-blur flex items-center justify-center border ${plan.border}`}
                >
                  <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                </motion.div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">
                    Plano atual
                  </p>
                  <p className={`text-xl font-black ${plan.text}`}>{plan.label}</p>
                  {isStudent && basePlan && (
                    <p className="text-xs text-foreground/50 mt-0.5">
                      Base: {basePlan.label}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="px-6 py-6 bg-foreground/[0.03] border-b border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/40 font-semibold">
                  Plano atual
                </p>
                <p className="text-xl font-black text-foreground/70">Gratuito</p>
              </div>
            </div>
          )}

          {/* Dados pessoais */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tema */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <SunMoon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Tema</p>
                <p className="text-xs text-muted-foreground">Claro ou escuro</p>
              </div>
            </div>
            <ThemeSwitch />
          </div>
        </div>

        {/* Atalhos */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <Link
            to="/Tutorial"
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">Tutorial</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="border-t border-border">
            <Link
              to="/History"
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">Histórico de análises</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Modo estudante */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">É estudante?</p>
                <p className="text-xs text-muted-foreground">
                  {isStudent ? "Modo estudante ativo" : "Ative com seu código estudantil"}
                </p>
              </div>
              {isStudent && (
                <button
                  onClick={handleStudentToggle}
                  className="text-xs text-red-400 hover:text-red-300 font-medium flex-shrink-0"
                >
                  Desativar
                </button>
              )}
            </div>

            {!isStudent && (
              <div className="mt-3">
                {!showStudentInput ? (
                  <button
                    onClick={handleStudentToggle}
                    className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    Ativar modo estudante
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentCode}
                        onChange={(e) => { setStudentCode(e.target.value); setStudentError(false); }}
                        onKeyDown={(e) => e.key === "Enter" && handleStudentSubmit()}
                        placeholder="Digite seu código estudantil..."
                        className={`flex-1 bg-input border ${studentError ? "border-red-500" : "border-border"} rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring`}
                        autoFocus
                      />
                      <Button
                        onClick={handleStudentSubmit}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                    {studentError && (
                      <p className="text-xs text-red-400">Código inválido. Verifique e tente novamente.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Testador de planos — só visível pro dev */}
        {isDev && (
          <div className="bg-card border border-dashed border-amber-400/40 rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-dashed border-amber-400/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Testar planos (modo dev)</p>
                  <p className="text-xs text-muted-foreground">Visível só para sua conta — sem cobrança</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-2">
              {[
                { key: null, label: "Gratuito" },
                { key: "iniciante", label: "Iniciante" },
                { key: "intermediario", label: "Intermediário" },
                { key: "pro", label: "PRO" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSetTestPlan(opt.key)}
                  disabled={settingTestPlan}
                  className={`text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                    (opt.key === planKey || (opt.key === null && !planKey))
                      ? "bg-amber-400/15 border-amber-400/50 text-amber-300"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ações da conta */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Sair da conta
          </button>
          <div className="border-t border-border">
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-500/10 transition-colors text-sm font-medium text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Excluir conta
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal de confirmação de exclusão */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <button
                onClick={() => { setConfirmOpen(false); setConfirmText(""); setError(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Excluir conta</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Essa ação é <strong>permanente</strong>. Seu perfil e todo o histórico de
              análises serão apagados e não poderão ser recuperados.
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Digite <strong className="text-foreground">EXCLUIR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring mb-2"
              placeholder="EXCLUIR"
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setConfirmOpen(false); setConfirmText(""); setError(""); }}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
