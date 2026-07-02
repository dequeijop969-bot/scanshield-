import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Users, Search, RefreshCw, Loader2, Crown, Sparkles,
  ShieldCheck, XCircle, Shield, ShieldOff, ChevronDown,
  ChevronUp, Mail, Calendar, Activity,
} from "lucide-react";

const PLAN_STYLES = {
  pro: { label: "PRO", color: "text-yellow-300", bg: "bg-yellow-400/10", border: "border-yellow-400/30", icon: Crown },
  intermediario: { label: "Inter.", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Sparkles },
  iniciante: { label: "Inic.", color: "text-zinc-300", bg: "bg-zinc-500/10", border: "border-zinc-400/20", icon: ShieldCheck },
  free: { label: "Grátis", color: "text-muted-foreground", bg: "bg-foreground/5", border: "border-border", icon: XCircle },
};

async function callAdmin(action, body = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch("/api/adminManageUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await callAdmin("listUsers");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSetPlan = async (userId, planKey) => {
    setActionLoading(`plan-${userId}-${planKey}`);
    setError(""); setSuccess("");
    try {
      await callAdmin("setPlan", { targetId: userId, planKey });
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, is_premium: planKey !== null, plan_name: planKey }
          : u
      ));
      setSuccess("Plano atualizado!");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) { setError(err.message); }
    setActionLoading(null);
  };

  const handleSetAdmin = async (userId, grant) => {
    setActionLoading(`admin-${userId}`);
    setError(""); setSuccess("");
    try {
      await callAdmin("setAdminRole", { targetId: userId, grantAdmin: grant });
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: grant ? "admin" : "user" } : u
      ));
      setSuccess(grant ? "Acesso admin concedido!" : "Acesso admin removido!");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) { setError(err.message); }
    setActionLoading(null);
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const planOptions = [
    { key: null, label: "Grátis" },
    { key: "iniciante", label: "Iniciante" },
    { key: "intermediario", label: "Intermediário" },
    { key: "pro", label: "PRO" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl overflow-hidden mb-8"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Todos os usuários</p>
            <p className="text-xs text-muted-foreground">{users.length} cadastrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por email..."
              className="bg-input border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-48"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-xl h-8 w-8 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mensagens */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-6 py-2 text-xs font-medium ${error ? "text-red-400 bg-red-400/5" : "text-emerald-400 bg-emerald-400/5"}`}
          >
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <motion.div
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground"
            >
              Carregando usuários...
            </motion.p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((user, i) => {
              const planKey = user.is_premium ? (user.plan_name || "iniciante") : "free";
              const plan = PLAN_STYLES[planKey] || PLAN_STYLES.free;
              const PlanIcon = plan.icon;
              const isExpanded = expandedId === user.id;
              const isAdmin = user.role === "admin";

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-muted/40 transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-foreground/70">
                      {user.email?.[0]?.toUpperCase()}
                    </div>

                    {/* Email */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                        {isAdmin && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plano */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${plan.bg} ${plan.border} ${plan.color}`}>
                      <PlanIcon className="w-3 h-3" />
                      {plan.label}
                    </div>

                    {/* Expand */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </motion.div>
                  </button>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 bg-muted/20 space-y-4">
                          {/* Info grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { icon: Mail, label: "Email", value: user.email },
                              { icon: Calendar, label: "Cadastro", value: formatDate(user.created_at) },
                              { icon: Activity, label: "Último login", value: formatDate(user.last_sign_in_at) },
                              { icon: ShieldCheck, label: "Análises", value: user.monthly_analyses || 0 },
                            ].map((info, j) => (
                              <motion.div
                                key={j}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: j * 0.05 }}
                                className="bg-card rounded-xl p-3 border border-border"
                              >
                                <info.icon className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                                <p className="text-[10px] text-muted-foreground">{info.label}</p>
                                <p className="text-xs font-semibold text-foreground truncate">{info.value}</p>
                              </motion.div>
                            ))}
                          </div>

                          {/* Plano */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Alterar plano</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {planOptions.map((opt, j) => {
                                const isCurrentPlan = opt.key === (user.is_premium ? (user.plan_name || "iniciante") : null);
                                const isLoading = actionLoading === `plan-${user.id}-${opt.key}`;
                                return (
                                  <motion.button
                                    key={opt.label}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: j * 0.05 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleSetPlan(user.id, opt.key)}
                                    disabled={!!actionLoading}
                                    className={`text-xs font-medium py-2.5 rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                                      isCurrentPlan
                                        ? "bg-primary/10 border-primary/30 text-primary"
                                        : "border-border text-muted-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : opt.label}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Admin toggle */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                            <div className="flex items-center gap-2">
                              <Shield className={`w-4 h-4 ${isAdmin ? "text-primary" : "text-muted-foreground"}`} />
                              <div>
                                <p className="text-xs font-semibold text-foreground">Acesso Admin</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {isAdmin ? "Pode acessar o painel admin" : "Sem acesso ao painel admin"}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSetAdmin(user.id, !isAdmin)}
                              disabled={!!actionLoading}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                                isAdmin
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                  : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                              }`}
                            >
                              {actionLoading === `admin-${user.id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isAdmin ? (
                                <><ShieldOff className="w-3 h-3" /> Remover</>
                              ) : (
                                <><Shield className="w-3 h-3" /> Dar acesso</>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
