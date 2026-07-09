import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como o ScanShield detecta golpes em imagens e vídeos?",
    a: "Nossa IA analisa o conteúdo em múltiplas camadas: padrões visuais de fraude, metadados do arquivo, sinais de manipulação por IA (deepfakes), links e códigos presentes na imagem, e cruza tudo com uma base de golpes reais aplicados no Brasil. O resultado chega em segundos, com o nível de risco e os sinais encontrados explicados em linguagem simples.",
  },
  {
    q: "O ScanShield é gratuito?",
    a: "Sim! Você pode fazer análises gratuitas todos os dias, sem precisar de cartão de crédito. Para quem precisa de mais análises, análise de vídeos mais longos e recursos avançados, oferecemos o plano Premium.",
  },
  {
    q: "Minhas imagens e vídeos ficam seguros?",
    a: "Totalmente. Todo conteúdo enviado é processado com criptografia, fica vinculado apenas à sua conta e nunca é compartilhado com terceiros. Você pode excluir seu histórico e sua conta a qualquer momento.",
  },
  {
    q: "O que devo fazer se a análise apontar um golpe?",
    a: "Não clique em links, não faça pagamentos e não compartilhe dados pessoais. A análise do ScanShield inclui recomendações práticas para cada caso — como denunciar o golpe e proteger suas contas. Em caso de prejuízo, registre um boletim de ocorrência.",
  },
  {
    q: "O ScanShield detecta deepfakes?",
    a: "Sim. A IA identifica sinais de manipulação como sincronização labial artificial, artefatos de geração por IA no rosto, vozes sintéticas e inconsistências visuais — muito usados em vídeos falsos de famosos indicando investimentos.",
  },
  {
    q: "Funciona com golpes do WhatsApp, Pix e boletos?",
    a: "Funciona. Basta enviar o print da conversa, do comprovante ou do boleto. A IA verifica códigos de barras adulterados, beneficiários suspeitos, links maliciosos e padrões de engenharia social típicos de golpes brasileiros.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
              Perguntas frequentes
            </p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05] text-balance mb-4">
              Ficou com dúvida?
              <br />
              <span className="text-foreground/40">A gente responde.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Não encontrou o que procurava? Fale com a gente pelo botão de
              suporte no rodapé da página.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-border/60"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline hover:text-foreground/80 py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
