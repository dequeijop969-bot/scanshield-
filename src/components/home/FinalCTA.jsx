import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function FinalCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 sm:px-12 sm:py-20 text-center"
      >
        {/* Glow decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground/5 border border-foreground/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-foreground text-balance max-w-2xl leading-tight">
            Não caia no próximo golpe. Verifique antes.
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl text-pretty leading-relaxed">
            Envie uma imagem ou vídeo suspeito agora e receba o veredito da nossa IA em segundos. Grátis para começar.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 rounded-xl font-bold text-base gap-2"
            >
              <Link to={createPageUrl("Analyze")}>
                Analisar agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-xl font-semibold text-base border-border bg-transparent"
            >
              <Link to={createPageUrl("Premium")}>Conhecer o Premium</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Sem cartão de crédito. Análise gratuita todos os dias.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
