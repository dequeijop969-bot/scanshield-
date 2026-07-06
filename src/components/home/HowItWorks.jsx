import React from "react";
import { motion } from "framer-motion";
import { Upload, ScanSearch, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Envie o conteúdo suspeito",
    desc: "Print de conversa, anúncio, boleto, vídeo ou link. Se parece estranho, mande para a IA analisar.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "A IA faz a varredura",
    desc: "Em segundos, o ScanShield cruza o conteúdo com milhares de padrões de golpes, fraudes e deepfakes reais.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Receba o veredito claro",
    desc: "Você vê o nível de risco, os sinais encontrados e o que fazer — tudo em linguagem simples.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-14 sm:mb-16"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
            Da dúvida à resposta
            <br />
            <span className="text-foreground/40">em três passos.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group p-7 rounded-2xl bg-card border border-border/60 hover:border-foreground/20 transition-colors duration-300"
            >
              <span className="absolute top-6 right-7 text-4xl font-black text-foreground/[0.07] group-hover:text-foreground/[0.14] transition-colors">
                {step.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-5">
                <step.icon className="w-5 h-5 text-foreground/80" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

              {/* Conector (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-[13px] w-[21px] h-px bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
