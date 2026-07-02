import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ScanSearch, History, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Logo3D from "./Logo3D";

const LOGO_URL = "https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg";

const stats = [
  { icon: ShieldCheck, label: "Análises realizadas", value: "10k+" },
  { icon: Zap, label: "Taxa de precisão", value: "98%" },
  { icon: Users, label: "Usuários protegidos", value: "5k+" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── LEFT: Texto ─────────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-medium text-foreground/70 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Proteção com IA em tempo real
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05] mb-6"
            >
              Sua defesa contra
              <br />
              <span className="text-foreground/40">golpes digitais</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
            >
              Envie uma imagem ou vídeo suspeito e nossa IA analisa em segundos,
              identificando fraudes, deepfakes e golpes online — em linguagem simples
              que qualquer pessoa entende.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={createPageUrl("Analyze")}>
                  <Button
                    size="lg"
                    className="h-13 px-7 text-base font-bold rounded-xl bg-white text-black hover:bg-white/90 gap-2.5 w-full sm:w-auto"
                  >
                    <ScanSearch className="w-5 h-5" />
                    Analisar Agora
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={createPageUrl("History")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 px-7 text-base font-semibold rounded-xl gap-2.5 w-full sm:w-auto border-foreground/20 hover:bg-foreground/5"
                  >
                    <History className="w-5 h-5" />
                    Ver Histórico
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 border-t border-border/50 pt-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── RIGHT: Logo 3D ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Glow rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
              />
              <motion.div
                className="absolute -inset-4 rounded-full"
                animate={{ scale: [1, 1.04, 1], opacity: [0.06, 0.12, 0.06] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
              />

              {/* Logo 3D Canvas */}
              <div className="relative w-full h-full">
                <Logo3D src={LOGO_URL} />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30"
              >
                ✓ Seguro
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-3 -left-4 bg-card border border-border text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg text-foreground"
              >
                🛡️ IA Ativa
              </motion.div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -left-8 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                ⚠ Golpe detectado
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
