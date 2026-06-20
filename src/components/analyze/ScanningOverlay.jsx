import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Clock } from "lucide-react";

const timeEstimates = [
  "Estimativa: ~15 segundos",
  "Estimativa: ~20 segundos",
  "Quase lá...",
  "Processando com IA...",
  "Analisando com precisão...",
  "Só mais um momento...",
  "Finalizando análise...",
];

const allSteps = [
  "Fazendo upload da imagem...",
  "Extraindo conteúdo visual...",
  "Analisando textos e informações...",
  "Verificando padrões de golpe...",
  "Comparando preços de mercado...",
  "Avaliando vendedor...",
  "Gerando relatório...",
];

const deepfakeSteps = [
  "Fazendo upload da imagem...",
  "Extraindo conteúdo visual...",
  "Detectando artefatos de IA...",
  "Analisando iluminação e sombras...",
  "Verificando consistência do rosto...",
  "Identificando modelo de deepfake...",
  "Gerando relatório...",
];

export default function ScanningOverlay({ currentStep, analysisType }) {
  const steps = analysisType === "deepfake" ? deepfakeSteps : allSteps;
  const [timeIndex, setTimeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeIndex(prev => (prev + 1) % timeEstimates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-white/15 glow-white"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
          <img src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">ScanShield Analisando...</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <AnimatePresence mode="wait">
              <motion.p
                key={timeIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-muted-foreground"
              >
                {timeEstimates[timeIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground/40"
              }`}
            >
              {isDone ? (
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              ) : isActive ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-border" />
              )}
              <span className={isActive ? "font-medium" : ""}>{step}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}