import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const planKey = user?.is_premium ? (user?.plan_name?.toLowerCase() || "iniciante") : null;
  const plan = planKey && PLAN_STYLES[planKey] ? PLAN_STYLES[planKey] : null;

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
