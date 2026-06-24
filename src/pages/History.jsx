import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, ShieldX,
  ScanSearch, Trash2, Loader2, Search, Video
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const riskConfig = {
  seguro: { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Seguro" },
  atencao: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Atenção" },
  suspeito: { icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Suspeito" },
  perigoso: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Perigoso" },
};

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: analyses = [], isLoading, refetch } = useQuery({
    queryKey: ["my-analyses", currentUser?.email],
    queryFn: () => base44.entities.ScreenAnalysis.filter({ created_by: currentUser.email }, "-created_date", 100),
    enabled: !!currentUser,
  });

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.ScreenAnalysis.delete(id);
    refetch();
  };

  const filtered = analyses.filter((a) => {
    const matchesSearch = !searchTerm ||
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "all" || a.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Análises</h1>
          <p className="text-sm text-muted-foreground mt-1">{analyses.length} análises realizadas</p>
        </div>
        <Link to={createPageUrl("Analyze")}>
          <Button className="rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2">
            <ScanSearch className="w-4 h-4" />
            Nova Análise
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar análises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "seguro", "atencao", "suspeito", "perigoso"].map((level) => (
            <Button
              key={level}
              variant={filterRisk === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRisk(level)}
              className={`rounded-lg text-xs ${
                filterRisk === level ? "bg-foreground text-background" : "border-foreground/10 text-muted-foreground"
              }`}
            >
              {level === "all" ? "Todos" : riskConfig[level]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ScanSearch className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {analyses.length === 0 ? "Nenhuma análise realizada ainda" : "Nenhum resultado encontrado"}
          </p>
          {analyses.length === 0 && (
            <Link to={createPageUrl("Analyze")} className="mt-4 inline-block">
              <Button className="rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2 mt-4">
                <ScanSearch className="w-4 h-4" />
                Fazer Primeira Análise
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((analysis, i) => {
              const risk = riskConfig[analysis.risk_level] || riskConfig.seguro;
              const RiskIcon = risk.icon;

              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={createPageUrl(`${analysis.analysis_type === "video" ? "VideoAnalysisDetail" : "AnalysisDetail"}?id=${analysis.id}`)}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-card border ${risk.border} hover:scale-[1.005] transition-all duration-200 group`}
                  >
                    {analysis.analysis_type === "video" ? (
                      <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                    ) : analysis.image_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <img src={analysis.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${risk.bg} ${risk.color} ${risk.border} border text-xs`}>
                          <RiskIcon className="w-3 h-3 mr-1" />
                          {risk.label}
                        </Badge>
                        {analysis.risk_score && (
                          <span className="text-xs text-muted-foreground font-mono">{analysis.risk_score}/100</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {analysis.analysis_type === "video" ? "Análise de Vídeo" : (analysis.product_name || analysis.title || "Análise de Imagem")}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{analysis.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground/60 hidden sm:block">
                        {format(new Date(analysis.created_date), "dd/MM/yy", { locale: ptBR })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, analysis.id)}
                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}