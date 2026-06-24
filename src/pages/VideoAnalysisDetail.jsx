import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Video, ShieldCheck, ShieldAlert, ShieldX,
  AlertTriangle, CheckCircle, Lightbulb, FileText,
  ChevronDown, ChevronUp, ScanSearch, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RiskBanner from "@/components/detail/RiskBanner";
import FlagsList from "@/components/detail/FlagsList";
import Recommendations from "@/components/detail/Recommendations";
import DetailedAnalysis from "@/components/detail/DetailedAnalysis";
import FeedbackPanel from "@/components/detail/FeedbackPanel";

const RISK_SCORE_MAP = {
  seguro: 12,
  atencao: 45,
  suspeito: 68,
  perigoso: 92,
};

export default function VideoAnalysisDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["video-analysis", id],
    queryFn: async () => {
      const results = await base44.entities.ScreenAnalysis.filter({ id });
      return results[0];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Carregando análise...
        </motion.p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">Análise não encontrada</p>
        <Link to={createPageUrl("History")}>
          <Button variant="outline">Voltar ao histórico</Button>
        </Link>
      </div>
    );
  }

  const riskScore = RISK_SCORE_MAP[analysis.risk_level] ?? 50;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-6"
      >
        <Link to={createPageUrl("History")}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              Análise de Vídeo
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(
              new Date(analysis.created_at || analysis.created_date),
              "dd 'de' MMMM 'de' yyyy, HH:mm",
              { locale: ptBR }
            )}
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Risk Banner — reutiliza o componente exato da análise de imagem */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <RiskBanner riskLevel={analysis.risk_level} riskScore={riskScore} />
        </motion.div>

        {/* Resumo */}
        {analysis.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Resumo da Análise</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </motion.div>
        )}

        {/* Flags */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <FlagsList
            redFlags={analysis.red_flags || []}
            greenFlags={analysis.green_flags || []}
          />
        </motion.div>

        {/* Recomendações */}
        {analysis.recommendations?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Recommendations recommendations={analysis.recommendations} />
          </motion.div>
        )}

        {/* Análise detalhada */}
        {analysis.detailed_analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <DetailedAnalysis content={analysis.detailed_analysis} />
          </motion.div>
        )}

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <FeedbackPanel analysis={analysis} onFeedbackSaved={() => {}} />
        </motion.div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <Link to={createPageUrl("Analyze")} className="flex-1">
            <Button className="w-full h-12 rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2">
              <ScanSearch className="w-4 h-4" />
              Nova Análise
            </Button>
          </Link>
          <Link to={createPageUrl("History")}>
            <Button variant="outline" className="h-12 rounded-xl px-5">
              Histórico
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
