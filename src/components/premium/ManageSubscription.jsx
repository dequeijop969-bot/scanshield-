import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    key: "iniciante",
    name: "Iniciante",
    price: "7,99",
    priceId: "price_1TWpZ0GzVbIA8RAWo4JGfmUY",
    analyses: 5,
    features: ["5 análises/mês", "5 dúvidas com assistente", "Análise de golpes e fraudes"],
  },
  {
    key: "intermediario",
    name: "Intermediário",
    price: "14,99",
    priceId: "price_1TWpZ1GzVbIA8RAWfEpCSwxw",
    analyses: 10,
    features: ["10 análises/mês", "8 dúvidas com assistente", "Análise de golpes e fraudes", "Detecção de deepfake"],
  },
  {
    key: "pro",
    name: "PRO",
    price: "29,99",
    priceId: "price_1TWpZ1GzVbIA8RAWIvBrNlTH",
    analyses: 25,
    features: ["20 análises/mês", "10 dúvidas com assistente", "Análise de golpes e fraudes", "Deepfake avançado", "Resultados prioritários"],
  },
];

export default function ManageSubscription({ user, onUpdated }) {
  const [upgradeLoading, setUpgradeLoading] = useState(null);

  const currentPlanIndex = plans.findIndex(p => p.priceId === user.plan_price_id);
  const currentPlanName = user.plan_name || plans[currentPlanIndex]?.name || "Premium";
  const isCanceling = user.cancel_at_period_end;

  const handleUpgrade = async (plan) => {
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      alert("O checkout só funciona no app publicado. Abra o app em uma nova aba para assinar.");
      return;
    }

    setUpgradeLoading(plan.key);
    const res = await base44.functions.invoke("createCheckout", {
      origin: window.location.origin,
      priceId: plan.priceId,
      planName: plan.name,
    });

    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Erro ao iniciar checkout. Tente novamente.");
      setUpgradeLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {/* Current Plan Banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${isCanceling ? "border-orange-400/30 bg-orange-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className={`w-5 h-5 ${isCanceling ? "text-orange-400" : "text-emerald-400"}`} />
            <div>
              <p className={`font-bold ${isCanceling ? "text-orange-400" : "text-emerald-400"}`}>
                Plano atual: {currentPlanName}
              </p>
              {isCanceling ? (
                <p className="text-xs text-orange-400/70">Cancelamento agendado para o fim do período atual</p>
              ) : (
                <p className="text-xs text-emerald-400/70">Assinatura ativa</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Upgrade Options */}
      {!isCanceling && currentPlanIndex < plans.length - 1 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Fazer upgrade</p>
          <div className="space-y-3">
            {plans.slice(currentPlanIndex + 1).map((plan) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpCircle className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-foreground">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">R$ {plan.price}/mês</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={upgradeLoading !== null}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm h-10 px-5 rounded-xl flex-shrink-0"
                >
                  {upgradeLoading === plan.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Upgrade para ${plan.name}`
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}