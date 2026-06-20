import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ExternalLink, Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function SourcesButton({ analysis }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState(null);

  const fetchSources = async () => {
    if (sources) { setOpen(o => !o); return; }
    setLoading(true);
    setOpen(true);
    try {
      const prompt = `Com base nesta análise de segurança, liste de 3 a 5 fontes de informação confiáveis e relevantes que embasam o resultado. 
      Título: ${analysis.title}
      Tipo de análise: ${analysis.analysis_type}
      Resumo: ${analysis.summary}
      Nível de risco: ${analysis.risk_level}
      
      Retorne fontes reais e verificáveis que um usuário poderia consultar para confirmar as informações.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            context: { type: "string" }
          }
        }
      });
      setSources(result);
    } catch (e) {
      setSources({ sources: [], context: "Não foi possível carregar as fontes no momento." });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        onClick={fetchSources}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Fontes de Informação</p>
            <p className="text-xs text-muted-foreground">Ver referências usadas pela IA</p>
          </div>
        </div>
        {loading ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        ) : open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando fontes confiáveis...
                </div>
              ) : (
                <>
                  {sources?.context && (
                    <p className="text-xs text-muted-foreground mb-3">{sources.context}</p>
                  )}
                  {sources?.sources?.length > 0 ? (
                    sources.sources.map((src, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{src.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{src.description}</p>
                          {src.category && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 mt-1.5">
                              {src.category}
                            </span>
                          )}
                        </div>
                        {src.url && src.url.startsWith("http") && (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-1">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma fonte encontrada.</p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}