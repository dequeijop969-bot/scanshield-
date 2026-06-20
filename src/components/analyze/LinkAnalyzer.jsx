import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, XCircle, ExternalLink, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanLimits, incrementLinkCount } from "@/lib/usePlanLimits";
import { Link } from "react-router-dom";

const riskConfig = {
  seguro: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: ShieldCheck, label: "Seguro" },
  atencao: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: AlertTriangle, label: "Atenção" },
  suspeito: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: ShieldAlert, label: "Suspeito" },
  perigoso: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, label: "Perigoso" },
};

export default function LinkAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { limits, monthlyLinkAnalyses, canAnalyzeLink, loading: limitsLoading } = usePlanLimits();

  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o ScanShield, especialista em segurança digital. Analise este link de oferta com MÁXIMA profundidade:

URL: ${trimmedUrl}

🔍 ANALISE OBRIGATORIAMENTE:
1. **Domínio e autenticidade**: O domínio é legítimo? É um site oficial ou imitação? Verifique WHOIS, idade do domínio, reputação.
2. **Análise da oferta**: O produto/serviço anunciado é real? O preço é compatível com o mercado?
3. **Sinais de phishing**: URL encurtada, subdomínios suspeitos, HTTPS ausente, redirecionamentos maliciosos.
4. **Reputação do vendedor**: O site/loja tem histórico de reclamações? É conhecido no Brasil?
5. **Riscos ao consumidor**: Roubo de dados, cobrança indevida, produto que nunca chega, assinaturas ocultas.
6. **Técnicas de manipulação**: Urgência falsa, contagem regressiva, estoque limitado fake.
7. **Veredicto final**: É seguro clicar/comprar ou é uma armadilha?

Seja ESPECÍFICO sobre o que encontrou no link. Não seja genérico.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string", enum: ["seguro", "atencao", "suspeito", "perigoso"] },
          risk_score: { type: "number" },
          title: { type: "string" },
          summary: { type: "string" },
          red_flags: { type: "array", items: { type: "string" } },
          green_flags: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          site_name: { type: "string" },
          is_legitimate_site: { type: "boolean" },
        },
        required: ["risk_level", "risk_score", "title", "summary", "red_flags", "green_flags", "recommendations"],
      },
    });

    incrementLinkCount();
    setResult(analysisResult);
    setLoading(false);
  };

  const risk = result ? riskConfig[result.risk_level] : null;
  const RiskIcon = risk?.icon;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Verificar Link de Oferta</h3>
          <p className="text-xs text-muted-foreground">Cole um link suspeito para a IA analisar</p>
        </div>
      </div>

      {!limitsLoading && (
        <div className="text-xs text-muted-foreground mb-1">
          <Link2 className="w-3 h-3 inline mr-1" />
          {monthlyLinkAnalyses}/{limits.linkAnalyses} verificações de link usadas este mês
        </div>
      )}

      {!limitsLoading && !canAnalyzeLink ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Lock className="w-6 h-6 text-yellow-400" />
          <p className="text-sm text-muted-foreground">Limite de verificações de link atingido este mês.</p>
          <Link to="/Premium">
            <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
              Ver planos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setResult(null); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyze()}
            placeholder="https://oferta-imperdivel.com/produto..."
            className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="rounded-xl px-5 font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar"}
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Consultando o link com IA e buscando dados na internet...
        </div>
      )}

      <AnimatePresence>
        {result && risk && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Risk badge */}
            <div className={`flex items-center gap-3 rounded-xl border p-4 ${risk.bg} ${risk.border}`}>
              <RiskIcon className={`w-6 h-6 flex-shrink-0 ${risk.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${risk.color}`}>{risk.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.bg} ${risk.color} border ${risk.border}`}>
                    Score: {result.risk_score}/100
                  </span>
                </div>
                <p className="text-sm text-foreground font-semibold mt-0.5">{result.title}</p>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground">{result.summary}</p>

            {/* Red flags */}
            {result.red_flags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">⚠️ Alertas</p>
                <ul className="space-y-1">
                  {result.red_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Green flags */}
            {result.green_flags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">✅ Pontos positivos</p>
                <ul className="space-y-1">
                  {result.green_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">💡 Recomendações</p>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}