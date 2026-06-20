import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ScanSearch, AlertTriangle, TrendingUp } from "lucide-react";

export default function StatsSection({ totalScans, threatsDetected }) {
  const stats = [
    { label: "Análises realizadas", value: totalScans, icon: ScanSearch, color: "text-foreground" },
    { label: "Ameaças detectadas", value: threatsDetected, icon: AlertTriangle, color: "text-red-400" },
    { label: "Taxa de proteção", value: totalScans > 0 ? "99%" : "--", icon: ShieldCheck, color: "text-foreground/70" },
    { label: "Tempo médio", value: "~8s", icon: TrendingUp, color: "text-foreground/50" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border/50 text-center"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-3`} />
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}