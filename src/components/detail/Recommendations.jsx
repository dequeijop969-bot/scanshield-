import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function Recommendations({ recommendations = [] }) {
  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-5 rounded-2xl bg-accent/5 border border-accent/15"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-accent text-sm">Recomendações</h3>
      </div>
      <ul className="space-y-2.5">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
              {i + 1}
            </span>
            {rec}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}