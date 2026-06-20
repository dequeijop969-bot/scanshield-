import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const RISK_LEVELS = [
  { value: "seguro", label: "Seguro", color: "text-emerald-400" },
  { value: "atencao", label: "Atenção", color: "text-yellow-400" },
  { value: "suspeito", label: "Suspeito", color: "text-orange-400" },
  { value: "perigoso", label: "Perigoso", color: "text-red-400" },
];

export default function FeedbackPanel({ analysis, onFeedbackSaved }) {
  const [feedback, setFeedback] = useState(analysis.user_feedback || null);
  const [realRiskLevel, setRealRiskLevel] = useState(analysis.real_risk_level || "");
  const [comment, setComment] = useState(analysis.feedback_comment || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!analysis.user_feedback);

  const handleSave = async () => {
    if (!feedback) return;
    setSaving(true);
    await base44.entities.ScreenAnalysis.update(analysis.id, {
      user_feedback: feedback,
      feedback_comment: comment,
      real_risk_level: feedback === "incorreto" ? realRiskLevel : "",
    });
    setSaving(false);
    setSaved(true);
    onFeedbackSaved?.();
  };

  if (saved && !analysis.user_feedback) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-card border border-border text-center">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Feedback salvo! A IA aprenderá com isso.</p>
      </motion.div>
    );
  }

  if (saved) {
    const icons = { correto: ThumbsUp, incorreto: ThumbsDown, parcialmente_correto: AlertCircle };
    const Icon = icons[analysis.user_feedback] || ThumbsUp;
    const labels = { correto: "Correto", incorreto: "Incorreto", parcialmente_correto: "Parcialmente correto" };
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span>Seu feedback: <strong className="text-foreground">{labels[analysis.user_feedback]}</strong></span>
        </div>
        {analysis.feedback_comment && (
          <p className="text-xs text-muted-foreground mt-2">"{analysis.feedback_comment}"</p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card border border-border space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">A análise foi precisa?</h3>
      </div>

      <div className="flex gap-2">
        {[
          { value: "correto", label: "Correto", icon: ThumbsUp, activeClass: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" },
          { value: "parcialmente_correto", label: "Parcial", icon: AlertCircle, activeClass: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400" },
          { value: "incorreto", label: "Incorreto", icon: ThumbsDown, activeClass: "bg-red-500/10 border-red-500/40 text-red-400" },
        ].map(({ value, label, icon: Icon, activeClass }) => (
          <button
            key={value}
            onClick={() => setFeedback(value)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
              feedback === value ? activeClass : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {feedback === "incorreto" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Qual era o risco real?</p>
          <div className="flex gap-2 flex-wrap">
            {RISK_LEVELS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setRealRiskLevel(value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  realRiskLevel === value
                    ? `border-white/30 bg-white/10 ${color}`
                    : "border-border text-muted-foreground hover:border-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário opcional (ex: era um golpe de WhatsApp...)"
        className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-white/30 h-20"
      />

      <Button
        onClick={handleSave}
        disabled={!feedback || saving}
        className="w-full h-10 rounded-xl bg-white hover:bg-white/90 text-black text-sm font-semibold"
      >
        {saving ? "Salvando..." : "Enviar Feedback"}
      </Button>
    </motion.div>
  );
}