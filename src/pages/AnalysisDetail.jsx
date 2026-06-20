import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import RiskBanner from "@/components/detail/RiskBanner";
import AnalysisChat from "@/components/detail/AnalysisChat";
import PriceComparison from "@/components/detail/PriceComparison";
import FlagsList from "@/components/detail/FlagsList";
import Recommendations from "@/components/detail/Recommendations";
import DetailedAnalysis from "@/components/detail/DetailedAnalysis";
import FeedbackPanel from "@/components/detail/FeedbackPanel";
import DeepfakeResult from "@/components/detail/DeepfakeResult";
import SourcesButton from "@/components/detail/SourcesButton";

export default function AnalysisDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["analysis", id],
    queryFn: async () => {
      const results = await base44.entities.ScreenAnalysis.filter({ id });
      return results[0];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">Análise não encontrada</p>
        <Link to={createPageUrl("Home")}>
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("History")}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">{analysis.title}</h1>
          <p className="text-xs text-muted-foreground">
            {format(new Date(analysis.created_date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Image */}
      {analysis.image_url && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-border">
          <img src={analysis.image_url} alt="Captura analisada" className="w-full max-h-[300px] object-contain bg-black/20" />
        </div>
      )}

      <div className="space-y-4">
        {/* Risk Banner */}
        <RiskBanner riskLevel={analysis.risk_level} riskScore={analysis.risk_score} />

        {/* Chat IA */}
        <AnalysisChat analysis={analysis} user={user} />

        {/* Summary */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Seller Info — oculto em deepfake */}
        {analysis.seller_info && analysis.analysis_type !== "deepfake" && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm">Informações do Vendedor</h3>
            </div>
            <p className="text-sm text-muted-foreground">{analysis.seller_info}</p>
          </div>
        )}

        {/* Deepfake Result */}
        <DeepfakeResult analysis={analysis} />

        {/* Price Comparison — oculto em deepfake */}
        {analysis.analysis_type !== "deepfake" && <PriceComparison
          priceFound={analysis.price_found}
          estimatedMarketPrice={analysis.estimated_market_price}
          priceVerdict={analysis.price_verdict}
          productName={analysis.product_name}
        />}

        {/* Flags */}
        <FlagsList redFlags={analysis.red_flags} greenFlags={analysis.green_flags} />

        {/* Recommendations */}
        <Recommendations recommendations={analysis.recommendations} />

        {/* Detailed Analysis */}
        <DetailedAnalysis content={analysis.detailed_analysis} />

        {/* Sources */}
        <SourcesButton analysis={analysis} />

        {/* Feedback */}
        <FeedbackPanel analysis={analysis} onFeedbackSaved={() => {}} />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link to={createPageUrl("Analyze")} className="flex-1">
            <Button className="w-full h-12 rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2">
              Nova Análise
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}