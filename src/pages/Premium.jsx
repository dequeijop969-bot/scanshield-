import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Shield, Brain, MessageCircle, ScanSearch, Loader2, XCircle, Diamond, GraduationCap, Check, Link2, Video, Lock } from "lucide-react";
import ManageSubscription from "@/components/premium/ManageSubscription";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useStudentMode } from "@/lib/useStudentMode";

const FREE_PLAN = {
  key: "gratuito",
  name: "Gratuito",
  price: "0",
  features: [
    { icon: ScanSearch, text: "3 análises de imagem por mês", included: true },
    { icon: Link2, text: "3 verificações de link por mês", included: true },
    { icon: MessageCircle, text: "3 dúvidas com o assistente", included: true },
    { icon: Shield, text: "Análise básica de golpes", included: true },
    { icon: Brain, text: "Detecção de deepfake", included: false },
    { icon: Video, text: "Análise de vídeos", included: false },
  ],
};

const plans = [
  {
    key: "iniciante",
    name: "Iniciante",
    price: "7,99",
    originalPrice: "15,99",
    priceId: "price_1TX0Ak3KciUEgIQSJXTBh0Hu",
    analyses: 5,
    questions: 5,
    color: "border-border",
    badge: null,
    tagline: "Para quem está começando",
    features: [
      { icon: ScanSearch, text: "5 análises por mês", included: true },
      { icon: Link2, text: "3 verificações de link por mês", included: true },
      { icon: MessageCircle, text: "5 dúvidas com o assistente ScanShield", included: true },
      { icon: Shield, text: "Análise de golpes e fraudes", included: true },
      { icon: Brain, text: "Detecção de deepfake", included: false },
      { icon: Video, text: "Análise de vídeos", included: false },
    ],
  },
  {
    key: "intermediario",
    name: "Intermediário",
    price: "14,99",
    originalPrice: "29,99",
    priceId: "price_1TX0ED3KciUEgIQS8qf3MlS9",
    analyses: 10,
    questions: 8,
    color: "border-yellow-400/50",
    badge: "Mais popular",
    tagline: "Proteção completa no dia a dia",
    features: [
      { icon: ScanSearch, text: "10 análises por mês", included: true },
      { icon: Link2, text: "5 verificações de link por mês", included: true },
      { icon: MessageCircle, text: "8 dúvidas com o assistente ScanShield", included: true },
      { icon: Shield, text: "Análise de golpes e fraudes", included: true },
      { icon: Brain, text: "Detecção de deepfake com IA", included: true },
      { icon: Video, text: "5 análises de vídeo por mês", included: true },
    ],
  },
  {
    key: "pro",
    name: "PRO",
    price: "29,99",
    originalPrice: "59,99",
    priceId: "price_1TX0Ej3KciUEgIQSv0nAlOzT",
    checkoutMode: "payment",
    analyses: 20,
    questions: 10,
    color: "border-foreground/25",
    badge: "Melhor custo-benefício",
    tagline: "Máxima proteção e prioridade",
    features: [
      { icon: ScanSearch, text: "20 análises por mês", included: true },
      { icon: Link2, text: "10 verificações de link por mês", included: true },
      { icon: MessageCircle, text: "10 dúvidas com o assistente ScanShield", included: true },
      { icon: Shield, text: "Análise de golpes e fraudes", included: true },
      { icon: Brain, text: "Detecção de deepfake com IA avançada", included: true },
      { icon: Video, text: "10 análises de vídeo por mês", included: true },
      { icon: Zap, text: "Resultados prioritários e detalhados", included: true },
    ],
  },
];

function FeatureList({ features }) {
  return (
    <ul className="flex flex-col gap-3 mb-8 flex-1">
      {features.map((f, fi) => (
        <li key={fi} className={`flex items-center gap-3 ${!f.included ? "opacity-40" : ""}`}>
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${f.included ? "bg-emerald-500/10" : "bg-foreground/5"}`}>
            {f.included
              ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              : <XCircle className="w-3 h-3 text-muted-foreground" />
            }
          </div>
          <span className="text-sm text-foreground leading-snug">{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Premium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [studentError, setStudentError] = useState(false);
  const { isStudent, activate } = useStudentMode();
  const [studentSuccess, setStudentSuccess] = useState(false);

  const handleStudentSubmit = () => {
    if (activate(studentCode.trim())) {
      setStudentSuccess(true);
      setStudentError(false);
      setStudentCode("");
    } else {
      setStudentError(true);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const success = params.get("success") === "true";
  const canceled = params.get("canceled") === "true";

  const loadUser = () => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      // Abre o app publicado em nova aba para permitir o checkout
      window.open("https://scan-shield-169bd2a0.base44.app/Premium", "_blank");
      return;
    }

    setCheckoutLoading(plan.key);
    const res = await base44.functions.invoke("createCheckout", {
      origin: window.location.origin,
      priceId: plan.priceId,
      planName: plan.name,
      mode: plan.checkoutMode || "subscription",
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Erro ao iniciar checkout. Tente novamente.");
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 relative overflow-hidden">
      {/* Grid de fundo sutil */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-xl mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 font-semibold">Assinatura ativada com sucesso!</p>
              <p className="text-emerald-400/70 text-sm">Bem-vindo ao ScanShield</p>
            </div>
          </motion.div>
        )}

        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-xl mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 flex items-center gap-3"
          >
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-400 font-semibold">Assinatura cancelada. Tente novamente quando quiser.</p>
          </motion.div>
        )}

        {/* Manage Subscription (for premium users) */}
        {user?.is_premium && (
          <ManageSubscription user={user} onUpdated={loadUser} />
        )}

        {/* Header */}
        <div className={`text-center mb-14 ${user?.is_premium ? "mt-10" : ""}`}>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400 mb-5">
            <Diamond className="w-3 h-3" />
            Planos de assinatura
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-4 text-balance">
            Proteção que cabe
            <br />
            no seu bolso.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-pretty">
            Escolha o plano ideal e fique protegido contra golpes digitais. Cancele quando quiser.
          </p>
        </div>

        {/* Plans grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {/* Free plan card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="relative rounded-3xl border border-border bg-card flex flex-col p-7 opacity-90"
          >
            <div className="mb-6">
              <h2 className="text-lg font-black tracking-tight text-foreground">{FREE_PLAN.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Para experimentar</p>
              <div className="flex items-end gap-1 mt-4">
                <span className="text-4xl font-black tracking-tighter text-foreground">R$0</span>
                <span className="text-muted-foreground text-sm mb-1">/mês</span>
              </div>
            </div>
            <FeatureList features={FREE_PLAN.features} />
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground/5 border border-border">
              <span className="text-muted-foreground font-semibold text-sm">Plano atual gratuito</span>
            </div>
          </motion.div>

          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border bg-card flex flex-col overflow-visible transition-shadow ${plan.color} ${
                plan.key === "intermediario"
                  ? "ring-2 ring-yellow-400/30 shadow-[0_0_50px_-15px_rgba(250,204,21,0.25)]"
                  : ""
              } ${plan.badge ? "pt-10 px-7 pb-7" : "p-7"}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${
                      plan.key === "intermediario"
                        ? "bg-yellow-400 text-black"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-black tracking-tight text-foreground">{plan.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground line-through">R$ {plan.originalPrice}</span>
                  <span className="font-mono text-[10px] font-bold bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/20">
                    -50%
                  </span>
                </div>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-sm text-muted-foreground mb-1.5">R$</span>
                  <span className="text-4xl font-black tracking-tighter text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/mês</span>
                </div>
              </div>

              <FeatureList features={plan.features} />

              {user ? (
                user.is_premium ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">Plano ativo</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={checkoutLoading !== null}
                    className={`w-full h-11 rounded-xl text-sm font-bold ${
                      plan.key === "intermediario"
                        ? "bg-yellow-400 text-black hover:bg-yellow-300"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {checkoutLoading === plan.key ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecionando...</>
                    ) : (
                      "Assinar agora"
                    )}
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin("/Premium")}
                  className="w-full h-11 rounded-xl text-sm font-bold"
                >
                  Entrar para assinar
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Pagamento seguro via Stripe · SSL
          </p>
        </div>

        {/* Student section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto mt-12 rounded-2xl border border-emerald-500/20 bg-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-emerald-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              Benefício estudantil
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">É estudante?</p>
                <p className="text-xs text-muted-foreground">Insira seu código estudantil para ativar o modo especial</p>
              </div>
            </div>

            {isStudent || studentSuccess ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-emerald-400 font-medium">Modo estudante ativado com sucesso!</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentCode}
                  onChange={e => { setStudentCode(e.target.value); setStudentError(false); }}
                  onKeyDown={e => e.key === "Enter" && !e.nativeEvent.isComposing && handleStudentSubmit()}
                  placeholder="Digite seu código estudantil..."
                  className={`flex-1 min-w-0 bg-input border ${studentError ? "border-red-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring`}
                />
                <Button
                  onClick={handleStudentSubmit}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4"
                >
                  Ativar
                </Button>
              </div>
            )}
            {studentError && <p className="text-xs text-red-400 mt-2">Código inválido. Verifique e tente novamente.</p>}
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
