import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Mariana S.",
    role: "Comprou online com segurança",
    text: "Quase caí num anúncio de iPhone pela metade do preço. Mandei o print pro ScanShield e em segundos apareceu \u201Cgolpe detectado\u201D. Me salvou de perder R$ 2.400.",
    stars: 5,
  },
  {
    name: "Carlos E.",
    role: "Evitou boleto adulterado",
    text: "Recebi um boleto de condomínio por e-mail que parecia normal. A análise mostrou que o código de barras tinha sido trocado. Nunca mais pago nada sem verificar.",
    stars: 5,
  },
  {
    name: "Fernanda L.",
    role: "Identificou deepfake",
    text: "Um vídeo de um apresentador famoso indicando investimento parecia real demais. O ScanShield apontou sincronização labial artificial na hora. Impressionante.",
    stars: 5,
  },
  {
    name: "Roberto M.",
    role: "Protege a família toda",
    text: "Meus pais recebem golpe por WhatsApp toda semana. Ensinei eles a mandar print pro ScanShield antes de clicar em qualquer coisa. Virou rotina da família.",
    stars: 5,
  },
  {
    name: "Juliana P.",
    role: "Compradora do TikTok Shop",
    text: "Compro muito no TikTok Shop e agora analiso toda oferta antes. Já evitei três lojas fantasma. A explicação vem em linguagem simples, sem tecniquês.",
    stars: 5,
  },
  {
    name: "André T.",
    role: "Pequeno empresário",
    text: "Uso para verificar fornecedores e propostas que chegam por e-mail. O histórico de análises me ajuda a manter registro de tudo. Ferramenta essencial.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-14 sm:mb-16"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
            Quem usa, confia
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
            Milhares de golpes evitados.
            <br />
            <span className="text-foreground/40">Histórias reais.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="relative flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-foreground/15 transition-colors duration-300"
            >
              <Quote className="w-6 h-6 text-foreground/10 mb-4" aria-hidden="true" />
              <blockquote className="text-sm text-foreground/85 leading-relaxed flex-1 mb-5">
                {t.text}
              </blockquote>
              <figcaption className="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5" aria-label={`${t.stars} de 5 estrelas`}>
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
