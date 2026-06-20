import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) return;

    setLoading(true);
    setError("");

    await base44.integrations.Core.SendEmail({
      to: "scanshield0@gmail.com",
      from_name: "ScanShield Suporte",
      subject: `[Suporte] Mensagem de ${email}`,
      body: `Nova mensagem de suporte recebida:\n\nEmail do usuário: ${email}\n\nMensagem:\n${message}`,
    });

    setSent(true);
    setLoading(false);
    setEmail("");
    setMessage("");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 mb-4">
            <MessageCircle className="w-3.5 h-3.5 text-foreground/60" />
            <span className="text-xs font-medium text-foreground/70">Suporte</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Precisa de ajuda?</h2>
          <p className="text-muted-foreground text-sm">Envie sua dúvida ou problema. Respondemos em até 24h.</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-8 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-emerald-400 font-semibold">Mensagem enviada!</p>
            <p className="text-emerald-400/70 text-sm">Entraremos em contato em breve pelo seu email.</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 mt-1"
              onClick={() => setSent(false)}
            >
              Enviar outra mensagem
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Seu email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva sua dúvida ou problema..."
                rows={4}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="w-4 h-4" /> Enviar mensagem</>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}