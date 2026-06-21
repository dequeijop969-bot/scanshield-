import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Clock, BadgeCheck, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Resultado em segundos",
    desc: "Sem espera. Envie a imagem e receba uma análise completa quase instantaneamente.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: ShieldCheck,
    title: "IA treinada em golpes reais",
    desc: "Reconhece padrões de fraude usados em ofertas falsas, phishing e engenharia social.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    icon: Lock,
    title: "Seus dados protegidos",
    desc: "Suas análises ficam vinculadas só à sua conta. Ninguém mais tem acesso a elas.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: Clock,
    title: "Histórico sempre à mão",
    desc: "Volte quando quiser e reveja qualquer análise feita anteriormente.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: BadgeCheck,
    title: "Sem julgamento, só fatos",
    desc: "A análise é objetiva: mostra os sinais de risco encontrados, sem alarmismo.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: Sparkles,
    title: "Sempre evoluindo",
    desc: "O modelo de IA é atualizado continuamente para acompanhar novos tipos de golpe.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
];

export default function WhyScanShield() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
            <span className="text-xs font-medium text-foreground/70">Por que escolher</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1] mb-4">
            Por que usar o
            <br />
            <span className="text-foreground/50">ScanShield</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Mais do que uma ferramenta — sua camada extra de segurança antes de cair em uma fraude.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -4 }}
              className={`group p-6 rounded-2xl bg-card border ${reason.border} hover:shadow-lg hover:shadow-foreground/5 transition-shadow duration-300`}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`w-12 h-12 rounded-xl ${reason.bg} flex items-center justify-center mb-4`}
              >
                <reason.icon className={`w-6 h-6 ${reason.color}`} />
              </motion.div>
              <h3 className="font-bold text-lg text-foreground mb-2">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
