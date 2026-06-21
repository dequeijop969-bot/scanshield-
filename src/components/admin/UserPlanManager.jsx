import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  ShieldCheck,
  Sparkles,
  Crown,
  XCircle,
  Mail,
  UserCog,
} from "lucide-react";

const PLAN_OPTIONS = [
  { key: null, label: "Gratuito", icon: XCircle, color: "text-muted-foreground", bg: "bg-foreground/5", border: "border-border" },
  { key: "iniciante", label: "Iniciante", icon: ShieldCheck, color: "text-zinc-300", bg: "bg-zinc-500/10", border: "border-zinc-400/30" },
  { key: "intermediario", label: "Intermediário", icon: Sparkles, color: "text-yellow-300", bg: "bg-yellow-400/10", border: "border-yellow-400/40" },
  { key: "pro", label: "PRO", icon: Crown, color: "text-yellow-200", bg: "bg-yellow-300/10", border: "border-yellow-300/50" },
];

async function callAdminApi(action, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch("/api/adminManageUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export default function UserPlanManager() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setProfile(null);
    try {
      const data = await callAdminApi("lookup", { targetEmail: email.trim() });
      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSetPlan = async (planKey) => {
    setUpdating(true);
    setError("");
    setSuccess("");
    try {
      const data = await callAdminApi("setPlan", { targetEmail: email.trim(), planKey });
      setProfile(data.profile);
      setSuccess("Plano atualizado com sucesso!");
    } catch (err) {
      setError(err.message);
    }
    setUpdating(false);
  };

  const currentPlanKey = profile?.is_premium ? (profile?.plan_name?.toLowerCase() || "iniciante") : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl overflow-hidden mb-8"
    >
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
          <UserCog className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Gerenciar plano de usuário</p>
          <p className="text-xs text-muted-foreground">Busque por email e dê ou retire um plano</p>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="email@exemplo.com"
              className="w-full bg-input border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !email.trim()}
            className="rounded-xl px-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 mb-4">
            {success}
          </p>
        )}

        {profile && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-1">Usuário encontrado</p>
            <p className="text-sm font-medium text-foreground mb-4 truncate">{profile.email}</p>

            <p className="text-xs text-muted-foreground mb-2">Definir plano:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLAN_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSetPlan(opt.key)}
                  disabled={updating}
                  className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl border transition-colors ${
                    opt.key === currentPlanKey
                      ? `${opt.bg} ${opt.border} ${opt.color}`
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
