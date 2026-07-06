import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquareWarning,
  Video,
  Landmark,
  ShoppingCart,
  UserRoundX,
  QrCode,
} from "lucide-react";

const threats = [
  {
    icon: ShoppingCart,
    title: "Ofertas falsas",
    desc: "Anúncios com preços irreais, lojas fantasma e páginas de pagamento clonadas.",
    tag: "Muito comum",
  },
  {
    icon: Video,
    title: "Deepfakes em vídeo",
    desc: "Famosos e conhecidos \u201Cindicando\u201D investimentos que nunca existiram.",
    tag: "Em alta",
  },
  {
    icon: MessageSquareWarning,
    title: "Phishing por mensagem",
    desc: "WhatsApp, SMS e e-mails se passando por bancos, lojas e órgãos públicos.",
    tag: "Muito comum",
  },
  {
    icon: Landmark,
    title: "Boletos adulterados",
    desc: "Códigos de barras trocados para desviar o pagamento para golpistas.",
    tag: "Perigoso",
  },
  {
    icon: QrCode,
    title: "QR Codes maliciosos",
    desc: "Códigos que levam a páginas falsas de pagamento ou roubo de dados.",
    tag: "Em alta",
  },
  {
    icon: UserRoundX,
    title: "Perfis falsos",
    desc: "Golpes de romance, falsos vendedores e imitações de pessoas reais.",
    tag: "Comum",
  },
];

export default function ThreatTypes() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400/80 uppercase mb-4">
              Ameaças detectadas
            </p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
              O golpe muda de cara.
              <br />
              <span className="text-foreground/40">A IA reconhece todas.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            O modelo é treinado continuamente com golpes reais aplicados no Brasil.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {threats.map((threat, i) => (
            <motion.div
              key={threat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60 hover:border-red-500/25 hover:bg-red-500/[0.03] transition-colors duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <threat.icon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-bold text-foreground">{threat.title}</h3>
                  <span className="text-[10px] font-semibold text-red-400/80 bg-red-500/10 border border-red-500/15 rounded-full px-2 py-0.5">
                    {threat.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{threat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
