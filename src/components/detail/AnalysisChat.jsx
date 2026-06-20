import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp, Bot, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { getPlanLimits } from "@/lib/usePlanLimits";

export default function AnalysisChat({ analysis, user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Olá! Sou o **ScanShield**, seu assistente de segurança digital. Posso tirar todas as suas dúvidas sobre a análise de "${analysis.title}". O que você gostaria de saber?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  const limits = getPlanLimits(user);
  // Conta apenas mensagens do usuário (excluindo a saudação inicial do assistente)
  const userMessagesCount = messages.filter(m => m.role === "user").length;
  const questionsExhausted = userMessagesCount >= limits.questions;

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const context = `
Contexto da análise:
- Título: ${analysis.title}
- Tipo: ${analysis.analysis_type}
- Nível de risco: ${analysis.risk_level} (score: ${analysis.risk_score}/100)
- Resumo: ${analysis.summary}
- Sinais de alerta: ${(analysis.red_flags || []).join(", ") || "Nenhum"}
- Pontos positivos: ${(analysis.green_flags || []).join(", ") || "Nenhum"}
- Recomendações: ${(analysis.recommendations || []).join("; ") || "Nenhuma"}
- Análise detalhada: ${analysis.detailed_analysis || ""}
${analysis.analysis_type === "deepfake" ? `- Probabilidade de deepfake: ${analysis.deepfake_probability}%\n- Artefatos: ${(analysis.deepfake_artifacts || []).join(", ")}` : ""}
    `.trim();

    const historyForPrompt = newMessages
      .map((m) => `${m.role === "user" ? "Usuário" : "IA"}: ${m.content}`)
      .join("\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o ScanShield, assistente de segurança digital. Sempre se identifique como ScanShield quando perguntado. Responda de forma clara, direta e em português brasileiro. Baseie-se no contexto da análise fornecida abaixo e também em informações atualizadas da internet quando necessário.

${context}

Histórico da conversa:
${historyForPrompt}

Responda de forma útil e objetiva à última mensagem do usuário. IMPORTANTE: Ao final da resposta, sempre liste as fontes consultadas no formato:

📚 **Fontes:**
- [Nome da fonte ou URL]
- ...

Se a resposta for baseada apenas na análise interna, indique: "📚 **Fonte:** Análise interna do ScanShield"`,
      add_context_from_internet: true,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tirar dúvidas com o ScanShield</p>
            <p className="text-xs text-muted-foreground">Pergunte sobre esta análise</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Chat body */}
      {open && (
        <div className="border-t border-border">
          {/* Messages */}
          <div className="flex flex-col gap-3 p-4 max-h-72 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Analisando...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {questionsExhausted ? (
            <div className="border-t border-border p-4 flex flex-col items-center gap-2 text-center">
              <Lock className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-muted-foreground">
                Você usou todas as {limits.questions} dúvida{limits.questions > 1 ? "s" : ""} do seu plano.
              </p>
              <Link to="/Premium">
                <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-xs">
                  Fazer upgrade
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border-t border-border p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Faça uma pergunta... (${userMessagesCount}/${limits.questions} usadas)`}
                disabled={isLoading}
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:outline-none focus:border-border disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}