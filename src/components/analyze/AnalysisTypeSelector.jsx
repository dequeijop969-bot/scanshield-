import React from "react";
import { ShieldAlert, Tag, Search, Scan, UserX } from "lucide-react";

const types = [
  { value: "geral", label: "Análise Geral", icon: Scan, desc: "Análise completa da imagem" },
  { value: "golpe", label: "Detecção de Golpe", icon: ShieldAlert, desc: "Foco em fraudes e golpes" },
  { value: "oferta", label: "Verificar Oferta", icon: Tag, desc: "Preço, vendedor e produto" },
  { value: "informacao_falsa", label: "Fake News", icon: Search, desc: "Informações falsas" },
  { value: "deepfake", label: "Deepfake / Face Swap", icon: UserX, desc: "Detecção de rosto sintético por IA", beta: true },
];

export default function AnalysisTypeSelector({ selected, onSelect, disabled, canUseDeepfake = false }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {types.map((type) => {
        const isDeepfakeLocked = type.value === "deepfake" && !canUseDeepfake;
        const isSelected = selected === type.value;
        const isDisabled = disabled || isDeepfakeLocked;
        return (
          <button
            key={type.value}
            onClick={() => !isDisabled && onSelect(type.value)}
            disabled={isDisabled}
            title={isDeepfakeLocked ? "Disponível a partir do plano Intermediário" : undefined}
            className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
              isSelected
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : isDeepfakeLocked
                ? "border-border bg-card opacity-50 cursor-not-allowed"
                : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
            } ${disabled && !isDeepfakeLocked ? "opacity-50 cursor-not-allowed" : ""} ${!isDisabled ? "cursor-pointer" : ""}`}
          >
            <type.icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            <div className={`text-sm font-semibold flex items-center gap-1.5 ${isSelected ? "text-primary" : "text-foreground"}`}>
              {type.label}
              {type.beta && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">BETA</span>}
              {isDeepfakeLocked && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">PRO</span>}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{isDeepfakeLocked ? "Plano Intermediário+" : type.desc}</div>
          </button>
        );
      })}
    </div>
  );
}