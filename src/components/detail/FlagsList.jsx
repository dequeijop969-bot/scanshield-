import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FlagsList({ redFlags = [], greenFlags = [] }) {
  if (redFlags.length === 0 && greenFlags.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400 text-sm">Sinais de Alerta</h3>
          </div>
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {greenFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400 text-sm">Pontos Positivos</h3>
          </div>
          <ul className="space-y-2">
            {greenFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}