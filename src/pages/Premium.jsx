import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Shield, Brain, MessageCircle, ScanSearch, Loader2, XCircle, Diamond, GraduationCap, X, Check, Link2 } from "lucide-react";
import ManageSubscription from "@/components/premium/ManageSubscription";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const STUDENT_CODE = "zc&t0hieSK9h/|>Z=9w1";
const STUDENT_KEY = "scanshield_student_mode";

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
    features: [
      { icon: ScanSearch, text: "5 análises por mês" },
      { icon: Link2, text: "3 verificações de link por mês" },
      { icon: MessageCircle, text: "5 dúvidas com o assistente ScanShield" },
      { icon: Shield, text: "Análise de golpes e fraudes" },
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
    features: [
      { icon: ScanSearch, text: "10 análises por mês" },
      { icon: Link2, text: "5 verificações de link por mês" },
      { icon: MessageCircle, text: "8 dúvidas com o assistente ScanShield" },
      { icon: Shield, text: "Análise de golpes e fraudes" },
      { icon: Brain, text: "Detecção de deepfake com IA" },
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
    color: "border-white/20",
    badge: "Melhor custo-benefício",
    features: [
      { icon: ScanSearch, text: "20 análises por mês" },
      { icon: Link2, text: "10 verificações de link por mês" },
      { icon: MessageCircle, text: "10 dúvidas com o assistente ScanShield" },
      { icon: Shield, text: "Análise de golpes e fraudes" },
      { icon: Brain, text: "Detecção de deepfake com IA avançada" },
      { icon: Zap, text: "Resultados prioritários e detalhados" },
    ],
  },
];

export default function Premium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [studentError, setStudentError] = useState(false);
  const [isStudent, setIsStudent] = useState(() => localStorage.getItem(STUDENT_KEY) === "true");
  const [studentSuccess, setStudentSuccess] = useState(false);

  const handleStudentSubmit = () => {
    if (studentCode === STUDENT_CODE) {
      localStorage.setItem(STUDENT_KEY, "true");
      setIsStudent(true);
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
    <div className="min-h-screen bg-background px-4 py-16">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-xl mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 font-semibold">Assinatura ativada com sucesso!</p>
            <p className="text-emerald-400/70 text-sm">Bem-vindo ao ScanShield 🎉</p>
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
      <div className={`text-center mb-12 ${user?.is_premium ? "mt-10" : ""}`}>
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-yellow-400/20 mb-4">
          <Diamond className="w-3 h-3" />
          PLANOS DE ASSINATURA
        </div>
        <h1 className="text-4xl font-black text-foreground mb-3">
          Escolha seu plano
        </h1>
        <p className="text-muted-foreground">Proteção completa contra golpes digitais. Cancele quando quiser.</p>
      </div>

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-3xl border bg-card flex flex-col overflow-visible ${plan.color} ${plan.key === "intermediario" ? "ring-2 ring-yellow-400/30" : ""} ${plan.badge ? "pt-10 px-7 pb-7" : "p-7"}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground mb-1">{plan.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground line-through">R$ {plan.originalPrice}</span>
                <span className="text-xs font-bold bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">-50%</span>
              </div>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm mb-1">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f, fi) => (
                <li key={fi} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{f.text}</span>
                </li>
              ))}
            </ul>

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

      <p className="text-center text-xs text-muted-foreground mt-8">
        Pagamento seguro via Stripe • SSL
      </p>

      {/* Student section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-md mx-auto mt-10 rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">É estudante?</p>
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
              onKeyDown={e => e.key === "Enter" && handleStudentSubmit()}
              placeholder="Digite seu código estudantil..."
              className={`flex-1 bg-input border ${studentError ? "border-red-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring`}
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
      </motion.div>

      <div className="text-center mt-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}