import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Link2,
  ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/*
 * Demonstração animada do produto em ação.
 * Cicla entre 3 cenários: golpe detectado, seguro, deepfake.
 */

const SCENARIOS = [
  {
    id: "scam",
    fileName: "oferta-iphone.jpg",
    fileType: "Imagem",
    icon: ImageIcon,
    verdict: "risk",
    verdictLabel: "GOLPE DETECTADO",
    score: 94,
    flags: [
      { text: "Preço 78% abaixo do mercado", level: "high" },
      { text: "Link encurtado suspeito", level: "high" },
      { text: "Urgência artificial: \u201Csó hoje\u201D", level: "mid" },
    ],
  },
  {
    id: "safe",
    fileName: "boleto-condominio.png",
    fileType: "Imagem",
    icon: ImageIcon,
    verdict: "safe",
    verdictLabel: "NENHUM RISCO ENCONTRADO",
    score: 3,
    flags: [
      { text: "Código de barras válido", level: "ok" },
      { text: "Beneficiário verificado", level: "ok" },
      { text: "Sem sinais de adulteração", level: "ok" },
    ],
  },
  {
    id: "deepfake",
    fileName: "video-famoso-investimento.mp4",
    fileType: "Vídeo",
    icon: Link2,
    verdict: "risk",
    verdictLabel: "DEEPFAKE IDENTIFICADO",
    score: 89,
    flags: [
      { text: "Sincronização labial artificial", level: "high" },
      { text: "Artefatos de IA no rosto", level: "high" },
      { text: "Promessa de retorno irreal", level: "mid" },
    ],
  },
];

const PHASES = { UPLOAD: 0, SCANNING: 1, RESULT: 2 };

export default function ScanDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState(PHASES.UPLOAD);

  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    let timeout;
    if (phase === PHASES.UPLOAD) {
      timeout = setTimeout(() => setPhase(PHASES.SCANNING), 1400);
    } else if (phase === PHASES.SCANNING) {
      timeout = setTimeout(() => setPhase(PHASES.RESULT), 2600);
    } else {
      timeout = setTimeout(() => {
        setPhase(PHASES.UPLOAD);
        setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
      }, 4200);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  const isRisk = scenario.verdict === "risk";

  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      {/* Glow atrás do card */}
      <div
        className={`absolute -inset-6 rounded-[2rem] blur-2xl transition-colors duration-700 ${
          phase === PHASES.RESULT
            ? isRisk
              ? "bg-red-500/10"
              : "bg-emerald-500/10"
            : "bg-foreground/[0.04]"
        }`}
      />

      {/* Card principal — janela do app */}
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden">
        {/* Barra da janela */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-background/50">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt=""
              className="w-5 h-5 rounded object-cover"
            />
            <span className="text-xs font-bold tracking-tight text-foreground">
              SCAN<span className="text-foreground/40">SHIELD</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            AO VIVO
          </span>
        </div>

        {/* Corpo */}
        <div className="p-5 min-h-[340px] flex flex-col">
          {/* Arquivo em análise */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border/60 mb-4">
            <div className="w-9 h-9 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
              <scenario.icon className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{scenario.fileName}</p>
              <p className="text-[10px] text-muted-foreground">{scenario.fileType} recebido para análise</p>
            </div>
            {phase !== PHASES.RESULT && (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
            )}
          </div>

          {/* Área de scan / resultado */}
          <div className="relative flex-1 rounded-xl border border-border/60 bg-background/60 overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === PHASES.UPLOAD && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                    <ScanSearch className="w-5 h-5 text-foreground/70" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Preparando análise com IA...</p>
                </motion.div>
              )}

              {phase === PHASES.SCANNING && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-5 flex flex-col justify-center gap-3"
                >
                  {/* Linha de scan */}
                  <motion.div
                    className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-foreground/10 to-transparent"
                    animate={{ top: ["-15%", "105%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                  {["Verificando padrões de fraude", "Analisando metadados", "Cruzando com golpes conhecidos"].map(
                    (step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.55 }}
                        className="flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs text-foreground/80">{step}</span>
                      </motion.div>
                    )
                  )}
                </motion.div>
              )}

              {phase === PHASES.RESULT && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 p-4 flex flex-col gap-3"
                >
                  {/* Banner de veredito */}
                  <div
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border ${
                      isRisk
                        ? "bg-red-500/10 border-red-500/25 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {isRisk ? (
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                    )}
                    <span className="text-xs font-black tracking-wide">{scenario.verdictLabel}</span>
                    <span className="ml-auto text-[10px] font-bold opacity-80">
                      Risco: {scenario.score}%
                    </span>
                  </div>

                  {/* Barra de risco */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scenario.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${isRisk ? "bg-red-500" : "bg-emerald-500"}`}
                    />
                  </div>

                  {/* Sinais encontrados */}
                  <div className="flex flex-col gap-2 mt-1">
                    {scenario.flags.map((flag, i) => (
                      <motion.div
                        key={flag.text}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.18 }}
                        className="flex items-center gap-2"
                      >
                        {flag.level === "ok" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 shrink-0 ${
                              flag.level === "high" ? "text-red-400" : "text-yellow-400"
                            }`}
                          />
                        )}
                        <span className="text-xs text-foreground/80">{flag.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rodapé do card */}
          <div className="flex items-center justify-between mt-4 text-[10px] text-muted-foreground">
            <span>Análise em ~8 segundos</span>
            <span className="font-semibold text-foreground/60">scanshield-ai.com</span>
          </div>
        </div>
      </div>

      {/* Badge flutuante */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-3 sm:-right-6 bg-card border border-border text-xs font-bold px-3.5 py-2 rounded-xl shadow-xl shadow-black/30 flex items-center gap-2 text-foreground"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        98% de precisão
      </motion.div>
    </div>
  );
}
