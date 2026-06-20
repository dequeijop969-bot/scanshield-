import React from "react";
import { motion } from "framer-motion";
import { UserX, Brain, AlertTriangle, CheckCircle2, Scan } from "lucide-react";

const probabilityConfig = (prob) => {
  if (prob >= 80) return { label: "Alta probabilidade de Deepfake", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: UserX };
  if (prob >= 50) return { label: "Suspeito — possível Deepfake", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle };
  if (prob >= 20) return { label: "Baixa suspeita de Deepfake", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: AlertTriangle };
  return { label: "Imagem aparenta ser autêntica", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 };
};

export default function DeepfakeResult({ analysis }) {
  if (analysis.analysis_type !== "deepfake") return null;

  const prob = analysis.deepfake_probability ?? 0;
  const cfg = probabilityConfig(prob);
  const Icon = cfg.icon;
  const artifacts = analysis.deepfake_artifacts || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Análise de Deepfake</h3>
          <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
        </div>
        <div className="ml-auto text-right">
          <span className={`text-2xl font-black ${cfg.color}`}>{prob}%</span>
          <p className="text-xs text-muted-foreground">probabilidade</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prob}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${prob >= 80 ? "bg-red-500" : prob >= 50 ? "bg-orange-500" : prob >= 20 ? "bg-yellow-500" : "bg-emerald-500"}`}
        />
      </div>

      {/* Modelo detectado */}
      {analysis.deepfake_model_detected && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-muted/40">
          <Brain className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Modelo de IA suspeito</p>
            <p className="text-sm font-semibold text-foreground">{analysis.deepfake_model_detected}</p>
          </div>
        </div>
      )}

      {/* Artefatos detectados */}
      {artifacts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scan className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Artefatos detectados</p>
          </div>
          <ul className="space-y-1.5">
            {artifacts.map((artifact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.color.replace("text-", "bg-")}`} />
                <span className="text-muted-foreground">{artifact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}