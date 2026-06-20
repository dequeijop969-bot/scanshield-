import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, AlertTriangle, TrendingDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5">
              <img
                src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg"
                alt="ScanShield"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-xs font-medium text-foreground/70">IA de Proteção Ativa</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
            Sua defesa contra
            <br />
            <span className="text-foreground/50">
              golpes digitais
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Envie uma captura de tela e nossa IA analisa ofertas, identifica 
            informações falsas, compara preços e detecta golpes em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl("Analyze")}>
              <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2.5">
                <ScanSearch className="w-5 h-5" />
                Analisar Agora
              </Button>
            </Link>
            <Link to={createPageUrl("History")}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-xl border-foreground/15 text-foreground/70 hover:text-foreground hover:border-foreground/30 gap-2.5">
                <Eye className="w-5 h-5" />
                Ver Histórico
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-4xl mx-auto"
        >
          {[
            {
              icon: AlertTriangle,
              title: "Detecção de Golpes",
              desc: "Identifica padrões de fraude e engenharia social",
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
            {
              icon: TrendingDown,
              title: "Comparação de Preços",
              desc: "Verifica se o preço está compatível com o mercado",
              color: "text-foreground",
              bg: "bg-foreground/10",
              border: "border-foreground/10",
            },
            {
              icon: Eye,
              title: "Verificação de Vendedor",
              desc: "Analisa reputação e sinais de confiabilidade",
              color: "text-foreground/60",
              bg: "bg-foreground/5",
              border: "border-foreground/10",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className={`p-6 rounded-2xl bg-card border ${feature.border} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}