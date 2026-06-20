import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, Send, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "scanshield0@gmail.com",
      from_name: "ScanShield Suporte",
      subject: `[Suporte] Mensagem de ${email}`,
      body: `Nova mensagem de suporte:\n\nEmail: ${email}\n\nMensagem:\n${message}`,
    });
    setSent(true);
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSent(false); setEmail(""); setMessage(""); }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Suporte</h2>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <p className="text-sm font-medium text-foreground">Mensagem enviada!</p>
                <p className="text-xs text-muted-foreground">Respondemos em até 24h no seu email.</p>
                <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={handleClose}>Fechar</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Seu email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mensagem</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Como podemos ajudar?"
                    rows={3}
                    className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl text-sm font-medium gap-2">
                  {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</> : <><Send className="w-3.5 h-3.5" /> Enviar</>}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}