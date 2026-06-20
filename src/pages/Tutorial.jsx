import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Acesse a página inicial",
    description: 'Na tela inicial do ScanShield, clique no botão "Analisar Agora" para começar a verificar uma imagem suspeita.',
    image: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg",
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
  },
  {
    number: "05",
    title: "Entenda o nível de risco: Atenção",
    description: "A barra amarela com pontuação média (ex: 50/100) indica que alguns pontos merecem atenção. Analise o conteúdo com cuidado antes de agir.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/4c8dd0030_Capturadetela2026-04-18155608.png",
  },
  {
    number: "06",
    title: "Entenda o nível de risco: Perigoso",
    description: "A barra vermelha com pontuação alta (ex: 100/100) indica alto risco de golpe ou fraude. Não compartilhe dados pessoais nem realize pagamentos.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/9c845f3bc_Capturadetela2026-04-18155842.png",
  },
  {
    number: "07",
    title: "Tire dúvidas com o ScanShield",
    description: "Se tiver alguma dúvida, pergunte ao ScanShield! Clique em \"Tirar dúvidas com o ScanShield\" logo abaixo do nível de risco. O assistente já conhece todos os detalhes da análise e responde suas perguntas na hora — pergunte o que quiser sobre a ameaça identificada.",
    imageUrl: "https://media.base44.com/images/public/69b21108e661b747169bd2a0/2de91ba3d_Capturadetela2026-04-22205241.png",
  },
];

export default function Tutorial() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-foreground mb-3">Como usar o ScanShield</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Aprenda a identificar golpes, fraudes e deepfakes em poucos passos usando a nossa IA de proteção.
        </p>
      </div>

      <div className="space-y-10">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="p-5 flex items-start gap-4 border-b border-border/50">
              <span className="text-3xl font-black text-foreground/10 leading-none">{step.number}</span>
              <div>
                <h2 className="text-base font-bold text-foreground">{step.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
            <div className="bg-muted/30 flex items-center justify-center p-4">
              <img
                src={step.imageUrl}
                alt={step.title}
                className="rounded-xl max-h-80 w-full object-contain"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm mb-4">Pronto para testar? Envie sua primeira imagem agora.</p>
        <Link to={createPageUrl("Analyze")}>
          <Button className="rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2">
            <ScanSearch className="w-4 h-4" />
            Analisar Agora
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}