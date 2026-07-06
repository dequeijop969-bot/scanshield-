import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, ShieldCheck, Zap, Users, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ScanDemo from "./ScanDemo";

const stats = [
  { icon: ShieldCheck, label: "Análises realizadas", value: "10k+" },
  { icon: Zap, label: "Taxa de precisão", value: "98%" },
  { icon: Users, label: "Usuários protegidos", value: "5k+" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial spotlight atrás do demo */}
        <div className="absolute top-1/2 right-0 w-[700px] h-[700px] -translate-y-1/2 translate-x-1/4 rounded-full bg-foreground/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-foreground/[0.015] rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground) / 0.3) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />
        {/* Fade inferior */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">

          {/* ─── LEFT: Texto ─────────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-semibold text-foreground/80 mb-7 tracking-wide">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                IA de detecção ativa 24/7
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-[2.75rem] sm:text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-[0.98] mb-6 text-balance"
            >
              Golpes não avisam.
              <br />
              <span className="text-foreground/35">O ScanShield sim.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-9 max-w-lg text-pretty"
            >
              Envie uma imagem ou vídeo suspeito e receba, em segundos, um veredito
              claro: fraude, deepfake ou seguro. Sem termos técnicos — só a resposta
              que você precisa antes de clicar, pagar ou confiar.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={createPageUrl("Analyze")}>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2.5 w-full sm:w-auto shadow-[0_0_40px_hsl(var(--foreground)/0.12)]"
                  >
                    <ScanSearch className="w-5 h-5" />
                    Analisar grátis agora
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={createPageUrl("Tutorial")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold rounded-xl gap-2.5 w-full sm:w-auto border-foreground/15 bg-transparent hover:bg-foreground/5 text-foreground"
                  >
                    <Play className="w-4 h-4" />
                    Como funciona
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust row */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-xs text-muted-foreground mb-8"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Suas análises são privadas e vinculadas apenas à sua conta</span>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 border-t border-border/60 pt-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                >
                  <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── RIGHT: Demo de análise ao vivo ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="order-1 lg:order-2"
          >
            <ScanDemo />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
