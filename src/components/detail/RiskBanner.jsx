import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

const riskConfig = {
  seguro: {
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "",
    label: "Seguro",
    desc: "Nenhum risco significativo foi detectado",
  },
  atencao: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    glow: "glow-yellow",
    label: "Atenção",
    desc: "Alguns pontos merecem atenção",
  },
  suspeito: {
    icon: ShieldAlert,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "glow-yellow",
    label: "Suspeito",
    desc: "Vários sinais de alerta foram encontrados",
  },
  perigoso: {
    icon: ShieldX,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "glow-red",
    label: "Perigoso",
    desc: "Alto risco de golpe ou fraude detectado",
  },
};

export default function RiskBanner({ riskLevel, riskScore }) {
  const config = riskConfig[riskLevel] || riskConfig.seguro;
  const RiskIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl ${config.bg} border ${config.border} ${config.glow}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center`}>
          <RiskIcon className={`w-7 h-7 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-bold ${config.color}`}>{config.label}</h2>
            <span className={`text-sm font-mono font-bold ${config.color}`}>
              {riskScore}/100
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{config.desc}</p>
        </div>
      </div>

      {/* Risk bar */}
      <div className="mt-4 h-2 rounded-full bg-foreground/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${riskScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            riskScore <= 25 ? "bg-emerald-400" :
            riskScore <= 50 ? "bg-yellow-400" :
            riskScore <= 75 ? "bg-orange-400" :
            "bg-red-400"
          }`}
        />
      </div>
    </motion.div>
  );
}