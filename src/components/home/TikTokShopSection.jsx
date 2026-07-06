import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Tag, Sparkles, Bot, ScanSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const signals = [
  {
    icon: Tag,
    title: "Preços baixos demais",
    desc: "Produtos muito baratos costumam ser isca: falsificações, itens que nunca chegam ou lojas fantasma.",
  },
  {
    icon: Bot,
    title: "Propagandas feitas por IA",
    desc: "Vozes sintéticas, avatares gerados e depoimentos falsos criados por IA para parecer confiável.",
  },
  {
    icon: Sparkles,
    title: "Urgência e escassez fake",
    desc: "\u201CÚltimas unidades\u201D e contadores regressivos que forçam a compra por impulso.",
  },
];

export default function TikTokShopSection() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Feito para o TikTok Shop
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance mb-5">
              <span className="inline-flex items-center gap-2.5 flex-wrap">
                Comprando no
                <span className="inline-flex items-center gap-2 rounded-xl bg-foreground/[0.06] border border-border/60 px-2.5 py-1">
                  <img
                    src="/tiktok-logo.svg"
                    alt="TikTok Shop"
                    className="w-7 h-7 sm:w-9 sm:h-9"
                  />
                  <span>TikTok Shop</span>
                </span>
                ?
              </span>
              <br />
              <span className="text-foreground/40">Passe antes pelo ScanShield.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mb-8 text-pretty">
              O TikTok Shop virou o playground perfeito para golpes: ofertas com preços
              baixos demais e propagandas geradas por IA que parecem reais. Antes de
              comprar, mande o print ou o vídeo do anúncio para o ScanShield e descubra em
              segundos se aquela oferta é confiável ou uma cilada.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/Analyze">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2.5"
                >
                  <ScanSearch className="w-5 h-5" />
                  Analisar uma oferta
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Sinais de alerta */}
          <div className="flex flex-col gap-4">
            {signals.map((signal, i) => (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/25 hover:bg-primary/[0.03] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <signal.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-foreground">{signal.title}</h3>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{signal.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
