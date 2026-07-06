import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Link2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Lock,
  Search,
  Globe,
  BadgeCheck,
  Flag,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanLimits, incrementLinkCount } from "@/lib/usePlanLimits";
import { Link } from "react-router-dom";

const riskConfig = {
  seguro: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    ring: "stroke-emerald-400",
    glow: "shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)]",
    icon: ShieldCheck,
    label: "Seguro",
    desc: "Nenhum risco relevante detectado",
  },
  atencao: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    ring: "stroke-yellow-400",
    glow: "shadow-[0_0_40px_-12px_rgba(250,204,21,0.5)]",
    icon: AlertTriangle,
    label: "Atenção",
    desc: "Alguns pontos exigem cautela",
  },
  suspeito: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    ring: "stroke-orange-400",
    glow: "shadow-[0_0_40px_-12px_rgba(251,146,60,0.5)]",
    icon: ShieldAlert,
    label: "Suspeito",
    desc: "Sinais claros de possível golpe",
  },
  perigoso: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    ring: "stroke-red-400",
    glow: "shadow-[0_0_40px_-12px_rgba(248,113,113,0.5)]",
    icon: XCircle,
    label: "Perigoso",
    desc: "Alto risco de fraude — evite",
  },
};

const scanSteps = [
  { label: "Verificando domínio e certificado", icon: Globe },
  { label: "Buscando reputação na internet", icon: Search },
  { label: "Detectando sinais de phishing", icon: ShieldAlert },
  { label: "Gerando veredicto de segurança", icon: Sparkles },
];

function ScoreGauge({ score, risk }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 120);
    return () => clearTimeout(t);
  }, [score, circumference]);

  return (
    <div className="relative w-[88px] h-[88px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} className="stroke-border" strokeWidth="6" fill="none" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          className={risk.ring}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-bold leading-none ${risk.color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function LinkAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { limits, monthlyLinkAnalyses, canAnalyzeLink, loading: limitsLoading } = usePlanLimits();

  useEffect(() => {
    if (!loading) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
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
    } catch (err) {
      setError("Não foi possível analisar este link. Verifique a URL e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? riskConfig[result.risk_level] : null;

  let displayDomain = "";
  try {
    displayDomain = url.trim() ? new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`).hostname : "";
  } catch {
    displayDomain = "";
  }

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="relative p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Verificar Link de Oferta</h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> IA + Web
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cole um link suspeito e a IA analisa domínio, reputação e sinais de golpe.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Usage counter */}
        {!limitsLoading && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              {monthlyLinkAnalyses}/{limits.linkAnalyses} verificações usadas este mês
            </span>
            <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-foreground/40 rounded-full transition-all"
                style={{ width: `${Math.min(100, (monthlyLinkAnalyses / limits.linkAnalyses) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {!limitsLoading && !canAnalyzeLink ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Você atingiu o limite de verificações de link deste mês. Faça upgrade para continuar protegido.
            </p>
            <Link to="/Premium">
              <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-xl">
                Ver planos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative flex items-center rounded-2xl border border-border bg-input focus-within:ring-2 focus-within:ring-ring/40 transition-all">
              <Globe className="w-4 h-4 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setResult(null); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229 && !loading && handleAnalyze()}
                placeholder="cole-o-link-suspeito.com/oferta"
                className="flex-1 bg-transparent pl-11 pr-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="m-1.5 rounded-xl px-5 font-semibold gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">{loading ? "Analisando" : "Analisar"}</span>
              </Button>
            </div>
            {displayDomain && !loading && !result && (
              <p className="text-xs text-muted-foreground pl-1 flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Domínio detectado: <span className="text-foreground font-medium">{displayDomain}</span>
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-400">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Scanning state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-border bg-background/50 p-4 space-y-3 overflow-hidden"
            >
              {scanSteps.map((step, i) => {
                const StepIcon = step.icon;
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? "bg-emerald-500/15" : active ? "bg-primary/10" : "bg-secondary"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : active ? (
                        <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                      ) : (
                        <StepIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-sm ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && risk && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Verdict card */}
              <div className={`rounded-2xl border p-5 ${risk.bg} ${risk.border} ${risk.glow}`}>
                <div className="flex items-center gap-4">
                  <ScoreGauge score={result.risk_score} risk={risk} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {React.createElement(risk.icon, { className: `w-4 h-4 ${risk.color}` })}
                      <span className={`text-sm font-bold uppercase tracking-wide ${risk.color}`}>{risk.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-1 leading-snug">{result.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{risk.desc}</p>
                  </div>
                </div>

                {/* Site info row */}
                {(result.site_name || typeof result.is_legitimate_site === "boolean") && (
                  <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-border/50">
                    {result.site_name && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground bg-background/60 border border-border rounded-full px-3 py-1">
                        <Globe className="w-3 h-3 text-muted-foreground" /> {result.site_name}
                      </span>
                    )}
                    {typeof result.is_legitimate_site === "boolean" && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border ${
                          result.is_legitimate_site
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                            : "text-red-400 bg-red-500/10 border-red-500/25"
                        }`}
                      >
                        <BadgeCheck className="w-3 h-3" />
                        {result.is_legitimate_site ? "Site legítimo" : "Não confiável"}
                      </span>
                    )}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                    >
                      Abrir link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* Flags grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {result.red_flags?.length > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" /> Alertas
                    </p>
                    <ul className="space-y-2">
                      {result.red_flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.green_flags?.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pontos positivos
                    </p>
                    <ul className="space-y-2">
                      {result.green_flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Recomendações
                  </p>
                  <ul className="space-y-2.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-snug pt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
