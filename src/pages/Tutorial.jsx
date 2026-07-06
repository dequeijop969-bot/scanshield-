import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Acesse a página inicial",
    description: 'Na tela inicial do ScanShield, clique no botão "Analisar Agora" para começar a verificar uma imagem suspeita.',
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/72c1ffb92_Designsemnome.png",
  },
  {
    number: "02",
    title: "Envie a imagem suspeita",
    description: 'Na página de análise, arraste e solte uma captura de tela ou clique em "Galeria" para selecionar uma imagem do seu dispositivo. Aceita PNG, JPG e WEBP.',
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/9c9b44339_Designsemnome1.png",
  },
  {
    number: "03",
    title: "Veja o resultado completo",
    description: "Após a análise, você verá um relatório detalhado com o título da ameaça identificada, a imagem analisada e um resumo do que foi encontrado.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/7b29d3c62_Capturadetela2026-04-18153650.png",
  },
  {
    number: "04",
    title: "Entenda o nível de risco: Seguro",
    description: "A barra verde com pontuação baixa (ex: 5/100) indica que nenhum risco significativo foi detectado. O conteúdo é provavelmente legítimo.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/3f8f005ee_Capturadetela2026-04-18155758.png",
    risk: { label: "Seguro", dot: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10" },
  },
  {
    number: "05",
    title: "Entenda o nível de risco: Atenção",
    description: "A barra amarela com pontuação média (ex: 50/100) indica que alguns pontos merecem atenção. Analise o conteúdo com cuidado antes de agir.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/4c8dd0030_Capturadetela2026-04-18155608.png",
    risk: { label: "Atenção", dot: "bg-yellow-400", text: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10" },
  },
  {
    number: "06",
    title: "Entenda o nível de risco: Perigoso",
    description: "A barra vermelha com pontuação alta (ex: 100/100) indica alto risco de golpe ou fraude. Não compartilhe dados pessoais nem realize pagamentos.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/9c845f3bc_Capturadetela2026-04-18155842.png",
    risk: { label: "Perigoso", dot: "bg-red-400", text: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10" },
  },
  {
    number: "07",
    title: "Tire dúvidas com o ScanShield",
    description: 'Se tiver alguma dúvida, pergunte ao ScanShield! Clique em "Tirar dúvidas com o ScanShield" logo abaixo do nível de risco. O assistente já conhece todos os detalhes da análise e responde suas perguntas na hora — pergunte o que quiser sobre a ameaça identificada.',
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/2de91ba3d_Capturadetela2026-04-22205241.png",
  },
];

export default function Tutorial() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 mb-5">
          <BookOpen className="w-3 h-3" />
          Guia rápido
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground mb-3 text-balance">
          Como usar o ScanShield
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-pretty leading-relaxed">
          Aprenda a identificar golpes, fraudes e deepfakes em poucos passos usando a nossa IA de proteção.
        </p>
      </div>

      {/* Timeline de passos */}
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-[19px] sm:left-[23px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        <div className="flex flex-col gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="relative flex gap-4 sm:gap-6"
            >
              {/* Marcador numerado */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                  <span className="font-mono text-xs sm:text-sm font-bold text-foreground">{step.number}</span>
                </div>
              </div>

              {/* Card do passo */}
              <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-colors">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground text-balance">
                      {step.title}
                    </h2>
                    {step.risk && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${step.risk.border} ${step.risk.bg} font-mono text-[10px] uppercase tracking-[0.15em] ${step.risk.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${step.risk.dot}`} />
                        {step.risk.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{step.description}</p>
                </div>
                <div className="border-t border-border bg-background/50">
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/50">
                    <span className="w-2 h-2 rounded-full bg-foreground/20" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Passo {step.number}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <img
                      src={step.imageUrl || "/placeholder.svg"}
                      alt={step.title}
                      className="rounded-xl max-h-80 w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10 text-center"
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2 text-balance">
            Pronto para testar?
          </h2>
          <p className="text-muted-foreground text-sm mb-6">Envie sua primeira imagem agora e veja a IA em ação.</p>
          <Link to={createPageUrl("Analyze")}>
            <Button className="h-11 px-6 rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2 font-bold">
              <ScanSearch className="w-4 h-4" />
              Analisar Agora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
