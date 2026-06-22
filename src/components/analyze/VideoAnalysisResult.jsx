import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, ShieldX, AlertTriangle,
  CheckCircle, Video, RefreshCw, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const RISK_CONFIG = {
  seguro: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Seguro",
    desc: "Nenhum risco significativo foi detectado no vídeo",
    score: 12,
  },
  suspeito: {
    icon: ShieldAlert,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    label: "Suspeito",
    desc: "Vários sinais de alerta foram encontrados no vídeo",
    score: 65,
  },
  perigoso: {
    icon: ShieldX,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Perigoso",
    desc: "Alto risco de golpe ou fraude detectado no vídeo",
    score: 90,
  },
};

export default function VideoAnalysisResult({ result, videoPreview, onClear }) {
  if (!result || result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
      >
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-4">{result?.error || "Erro desconhecido ao analisar o vídeo."}</p>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onClear}>
          Tentar novamente
        </Button>
      </motion.div>
    );
  }

  const riskKey = result.risk_level?.toLowerCase() || "suspeito";
  const config = RISK_CONFIG[riskKey] || RISK_CONFIG.suspeito;
  const RiskIcon = config.icon;
  const redFlags = result.red_flags || [];
  const greenFlags = result.green_flags || [];

  return (
    <div className="space-y-4">
      {/* Preview do vídeo */}
      {videoPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <video src={videoPreview} controls className="w-full max-h-[280px] bg-black/20" />
        </motion.div>
      )}

      {/* Banner de risco */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`p-6 rounded-2xl ${config.bg} border ${config.border}`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
            className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center`}
          >
            <RiskIcon className={`w-7 h-7 ${config.color}`} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <motion.h2
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xl font-bold ${config.color}`}
              >
                {config.label}
              </motion.h2>
              <span className={`text-sm font-mono font-bold ${config.color} opacity-70`}>
                {config.score}/100
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{config.desc}</p>
          </div>
        </div>

        {/* Barra de risco */}
        <div className="mt-4 h-2 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${config.score}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${
              config.score <= 25 ? "bg-emerald-400" :
              config.score <= 50 ? "bg-yellow-400" :
              config.score <= 75 ? "bg-orange-400" :
              "bg-red-400"
            }`}
          />
        </div>
      </motion.div>

      {/* Resumo */}
      {result.summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="p-5 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Resumo da Análise</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </motion.div>
      )}

      {/* Red flags e Green flags */}
      {(redFlags.length > 0 || greenFlags.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {redFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="font-semibold text-red-400 text-sm">Sinais de Alerta</h3>
              </div>
              <ul className="space-y-2">
                {redFlags.map((flag, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    {flag}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {greenFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-emerald-400 text-sm">Pontos Positivos</h3>
              </div>
              <ul className="space-y-2">
                {greenFlags.map((flag, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    {flag}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}

      {/* Botão analisar outro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={onClear}
          className="w-full rounded-xl gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Analisar outro vídeo
        </Button>
      </motion.div>
    </div>
  );
}
