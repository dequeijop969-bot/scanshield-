import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const riskConfig = {
  seguro: { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Seguro" },
  atencao: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Atenção" },
  suspeito: { icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Suspeito" },
  perigoso: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Perigoso" },
};

export default function RecentAnalyses({ analyses }) {
  if (!analyses || analyses.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Análises Recentes</h2>
        <Link
          to={createPageUrl("History")}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.slice(0, 6).map((analysis, i) => {
          const risk = riskConfig[analysis.risk_level] || riskConfig.seguro;
          const RiskIcon = risk.icon;

          return (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to={createPageUrl(`AnalysisDetail?id=${analysis.id}`)}
                className={`block p-4 rounded-2xl bg-card border ${risk.border} hover:scale-[1.01] transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  {analysis.image_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <img src={analysis.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${risk.bg} ${risk.color} ${risk.border} border text-xs`}>
                        <RiskIcon className="w-3 h-3 mr-1" />
                        {risk.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {analysis.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {analysis.summary}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {format(new Date(analysis.created_date), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}