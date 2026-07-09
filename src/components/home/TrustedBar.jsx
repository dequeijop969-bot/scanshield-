import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Eye, BadgeCheck, ScanSearch } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "10.000+ análises realizadas" },
  { icon: Zap, label: "Veredito em menos de 10s" },
  { icon: Lock, label: "Dados criptografados" },
  { icon: Eye, label: "Detecção de deepfakes" },
  { icon: BadgeCheck, label: "98% de precisão" },
  { icon: ScanSearch, label: "Imagens, vídeos e links" },
];

export default function TrustedBar() {
  const doubled = [...items, ...items];

  return (
    <section
      aria-label="Diferenciais do ScanShield"
      className="relative border-y border-border/40 bg-card/40 overflow-hidden"
    >
      <div className="relative py-5">
        {/* Fades laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          className="flex items-center gap-12 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground whitespace-nowrap"
            >
              <item.icon className="w-4 h-4 text-emerald-400/80" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
