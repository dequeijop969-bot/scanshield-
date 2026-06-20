import React from "react";
import { TrendingDown, TrendingUp, Minus, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function PriceComparison({ priceFound, estimatedMarketPrice, priceVerdict, productName }) {
  if (!priceFound && !estimatedMarketPrice) return null;

  const diff = priceFound && estimatedMarketPrice
    ? ((priceFound - estimatedMarketPrice) / estimatedMarketPrice * 100).toFixed(0)
    : null;

  const isGoodDeal = diff && Number(diff) < -10;
  const isBadDeal = diff && Number(diff) > 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-5 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Comparação de Preço</h3>
      </div>

      {productName && (
        <p className="text-sm text-muted-foreground mb-4">Produto: <span className="text-foreground font-medium">{productName}</span></p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Preço encontrado</p>
          <p className="text-xl font-bold text-foreground">
            {priceFound ? `R$ ${priceFound.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "--"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Preço de mercado</p>
          <p className="text-xl font-bold text-foreground">
            {estimatedMarketPrice ? `R$ ${estimatedMarketPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "--"}
          </p>
        </div>
      </div>

      {diff && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${
          isGoodDeal ? "bg-emerald-500/10 border border-emerald-500/20" :
          isBadDeal ? "bg-red-500/10 border border-red-500/20" :
          "bg-yellow-500/10 border border-yellow-500/20"
        }`}>
          {isGoodDeal ? (
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          ) : isBadDeal ? (
            <TrendingUp className="w-4 h-4 text-red-400" />
          ) : (
            <Minus className="w-4 h-4 text-yellow-400" />
          )}
          <span className={`text-sm font-medium ${
            isGoodDeal ? "text-emerald-400" :
            isBadDeal ? "text-red-400" :
            "text-yellow-400"
          }`}>
            {Number(diff) > 0 ? `+${diff}%` : `${diff}%`} em relação ao mercado
          </span>
        </div>
      )}

      {priceVerdict && (
        <p className="text-sm text-muted-foreground mt-3">{priceVerdict}</p>
      )}
    </motion.div>
  );
}