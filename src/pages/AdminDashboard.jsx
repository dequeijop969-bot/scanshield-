import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, TrendingUp, DollarSign, Loader2, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const formatBRL = (cents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const statusConfig = {
  active: { label: "Ativo", icon: CheckCircle2, color: "text-emerald-400" },
  canceled: { label: "Cancelado", icon: XCircle, color: "text-red-400" },
  past_due: { label: "Em atraso", icon: Clock, color: "text-yellow-400" },
  trialing: { label: "Trial", icon: Clock, color: "text-blue-400" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("adminStats", {});
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Assinantes Ativos",
      value: stats?.active_subscribers ?? 0,
      icon: Users,
      suffix: "",
    },
    {
      label: "Receita (últimos 30 dias)",
      value: formatBRL(stats?.revenue_last_30d ?? 0),
      icon: TrendingUp,
      suffix: "",
    },
    {
      label: "Receita Total",
      value: formatBRL(stats?.revenue_total ?? 0),
      icon: DollarSign,
      suffix: "",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Painel Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Métricas de assinaturas ScanShield Premium</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <card.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Subscriptions */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Assinaturas Recentes</h2>
        </div>

        {stats?.recent_subscriptions?.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            Nenhuma assinatura encontrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats?.recent_subscriptions?.map((sub, i) => {
              const cfg = statusConfig[sub.status] || statusConfig.active;
              const Icon = cfg.icon;
              return (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sub.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Desde {new Date(sub.created * 1000).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {formatBRL(sub.amount)}
                      <span className="text-xs text-muted-foreground font-normal">/mês</span>
                    </span>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}