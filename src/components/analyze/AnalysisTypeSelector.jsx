import React from "react";
import { ShieldAlert, Tag, Search, Scan, UserX, Check, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const types = [
  { value: "automatico", label: "Automático", icon: Sparkles, desc: "IA identifica o tipo de risco", recommended: true },
  { value: "geral", label: "Análise Geral", icon: Scan, desc: "Análise completa da imagem" },
  { value: "golpe", label: "Detecção de Golpe", icon: ShieldAlert, desc: "Foco em fraudes e golpes" },
  { value: "oferta", label: "Verificar Oferta", icon: Tag, desc: "Preço, vendedor e produto" },
  { value: "informacao_falsa", label: "Fake News", icon: Search, desc: "Informações falsas" },
  { value: "deepfake", label: "Deepfake / Face Swap", icon: UserX, desc: "Detecção de rosto sintético por IA", beta: true },
];

export default function AnalysisTypeSelector({ selected, onSelect, disabled, canUseDeepfake = false }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {types.map((type, index) => {
        const isDeepfakeLocked = type.value === "deepfake" && !canUseDeepfake;
        const isSelected = selected === type.value;
        const isDisabled = disabled || isDeepfakeLocked;
        return (
          <motion.button
            key={type.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={!isDisabled ? { y: -2 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            onClick={() => !isDisabled && onSelect(type.value)}
            disabled={isDisabled}
            title={isDeepfakeLocked ? "Disponível a partir do plano Intermediário" : undefined}
            className={`group p-4 rounded-2xl border text-left transition-all duration-200 relative ${
              isSelected
                ? "border-foreground/40 bg-foreground/[0.06] shadow-[0_0_24px_hsl(var(--foreground)/0.08)]"
                : isDeepfakeLocked
                ? "border-border bg-card opacity-50 cursor-not-allowed"
                : "border-border bg-card hover:border-foreground/25"
            } ${disabled && !isDeepfakeLocked ? "opacity-50 cursor-not-allowed" : ""} ${!isDisabled ? "cursor-pointer" : ""}`}
          >
            {/* Indicador de seleção */}
            <span
              className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "bg-emerald-400 border-emerald-400"
                  : "border-foreground/20 bg-transparent"
              }`}
              aria-hidden="true"
            >
              {isSelected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </span>

            <span
              className={`inline-flex w-9 h-9 rounded-xl items-center justify-center mb-3 border transition-colors duration-200 ${
                isSelected
                  ? "bg-foreground/10 border-foreground/20"
                  : "bg-foreground/5 border-foreground/10"
              }`}
            >
              <type.icon className={`w-[18px] h-[18px] ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80 transition-colors"}`} />
            </span>

            <div className={`text-sm font-bold tracking-tight flex items-center flex-wrap gap-1.5 ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
              {type.label}
              {type.beta && !isDeepfakeLocked && (
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider">
                  BETA
                </span>
              )}
              {type.recommended && (
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 tracking-wider">
                  RECOMENDADO
                </span>
              )}
              {isDeepfakeLocked && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 tracking-wider">
                  <Lock className="w-2.5 h-2.5" />
                  PRO
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isDeepfakeLocked ? "Plano Intermediário+" : type.desc}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
