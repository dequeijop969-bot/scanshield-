import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Clock, BadgeCheck, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Resultado em segundos",
    desc: "Sem espera. Envie a imagem e receba uma análise completa quase instantaneamente.",
  },
  {
    icon: ShieldCheck,
    title: "IA treinada em golpes reais",
    desc: "Reconhece padrões de fraude usados em ofertas falsas, phishing e engenharia social.",
  },
  {
    icon: Lock,
    title: "Seus dados protegidos",
    desc: "Suas análises ficam vinculadas só à sua conta. Ninguém mais tem acesso a elas.",
  },
  {
    icon: Clock,
    title: "Histórico sempre à mão",
    desc: "Volte quando quiser e reveja qualquer análise feita anteriormente.",
  },
  {
    icon: BadgeCheck,
    title: "Sem julgamento, só fatos",
    desc: "A análise é objetiva: mostra os sinais de risco encontrados, sem alarmismo.",
  },
  {
    icon: Sparkles,
    title: "Sempre evoluindo",
    desc: "O modelo de IA é atualizado continuamente para acompanhar novos tipos de golpe.",
  },
];

export default function WhyScanShield() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-14 sm:mb-16"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400/80 uppercase mb-4">
            Por que o ScanShield
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
            Sua camada extra de segurança
            <br />
            <span className="text-foreground/40">antes de cair na fraude.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group p-7 bg-card hover:bg-muted/60 transition-colors duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                <reason.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
