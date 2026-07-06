import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ThemeSwitch";
import StudentModeModal from "@/components/StudentModeModal";
import { useStudentMode } from "@/lib/useStudentMode";
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
  Wrench,
  BadgeCheck,
  CalendarDays,
} from "lucide-react";

// Email do desenvolvedor — só ele vê o seletor de planos gratuito (modo de teste)
const DEV_EMAIL = "dequeijop969@gmail.com";

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

function formatMemberSince(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const { isStudent, deactivate } = useStudentMode();
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const planKey = user?.is_premium ? (user?.plan_name?.toLowerCase() || "iniciante") : null;
  const plan = planKey && PLAN_STYLES[planKey] ? PLAN_STYLES[planKey] : null;

  const isDev = user?.email === DEV_EMAIL;
  const [settingTestPlan, setSettingTestPlan] = useState(false);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "?";
  const memberSince = formatMemberSince(user?.created_at);

  const handleSetTestPlan = async (key) => {
    setSettingTestPlan(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/setTestPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ planKey: key }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao trocar plano");
      }
      window.location.reload();
    } catch (err) {
      console.error("Erro ao trocar plano de teste:", err);
      setSettingTestPlan(false);
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
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 mb-5">
            <UserCircle2 className="w-3 h-3" />
            Sua conta
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground mb-2 text-balance">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie sua conta, preferências e assinatura.
          </p>
        </div>

        {/* Cartão de identidade */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 pt-6 pb-5 flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.4, type: "spring", stiffness: 200 }}
              className="relative flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
                <span className="text-xl font-black text-foreground/80">{initials}</span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-lg bg-background border border-border">
                {isStudent ? (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                )}
              </span>
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {isStudent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-semibold text-emerald-400">
                    <BadgeCheck className="w-3 h-3" />
                    Estudante
                  </span>
                )}
                {plan ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-br ${plan.gradient} border ${plan.border} text-[11px] font-semibold ${plan.text}`}>
                    <plan.icon className={`w-3 h-3 ${plan.iconColor}`} />
                    {plan.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-[11px] font-semibold text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    Gratuito
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="border-t border-border px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              </div>
            </div>
            {memberSince && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Membro desde</p>
                  <p className="text-sm font-medium text-foreground capitalize">{memberSince}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plano em destaque */}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
          Assinatura
        </p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          {plan ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`relative px-6 py-6 bg-gradient-to-br ${plan.gradient} overflow-hidden`}
            >
              {planKey === "pro" && (
                <motion.div
                  className="absolute -top-6 -right-6 opacity-20"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="w-28 h-28 text-yellow-300" />
                </motion.div>
              )}
              <div className="relative flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-background/40 backdrop-blur flex items-center justify-center border ${plan.border}`}>
                  <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
                    Plano atual
                  </p>
                  <p className={`text-xl font-black tracking-tight ${plan.text}`}>{plan.label}</p>
                </div>
                <Link
                  to="/Premium"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-background/40 backdrop-blur text-foreground border border-border hover:bg-background/60 transition-colors whitespace-nowrap"
                >
                  Gerenciar
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="px-6 py-6 bg-foreground/[0.03] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                  Plano atual
                </p>
                <p className="text-xl font-black tracking-tight text-foreground/70">Gratuito</p>
              </div>
              <Link
                to="/Premium"
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/20 transition-colors whitespace-nowrap"
              >
                Fazer upgrade
              </Link>
            </div>
          )}

          {/* Modo estudante integrado à assinatura */}
          <div className="border-t border-border px-6 py-4 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isStudent ? "bg-emerald-500/15" : "bg-foreground/5"
              }`}
            >
              <GraduationCap
                className={`w-4 h-4 ${isStudent ? "text-emerald-400" : "text-muted-foreground"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                Modo estudante
                {isStudent && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />}
              </p>
              <p className="text-xs text-muted-foreground">
                {isStudent
                  ? "Ativo — benefícios estudantis habilitados"
                  : "Ative com o código da sua instituição"}
              </p>
            </div>
            {isStudent ? (
              <button
                onClick={deactivate}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-colors whitespace-nowrap"
              >
                Desativar
              </button>
            ) : (
              <button
                onClick={() => setStudentModalOpen(true)}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
              >
                Ativar
              </button>
            )}
          </div>
        </div>

        {/* Preferências */}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
          Preferências
        </p>
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
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
          Atalhos
        </p>
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
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
          Conta
        </p>
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

      {/* Modal do modo estudante */}
      <StudentModeModal open={studentModalOpen} onClose={() => setStudentModalOpen(false)} />

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
                aria-label="Fechar"
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
